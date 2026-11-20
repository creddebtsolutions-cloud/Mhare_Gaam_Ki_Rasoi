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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import com.mharegaam.rasoi.data.model.OrderType
import com.mharegaam.rasoi.ui.components.QuantitySelector
import com.mharegaam.rasoi.ui.components.VegNonVegBadge
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
fun CartScreen(
    viewModel: RestaurantViewModel,
    onNavigateToCheckout: (OrderType) -> Unit,
    onNavigateToMenu: () -> Unit,
    modifier: Modifier = Modifier
) {
    val cartItems by viewModel.cartItems.collectAsState()
    val appliedPromo by viewModel.appliedPromo.collectAsState()
    val subtotal by viewModel.cartSubtotal.collectAsState()

    var selectedOrderType by remember { mutableStateOf(OrderType.DELIVERY) }
    var promoInput by remember { mutableStateOf("") }

    val discount = when (appliedPromo) {
        "GAAM100" -> 100.0
        "DESIGHEE" -> (subtotal * 0.15).coerceAtMost(120.0)
        else -> 0.0
    }
    val tax = subtotal * 0.05
    val packingFee = if (selectedOrderType == OrderType.DELIVERY) 25.0 else 0.0
    val deliveryFee = if (selectedOrderType == OrderType.DELIVERY) {
        if (subtotal >= 499.0) 0.0 else 40.0
    } else 0.0
    val grandTotal = (subtotal - discount + tax + packingFee + deliveryFee).coerceAtLeast(0.0)

    if (cartItems.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(BackgroundCream)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(TerracottaPrimary.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingBag,
                        contentDescription = null,
                        tint = TerracottaPrimary,
                        modifier = Modifier.size(50.dp)
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                Text(
                    text = "Your Rasoi Thali is Empty",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "Add some hot Bajra Roti, Sarson Saag, Handi Dal or Churma!",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = onNavigateToMenu,
                    colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(48.dp)
                ) {
                    Text(
                        text = "Browse Rasoi Menu",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    } else {
        LazyColumn(
            modifier = modifier
                .fillMaxSize()
                .background(BackgroundCream),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Order Type Switcher (Delivery vs Dine-In vs Takeaway)
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        OrderType.values().forEach { type ->
                            val isSelected = selectedOrderType == type
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) TerracottaPrimary else Color.Transparent)
                                    .clickable { selectedOrderType = type }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = type.displayName.split(" ")[0],
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = if (isSelected) Color.White else TextDark
                                    )
                                    Text(
                                        text = type.hindiName.split(" ")[0],
                                        fontSize = 10.sp,
                                        color = if (isSelected) Color.White.copy(alpha = 0.85f) else TextSecondary
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 2. Cart Items
            items(cartItems, key = { it.id }) { item ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Row(modifier = Modifier.weight(1f)) {
                                VegNonVegBadge(isVeg = item.menuItem.isVeg, modifier = Modifier.padding(top = 2.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = item.menuItem.name,
                                        fontFamily = FontFamily.Serif,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = TextDark
                                    )
                                    Text(
                                        text = "₹${item.unitPrice.toInt()} each",
                                        fontSize = 12.sp,
                                        color = TextSecondary
                                    )

                                    if (item.selectedAddOns.isNotEmpty()) {
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = "Add-ons: " + item.selectedAddOns.joinToString(", ") { it.name },
                                            fontSize = 11.sp,
                                            color = TerracottaPrimary,
                                            fontWeight = FontWeight.Medium
                                        )
                                    }

                                    if (item.cookingInstructions.isNotBlank()) {
                                        Text(
                                            text = "Note: ${item.cookingInstructions}",
                                            fontSize = 11.sp,
                                            color = TextMuted
                                        )
                                    }
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "₹${item.totalPrice.toInt()}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = TerracottaDark
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                QuantitySelector(
                                    quantity = item.quantity,
                                    onIncrease = { viewModel.updateCartQuantity(item.id, item.quantity + 1) },
                                    onDecrease = { viewModel.updateCartQuantity(item.id, item.quantity - 1) }
                                )
                            }
                        }
                    }
                }
            }

            // 3. Coupons & Promo Section
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocalOffer,
                                contentDescription = null,
                                tint = TerracottaPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Coupons & Offers",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextDark
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        if (appliedPromo != null) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(VegGreen.copy(alpha = 0.1f))
                                    .border(1.dp, VegGreen, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Coupon '$appliedPromo' Applied! 🎉",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = VegGreen
                                    )
                                    Text(
                                        text = "Saving ₹${discount.toInt()} on this order",
                                        fontSize = 11.sp,
                                        color = TextDark
                                    )
                                }

                                IconButton(
                                    onClick = { viewModel.removePromoCode() },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Remove",
                                        tint = TextMuted,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        } else {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                OutlinedTextField(
                                    value = promoInput,
                                    onValueChange = { promoInput = it.uppercase() },
                                    placeholder = { Text("Enter coupon (GAAM100)", fontSize = 12.sp) },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(8.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedContainerColor = Color.White,
                                        unfocusedContainerColor = Color.White,
                                        focusedBorderColor = TerracottaPrimary,
                                        unfocusedBorderColor = SurfaceBorder
                                    ),
                                    singleLine = true
                                )

                                Spacer(modifier = Modifier.width(8.dp))

                                Button(
                                    onClick = {
                                        if (promoInput.isNotBlank()) {
                                            viewModel.applyPromoCode(promoInput)
                                            promoInput = ""
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Apply", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // 4. Bill Details Breakdown
            item {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Bill Details / बिल का विवरण",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextDark
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        BillRow(title = "Item Total", value = "₹${subtotal.toInt()}")

                        if (discount > 0) {
                            BillRow(title = "Coupon Discount", value = "-₹${discount.toInt()}", valueColor = VegGreen)
                        }

                        if (selectedOrderType == OrderType.DELIVERY) {
                            BillRow(title = "Desi Clay Pot & Safe Packaging", value = "₹${packingFee.toInt()}")
                            BillRow(
                                title = "Delivery Fee",
                                value = if (deliveryFee == 0.0) "FREE" else "₹${deliveryFee.toInt()}",
                                valueColor = if (deliveryFee == 0.0) VegGreen else TextDark
                            )
                        }

                        BillRow(title = "Govt. Taxes (GST 5%)", value = "₹${tax.toInt()}")

                        Divider(modifier = Modifier.padding(vertical = 10.dp), color = SurfaceBorder)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Grand Total",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = TerracottaDark
                            )
                            Text(
                                text = "₹${grandTotal.toInt()}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = TerracottaPrimary
                            )
                        }
                    }
                }
            }

            // 5. Checkout Action Button
            item {
                Button(
                    onClick = { onNavigateToCheckout(selectedOrderType) },
                    colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "₹${grandTotal.toInt()}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Text(
                                text = "TOTAL",
                                fontSize = 10.sp,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Proceed to Checkout",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Icon(
                                imageVector = Icons.Default.ArrowForward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BillRow(
    title: String,
    value: String,
    valueColor: Color = TextDark
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = title, fontSize = 13.sp, color = TextSecondary)
        Text(text = value, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = valueColor)
    }
}
