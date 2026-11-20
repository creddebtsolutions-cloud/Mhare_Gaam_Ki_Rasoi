package com.mharegaam.rasoi.data.model

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class OrderType(val displayName: String, val hindiName: String) {
    DELIVERY("Home Delivery", "घर पर डिलीवरी"),
    DINE_IN("Dine-In (Table / Baithak)", "बैठक में भोजन"),
    TAKEAWAY("Takeaway", "पार्सल / ले जाएं")
}

enum class OrderStatus(val title: String, val hindiTitle: String, val stepIndex: Int, val description: String) {
    CONFIRMED("Order Placed", "ऑर्डर दर्ज हुआ", 1, "Chulha chef received your order"),
    CHULHA_PREP("Cooking on Chulha", "मिट्टी के चूल्हे पर पक रहा है", 2, "Freshly prepared with pure Desi Ghee"),
    HANDI_SIMMER("Simmering in Handi", "हांडी में सौंधा दम लग रहा है", 3, "Clay pot aroma infusion in progress"),
    PACKED_READY("Packed in Earthen Pots", "मिट्टी के बर्तनों में पैक", 4, "Kept hot, fresh, and ready to serve"),
    OUT_FOR_DELIVERY("Out for Delivery", "आपके द्वार की ओर रवाना", 5, "Arriving hot to give you ghar jaisa swaad"),
    DELIVERED("Delivered & Enjoyed", "पहुंच गया - भोजन का आनंद लें", 6, "Thank you for dining with Mhare Gaam Ki Rasoi!")
}

enum class PaymentMethod(val title: String, val subtitle: String) {
    UPI("UPI (GPay / PhonePe / Paytm)", "Instant payment with zero fees"),
    CASH("Cash on Delivery / Table Pay", "Pay after receiving your food"),
    CARD("Credit / Debit Card", "Visa, Mastercard, RuPay")
}

data class Order(
    val id: String,
    val items: List<CartItem>,
    val subtotal: Double,
    val packingCharge: Double = 25.0,
    val deliveryFee: Double = 40.0,
    val taxGst: Double,
    val discount: Double = 0.0,
    val totalAmount: Double,
    val orderType: OrderType = OrderType.DELIVERY,
    val deliveryAddress: String = "Plot 42, Green Avenue, Sector 14",
    val tableNumber: String? = null,
    val status: OrderStatus = OrderStatus.CONFIRMED,
    val timestamp: Long = System.currentTimeMillis(),
    val estimatedMinutes: Int = 35,
    val paymentMethod: PaymentMethod = PaymentMethod.UPI,
    val promoCodeApplied: String? = null
) {
    val formattedTime: String
        get() {
            val sdf = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
            return sdf.format(Date(timestamp))
        }
}
