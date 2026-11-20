package com.mharegaam.rasoi.data.model

import androidx.annotation.DrawableRes

enum class SpiceLevel(val label: String, val chillies: Int) {
    MILD("Mild / सौम्य", 1),
    MEDIUM("Medium / मध्यम", 2),
    SPICY("Spicy / तीखा", 3),
    DESI_TEEKHA("Gaam Style Extra Teekha / असली गाम का तड़का", 4)
}

data class AddOnOption(
    val id: String,
    val name: String,
    val hindiName: String,
    val price: Double,
    val isDefault: Boolean = false
)

data class MenuItem(
    val id: String,
    val name: String,
    val hindiName: String,
    val categoryId: String,
    val description: String,
    val price: Double,
    val originalPrice: Double? = null,
    @DrawableRes val imageRes: Int,
    val isVeg: Boolean = true,
    val isBestseller: Boolean = false,
    val isVillageSpecial: Boolean = false,
    val isDesiGheeSpecial: Boolean = false,
    val preparationTimeMin: Int = 20,
    val spiceLevel: SpiceLevel = SpiceLevel.MEDIUM,
    val rating: Float = 4.8f,
    val reviewCount: Int = 128,
    val availableAddOns: List<AddOnOption> = emptyList(),
    val isAvailable: Boolean = true
)
