package com.mharegaam.rasoi.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.data.model.AddOnOption
import com.mharegaam.rasoi.data.model.MenuItem
import com.mharegaam.rasoi.data.model.SpiceLevel
import com.mharegaam.rasoi.ui.components.DesiGheeBadge
import com.mharegaam.rasoi.ui.components.QuantitySelector
import com.mharegaam.rasoi.ui.components.VegNonVegBadge
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.theme.SurfaceBorder
import com.mharegaam.rasoi.ui.theme.SurfaceWarm
import com.mharegaam.rasoi.ui.theme.TerracottaDark
import com.mharegaam.rasoi.ui.theme.TerracottaPrimary
import com.mharegaam.rasoi.ui.theme.TextDark
import com.mharegaam.rasoi.ui.theme.TextMuted
import com.mharegaam.rasoi.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemDetailDialog(
    item: MenuItem,
    onDismiss: () -> Unit,
    onAddCustomized: (
        item: MenuItem,
        quantity: Int,
        addOns: List<AddOnOption>,
        spiceLevel: SpiceLevel,
        instructions: String
    ) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var quantity by remember { mutableIntStateOf(1) }
    var selectedSpice by remember { mutableStateOf(item.spiceLevel) }
    val selectedAddOns = remember { mutableStateListOf<AddOnOption>() }
    var instructions by remember { mutableStateOf("") }

    val basePrice = item.price
    val addOnsPrice = selectedAddOns.sumOf { it.price }
    val totalPrice = (basePrice + addOnsPrice) * quantity

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = BackgroundCream,
        dragHandle = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 24.dp)
        ) {
            // Header Image & Close Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
            ) {
                Image(
                    painter = painterResource(id = item.imageRes),
                    contentDescription = item.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth()
                )

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.Black.copy(alpha = 0.5f))
                        .size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Column(modifier = Modifier.padding(16.dp)) {
                // Title and Badges
                Row(verticalAlignment = Alignment.CenterVertically) {
                    VegNonVegBadge(isVeg = item.isVeg)
                    Spacer(modifier = Modifier.width(8.dp))
                    if (item.isDesiGheeSpecial) {
                        DesiGheeBadge()
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = item.name,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = TextDark
                )

                Text(
                    text = item.hindiName,
                    fontSize = 14.sp,
                    color = TextSecondary,
                    fontWeight = FontWeight.Medium
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = item.description,
                    fontSize = 13.sp,
                    color = TextSecondary,
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Spice Level Selector
                Text(
                    text = "Choose Spice Level / तीखापन चुनें",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TerracottaDark
                )

                Spacer(modifier = Modifier.height(6.dp))

                SpiceLevel.values().forEach { level ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedSpice = level }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedSpice == level,
                            onClick = { selectedSpice = level },
                            colors = RadioButtonDefaults.colors(selectedColor = TerracottaPrimary)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = level.label,
                            fontSize = 13.sp,
                            color = TextDark
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Village Add-Ons (Ghee, Butter, Gur, Chutney)
                if (item.availableAddOns.isNotEmpty()) {
                    Text(
                        text = "Gaam Add-ons / अतिरिक्त स्वाद",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = TerracottaDark
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    item.availableAddOns.forEach { addon ->
                        val isChecked = selectedAddOns.contains(addon)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    if (isChecked) selectedAddOns.remove(addon) else selectedAddOns.add(addon)
                                }
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Checkbox(
                                    checked = isChecked,
                                    onCheckedChange = { checked ->
                                        if (checked) selectedAddOns.add(addon) else selectedAddOns.remove(addon)
                                    },
                                    colors = CheckboxDefaults.colors(checkedColor = TerracottaPrimary)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text(
                                        text = addon.name,
                                        fontSize = 13.sp,
                                        color = TextDark
                                    )
                                    Text(
                                        text = addon.hindiName,
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                            }

                            Text(
                                text = "+₹${addon.price.toInt()}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = TerracottaPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Special Instructions for Chulha Chef
                Text(
                    text = "Special Note for Chulha Chef (Optional)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = TerracottaDark
                )

                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = instructions,
                    onValueChange = { instructions = it },
                    placeholder = {
                        Text(
                            "e.g. Extra crisp roti, less green chilli, separate butter...",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White,
                        focusedBorderColor = TerracottaPrimary,
                        unfocusedBorderColor = SurfaceBorder
                    ),
                    maxLines = 2
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Quantity and Add to Thali Button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    QuantitySelector(
                        quantity = quantity,
                        onIncrease = { quantity++ },
                        onDecrease = { if (quantity > 1) quantity-- }
                    )

                    Spacer(modifier = Modifier.width(16.dp))

                    Button(
                        onClick = {
                            onAddCustomized(item, quantity, selectedAddOns.toList(), selectedSpice, instructions)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                    ) {
                        Text(
                            text = "Add to Thali • ₹${totalPrice.toInt()}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}
