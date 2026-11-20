package com.mharegaam.rasoi.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mharegaam.rasoi.data.model.AddOnOption
import com.mharegaam.rasoi.data.model.CartItem
import com.mharegaam.rasoi.data.model.Category
import com.mharegaam.rasoi.data.model.MenuItem
import com.mharegaam.rasoi.data.model.Order
import com.mharegaam.rasoi.data.model.OrderType
import com.mharegaam.rasoi.data.model.PaymentMethod
import com.mharegaam.rasoi.data.model.SeatingPreference
import com.mharegaam.rasoi.data.model.SpiceLevel
import com.mharegaam.rasoi.data.model.TableBooking
import com.mharegaam.rasoi.data.repository.MenuRepository
import com.mharegaam.rasoi.data.repository.OrderRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class RestaurantViewModel(
    private val menuRepository: MenuRepository = MenuRepository(),
    private val orderRepository: OrderRepository = OrderRepository()
) : ViewModel() {

    // Menu state
    val categories: List<Category> = menuRepository.categories
    private val _selectedCategoryId = MutableStateFlow("all")
    val selectedCategoryId: StateFlow<String> = _selectedCategoryId.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _vegOnlyFilter = MutableStateFlow(false)
    val vegOnlyFilter: StateFlow<Boolean> = _vegOnlyFilter.asStateFlow()

    val filteredMenuItems: StateFlow<List<MenuItem>> = combine(
        _selectedCategoryId,
        _searchQuery,
        _vegOnlyFilter
    ) { categoryId, query, vegOnly ->
        var items = if (categoryId == "all") {
            menuRepository.menuItems
        } else {
            menuRepository.getItemsByCategory(categoryId)
        }

        if (query.isNotBlank()) {
            items = items.filter {
                it.name.contains(query, ignoreCase = true) ||
                        it.hindiName.contains(query, ignoreCase = true) ||
                        it.description.contains(query, ignoreCase = true)
            }
        }

        if (vegOnly) {
            items = items.filter { it.isVeg }
        }

        items
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), menuRepository.menuItems)

    val bestSellers: List<MenuItem> = menuRepository.menuItems.filter { it.isBestseller }
    val villageSpecials: List<MenuItem> = menuRepository.menuItems.filter { it.isVillageSpecial }

    // Item Detail / Customization Dialog
    private val _detailItem = MutableStateFlow<MenuItem?>(null)
    val detailItem: StateFlow<MenuItem?> = _detailItem.asStateFlow()

    // Cart state
    val cartItems: StateFlow<List<CartItem>> = orderRepository.cartItems
    val appliedPromo: StateFlow<String?> = orderRepository.appliedPromo
    val totalCartCount: StateFlow<Int> = cartItems.combine(cartItems) { items, _ ->
        items.sumOf { it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val cartSubtotal: StateFlow<Double> = cartItems.combine(cartItems) { _, _ ->
        orderRepository.calculateSubtotal()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    // Orders state
    val activeOrder: StateFlow<Order?> = orderRepository.activeOrder
    val pastOrders: StateFlow<List<Order>> = orderRepository.orders
    val tableBookings: StateFlow<List<TableBooking>> = orderRepository.tableBookings

    // Messages
    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    fun selectCategory(categoryId: String) {
        _selectedCategoryId.value = categoryId
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun toggleVegOnly() {
        _vegOnlyFilter.value = !_vegOnlyFilter.value
    }

    fun openItemDetail(item: MenuItem) {
        _detailItem.value = item
    }

    fun closeItemDetail() {
        _detailItem.value = null
    }

    fun quickAddToCart(item: MenuItem) {
        orderRepository.addToCart(item = item, quantity = 1)
        _toastMessage.value = "Added ${item.name} to Thali!"
    }

    fun addCustomizedToCart(
        item: MenuItem,
        quantity: Int,
        addOns: List<AddOnOption>,
        spiceLevel: SpiceLevel,
        instructions: String
    ) {
        orderRepository.addToCart(
            item = item,
            quantity = quantity,
            addOns = addOns,
            spiceLevel = spiceLevel,
            instructions = instructions
        )
        closeItemDetail()
        _toastMessage.value = "Added ${item.name} with village customizations!"
    }

    fun updateCartQuantity(cartItemId: String, quantity: Int) {
        orderRepository.updateQuantity(cartItemId, quantity)
    }

    fun removeFromCart(cartItemId: String) {
        orderRepository.removeFromCart(cartItemId)
    }

    fun applyPromoCode(code: String) {
        val (success, msg) = orderRepository.applyPromoCode(code)
        _toastMessage.value = msg
    }

    fun removePromoCode() {
        orderRepository.removePromoCode()
        _toastMessage.value = "Promo code removed"
    }

    fun clearToast() {
        _toastMessage.value = null
    }

    fun placeOrder(
        orderType: OrderType,
        deliveryAddress: String,
        tableNumber: String?,
        paymentMethod: PaymentMethod
    ): Order {
        val order = orderRepository.placeOrder(
            orderType = orderType,
            deliveryAddress = deliveryAddress,
            tableNumber = tableNumber,
            paymentMethod = paymentMethod
        )

        // Simulate status progression for demonstration
        viewModelScope.launch {
            delay(12000)
            orderRepository.advanceOrderStatus(order.id)
            delay(15000)
            orderRepository.advanceOrderStatus(order.id)
            delay(20000)
            orderRepository.advanceOrderStatus(order.id)
        }

        return order
    }

    fun advanceOrderStatusDemo(orderId: String) {
        orderRepository.advanceOrderStatus(orderId)
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
        val booking = orderRepository.bookTable(name, phone, guests, date, timeSlot, seating, specialNotes)
        _toastMessage.value = "Baithak Reserved! Code: ${booking.bookingCode}"
        return booking
    }
}
