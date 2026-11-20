package com.mharegaam.rasoi.data.model

data class CartItem(
    val id: String,
    val menuItem: MenuItem,
    var quantity: Int = 1,
    val selectedAddOns: List<AddOnOption> = emptyList(),
    val chosenSpiceLevel: SpiceLevel = SpiceLevel.MEDIUM,
    val cookingInstructions: String = ""
) {
    val unitPrice: Double
        get() = menuItem.price + selectedAddOns.sumOf { it.price }

    val totalPrice: Double
        get() = unitPrice * quantity
}
