package com.mharegaam.rasoi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.data.model.SeatingPreference
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.theme.DesiGheeGold
import com.mharegaam.rasoi.ui.theme.SurfaceBorder
import com.mharegaam.rasoi.ui.theme.SurfaceWarm
import com.mharegaam.rasoi.ui.theme.TerracottaDark
import com.mharegaam.rasoi.ui.theme.TerracottaPrimary
import com.mharegaam.rasoi.ui.theme.TextDark
import com.mharegaam.rasoi.ui.theme.TextMuted
import com.mharegaam.rasoi.ui.theme.TextSecondary
import com.mharegaam.rasoi.ui.theme.VegGreen
import com.mharegaam.rasoi.ui.viewmodel.RestaurantViewModel

@Composable
fun TableBookingScreen(
    viewModel: RestaurantViewModel,
    modifier: Modifier = Modifier
) {
    val bookings by viewModel.tableBookings.collectAsState()

    var customerName by remember { mutableStateOf("") }
    var customerPhone by remember { mutableStateOf("") }
    var guestsCount by remember { mutableIntStateOf(4) }
    var selectedDate by remember { mutableStateOf("Today, Evening") }
    var selectedTimeSlot by remember { mutableStateOf("08:00 PM") }
    var selectedSeating by remember { mutableStateOf(SeatingPreference.CHARPAI_COT) }
    var specialNote by remember { mutableStateOf("") }
    var latestBookingCode by remember { mutableStateOf<String?>(null) }

    val dateOptions = listOf("Today, Evening", "Tomorrow", "Sunday Feast", "Custom Date")
    val timeOptions = listOf("01:00 PM", "02:00 PM", "07:30 PM", "08:30 PM", "09:30 PM")

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundCream)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Header Banner
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Gaam Baithak Booking",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = TerracottaDark
                )
                Text(
                    text = "देसी खाट, चौकी व पारिवारिक बैठक का आनंद लें",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Reserve your private village dining space with live folk ambiance, neem shade, and piping hot chulha food served straight to your khatiya.",
                    fontSize = 12.sp,
                    color = TextDark,
                    lineHeight = 17.sp
                )
            }
        }

        // Latest Booking Confirmation Card (if any)
        if (latestBookingCode != null) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = VegGreen.copy(alpha = 0.08f)),
                border = androidx.compose.foundation.BorderStroke(1.5.dp, VegGreen)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = VegGreen,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Baithak Confirmed! Pass: $latestBookingCode",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = VegGreen
                        )
                        Text(
                            text = "$guestsCount Guests • $selectedTimeSlot • ${selectedSeating.title}",
                            fontSize = 12.sp,
                            color = TextDark
                        )
                    }
                }
            }
        }

        // 2. Select Seating Preference
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Select Village Seating Style",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(10.dp))

                SeatingPreference.values().forEach { seating ->
                    val isSelected = selectedSeating == seating
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) TerracottaPrimary.copy(alpha = 0.08f) else Color.Transparent)
                            .border(
                                width = 1.dp,
                                color = if (isSelected) TerracottaPrimary else SurfaceBorder,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable { selectedSeating = seating }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = when (seating) {
                                SeatingPreference.CHARPAI_COT -> "🛏️"
                                SeatingPreference.TRADITIONAL_CHOWKI -> "🪵"
                                SeatingPreference.ROYAL_FAMILY_TABLE -> "🪑"
                            },
                            fontSize = 24.sp
                        )

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Text(
                                text = seating.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = if (isSelected) TerracottaPrimary else TextDark
                            )
                            Text(
                                text = seating.hindiTitle,
                                fontSize = 11.sp,
                                color = TextSecondary,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = seating.iconDesc,
                                fontSize = 11.sp,
                                color = TextMuted
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }

        // 3. Guest Count Selector
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = TerracottaPrimary)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Number of Guests: $guestsCount Persons",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = TextDark
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf(2, 4, 6, 8, 12).forEach { count ->
                        val isSelected = guestsCount == count
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) TerracottaPrimary else Color.White)
                                .border(1.dp, if (isSelected) TerracottaPrimary else SurfaceBorder, RoundedCornerShape(10.dp))
                            .clickable { guestsCount = count },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "$count",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = if (isSelected) Color.White else TextDark
                            )
                        }
                    }
                }
            }
        }

        // 4. Date and Time Slot
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.CalendarToday, contentDescription = null, tint = TerracottaPrimary, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Choose Date", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(dateOptions) { date ->
                        val isSelected = selectedDate == date
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isSelected) TerracottaPrimary else Color.White)
                                .border(1.dp, if (isSelected) TerracottaPrimary else SurfaceBorder, RoundedCornerShape(16.dp))
                                .clickable { selectedDate = date }
                                .padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = date,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isSelected) Color.White else TextDark
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.Schedule, contentDescription = null, tint = TerracottaPrimary, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Choose Time Slot", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                }

                Spacer(modifier = Modifier.height(8.dp))

                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(timeOptions) { slot ->
                        val isSelected = selectedTimeSlot == slot
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isSelected) TerracottaPrimary else Color.White)
                                .border(1.dp, if (isSelected) TerracottaPrimary else SurfaceBorder, RoundedCornerShape(16.dp))
                                .clickable { selectedTimeSlot = slot }
                                .padding(horizontal = 14.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = slot,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isSelected) Color.White else TextDark
                            )
                        }
                    }
                }
            }
        }

        // 5. Contact Details
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Reservation Details", fontFamily = FontFamily.Serif, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = customerName,
                    onValueChange = { customerName = it },
                    label = { Text("Guest Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = TerracottaPrimary, unfocusedBorderColor = SurfaceBorder),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = customerPhone,
                    onValueChange = { customerPhone = it },
                    label = { Text("Phone Number") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = TerracottaPrimary, unfocusedBorderColor = SurfaceBorder),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = specialNote,
                    onValueChange = { specialNote = it },
                    label = { Text("Special Requests (e.g. Birthday, Neem Tree shade)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = TerracottaPrimary, unfocusedBorderColor = SurfaceBorder),
                    maxLines = 2
                )
            }
        }

        // 6. Action Button
        Button(
            onClick = {
                val name = if (customerName.isBlank()) "Gaurav Singh" else customerName
                val phone = if (customerPhone.isBlank()) "8979753636" else customerPhone
                val booking = viewModel.bookTable(
                    name = name,
                    phone = phone,
                    guests = guestsCount,
                    date = selectedDate,
                    timeSlot = selectedTimeSlot,
                    seating = selectedSeating,
                    specialNotes = specialNote
                )
                latestBookingCode = booking.bookingCode
            },
            colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
        ) {
            Text(
                text = "Reserve Village Baithak",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }
    }
}
