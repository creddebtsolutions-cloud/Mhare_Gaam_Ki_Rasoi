package com.mharegaam.rasoi.data.repository

import com.mharegaam.rasoi.data.model.AddOnOption
import com.mharegaam.rasoi.data.model.CartItem
import com.mharegaam.rasoi.data.model.MenuItem
import com.mharegaam.rasoi.data.model.Order
import com.mharegaam.rasoi.data.model.OrderStatus
import com.mharegaam.rasoi.data.model.OrderType
import com.mharegaam.rasoi.data.model.PaymentMethod
import com.mharegaam.rasoi.data.model.SeatingPreference
import com.mharegaam.rasoi.data.model.SpiceLevel
import com.mharegaam.rasoi.data.model.TableBooking
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class OrderRepository {

    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    private val _appliedPromo = MutableStateFlow<String?>(null)
    val appliedPromo: StateFlow<String?> = _appliedPromo.asStateFlow()

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private val _activeOrder = MutableStateFlow<Order?>(null)
    val activeOrder: StateFlow<Order?> = _activeOrder.asStateFlow()

    private val _tableBookings = MutableStateFlow<List<TableBooking>>(emptyList())
    val tableBookings: StateFlow<List<TableBooking>> = _tableBookings.asStateFlow()

    fun addToCart(
        item: MenuItem,
        quantity: Int = 1,
        addOns: List<AddOnOption> = emptyList(),
        spiceLevel: SpiceLevel = item.spiceLevel,
        instructions: String = ""
    ) {
        val current = _cartItems.value.toMutableList()
        val existingIndex = current.indexOfFirst {
            it.menuItem.id == item.id && it.selectedAddOns == addOns && it.chosenSpiceLevel == spiceLevel
        }

        if (existingIndex >= 0) {
            val existing = current[existingIndex]
            current[existingIndex] = existing.copy(quantity = existing.quantity + quantity)
        } else {
            current.add(
                CartItem(
                    id = UUID.randomUUID().toString(),
                    menuItem = item,
                    quantity = quantity,
                    selectedAddOns = addOns,
                    chosenSpiceLevel = spiceLevel,
                    cookingInstructions = instructions
                )
            )
        }
        _cartItems.value = current
    }

    fun updateQuantity(cartItemId: String, newQuantity: Int) {
        val current = _cartItems.value.toMutableList()
        val index = current.indexOfFirst { it.id == cartItemId }
        if (index >= 0) {
            if (newQuantity <= 0) {
                current.removeAt(index)
            } else {
                current[index] = current[index].copy(quantity = newQuantity)
            }
            _cartItems.value = current
        }
    }

    fun removeFromCart(cartItemId: String) {
        _cartItems.value = _cartItems.value.filterNot { it.id == cartItemId }
    }

    fun clearCart() {
        _cartItems.value = emptyList()
        _appliedPromo.value = null
    }

    fun applyPromoCode(code: String): Pair<Boolean, String> {
        val subtotal = calculateSubtotal()
        val cleanCode = code.trim().uppercase()
        return when (cleanCode) {
            "GAAM100" -> {
                if (subtotal >= 399.0) {
                    _appliedPromo.value = cleanCode
                    Pair(true, "Coupon GAAM100 applied! ₹100 Flat Off.")
                } else {
                    Pair(false, "Add items worth ₹${(399.0 - subtotal).toInt()} more to use GAAM100")
                }
            }
            "DESIGHEE" -> {
                if (subtotal >= 249.0) {
                    _appliedPromo.value = cleanCode
                    Pair(true, "Coupon DESIGHEE applied! 15% Off.")
                } else {
                    Pair(false, "Minimum order ₹249 for DESIGHEE")
                }
            }
            else -> Pair(false, "Invalid coupon code. Try 'GAAM100' or 'DESIGHEE'")
        }
    }

    fun removePromoCode() {
        _appliedPromo.value = null
    }

    fun calculateSubtotal(): Double {
        return _cartItems.value.sumOf { it.totalPrice }
    }

    fun calculateDiscount(): Double {
        val subtotal = calculateSubtotal()
        return when (_appliedPromo.value) {
            "GAAM100" -> 100.0
            "DESIGHEE" -> (subtotal * 0.15).coerceAtMost(120.0)
            else -> 0.0
        }
    }

    fun calculateTaxes(subtotal: Double): Double {
        return (subtotal * 0.05) // 5% GST
    }

    fun placeOrder(
        orderType: OrderType,
        deliveryAddress: String,
        tableNumber: String?,
        paymentMethod: PaymentMethod
    ): Order {
        val items = _cartItems.value
        val subtotal = calculateSubtotal()
        val discount = calculateDiscount()
        val tax = calculateTaxes(subtotal)
        val packing = if (orderType == OrderType.DELIVERY) 25.0 else 0.0
        val delivery = if (orderType == OrderType.DELIVERY) 40.0 else 0.0
        val total = (subtotal - discount + tax + packing + delivery).coerceAtLeast(0.0)

        val newOrder = Order(
            id = "MGK-${(100000..999999).random()}",
            items = items,
            subtotal = subtotal,
            packingCharge = packing,
            deliveryFee = delivery,
            taxGst = tax,
            discount = discount,
            totalAmount = total,
            orderType = orderType,
            deliveryAddress = deliveryAddress,
            tableNumber = tableNumber,
            status = OrderStatus.CONFIRMED,
            estimatedMinutes = if (orderType == OrderType.DINE_IN) 20 else 35,
            paymentMethod = paymentMethod,
            promoCodeApplied = _appliedPromo.value
        )

        _activeOrder.value = newOrder
        _orders.value = listOf(newOrder) + _orders.value
        clearCart()
        return newOrder
    }

    fun advanceOrderStatus(orderId: String) {
        val order = _activeOrder.value ?: return
        if (order.id == orderId) {
            val nextStatus = when (order.status) {
                OrderStatus.CONFIRMED -> OrderStatus.CHULHA_PREP
                OrderStatus.CHULHA_PREP -> OrderStatus.HANDI_SIMMER
                OrderStatus.HANDI_SIMMER -> OrderStatus.PACKED_READY
                OrderStatus.PACKED_READY -> if (order.orderType == OrderType.DINE_IN) OrderStatus.DELIVERED else OrderStatus.OUT_FOR_DELIVERY
                OrderStatus.OUT_FOR_DELIVERY -> OrderStatus.DELIVERED
                OrderStatus.DELIVERED -> OrderStatus.DELIVERED
            }
            val updated = order.copy(status = nextStatus)
            _activeOrder.value = updated
            _orders.value = _orders.value.map { if (it.id == orderId) updated else it }
        }
    }

    fun bookTable(
        name: String,
        phone: String,
        guests: Int,
        date: String,
        timeSlot: String,
        seating: SeatingPreference,
        specialNotes: String
    ): TableBooking {
        val booking = TableBooking(
            id = UUID.randomUUID().toString(),
            customerName = name,
            phoneNumber = phone,
            guestsCount = guests,
            bookingDate = date,
            timeSlot = timeSlot,
            seatingPreference = seating,
            specialNotes = specialNotes
        )
        _tableBookings.value = listOf(booking) + _tableBookings.value
        return booking
    }
}
