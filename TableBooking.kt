package com.mharegaam.rasoi.data.model

enum class SeatingPreference(val title: String, val hindiTitle: String, val iconDesc: String) {
    CHARPAI_COT("Village Charpai / Khatiya", "देसी खाट / चारपाई बैठक", "Outdoor breezy seating under neem trees"),
    TRADITIONAL_CHOWKI("Floor Chowki Baithak", "जमीन पर पारंपरिक चौकी बैठक", "Cross-legged authentic traditional dining"),
    ROYAL_FAMILY_TABLE("Heritage Family Wooden Table", "परिवारिक लकड़ी की मेज", "Comfortable rustic wooden tables for groups")
}

data class TableBooking(
    val id: String,
    val customerName: String,
    val phoneNumber: String,
    val guestsCount: Int,
    val bookingDate: String,
    val timeSlot: String,
    val seatingPreference: SeatingPreference,
    val specialNotes: String = "",
    val bookingCode: String = "MGKR-${(1000..9999).random()}",
    val status: String = "Confirmed"
)
