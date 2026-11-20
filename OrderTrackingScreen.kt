package com.mharegaam.rasoi.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.SoupKitchen
import androidx.compose.material.icons.filled.TwoWheeler
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.R
import com.mharegaam.rasoi.data.model.OrderStatus
import com.mharegaam.rasoi.data.model.OrderType
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
fun OrderTrackingScreen(
    orderId: String,
    viewModel: RestaurantViewModel,
    modifier: Modifier = Modifier
) {
    val activeOrder by viewModel.activeOrder.collectAsState()
    val pastOrders by viewModel.pastOrders.collectAsState()
    val order = activeOrder ?: pastOrders.find { it.id == orderId }

    if (order == null) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(BackgroundCream),
            contentAlignment = Alignment.Center
        ) {
            Text("Order not found", color = TextDark)
        }
        return
    }

    val currentStatus = order.status

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundCream)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Status Hero Banner
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Estimated Time: ${order.estimatedMinutes} mins",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = TerracottaDark
                        )
                        Text(
                            text = currentStatus.description,
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(TerracottaPrimary.copy(alpha = 0.12f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = order.orderType.displayName,
                            color = TerracottaPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Progress Bar
                val progressFraction = (currentStatus.stepIndex.toFloat() / 5f).coerceIn(0.1f, 1f)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(SurfaceBorder)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(fraction = progressFraction)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(TerracottaPrimary)
                    )
                }
            }
        }

        // 2. Chulha Stages Timeline
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Rasoi Live Progress / चूल्हे का हाल",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(16.dp))

                TimelineStep(
                    title = "Order Confirmed",
                    subtitle = "Kitchen received your order",
                    icon = Icons.Default.Check,
                    isCompleted = currentStatus.stepIndex >= 1,
                    isCurrent = currentStatus.stepIndex == 1
                )

                TimelineStep(
                    title = "Cooking on Firewood Chulha",
                    subtitle = "Baking fresh Bajra & Missi rotis with pure Desi Ghee",
                    icon = Icons.Default.LocalFireDepartment,
                    isCompleted = currentStatus.stepIndex >= 2,
                    isCurrent = currentStatus.stepIndex == 2
                )

                TimelineStep(
                    title = "Simmering in Clay Handi",
                    subtitle = "Clay pot slow dum aroma infused",
                    icon = Icons.Default.SoupKitchen,
                    isCompleted = currentStatus.stepIndex >= 3,
                    isCurrent = currentStatus.stepIndex == 3
                )

                TimelineStep(
                    title = "Packed in Earthen Pots",
                    subtitle = "Eco-friendly clay & leaf packaging sealed hot",
                    icon = Icons.Default.Fastfood,
                    isCompleted = currentStatus.stepIndex >= 4,
                    isCurrent = currentStatus.stepIndex == 4
                )

                TimelineStep(
                    title = if (order.orderType == OrderType.DINE_IN) "Served at Your Baithak" else "Out for Delivery",
                    subtitle = if (order.orderType == OrderType.DINE_IN) "Piping hot on your table" else "Rider on the way with your food",
                    icon = Icons.Default.TwoWheeler,
                    isCompleted = currentStatus.stepIndex >= 5,
                    isCurrent = currentStatus.stepIndex == 5,
                    isLast = true
                )
            }
        }

        // 3. Demo Simulator Button
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = DesiGheeGold.copy(alpha = 0.12f)),
            border = androidx.compose.foundation.BorderStroke(1.dp, DesiGheeGold.copy(alpha = 0.4f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Demo Simulation",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = TerracottaDark
                    )
                    Text(
                        text = "Advance order step to preview next stage",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }

                Button(
                    onClick = { viewModel.advanceOrderStatusDemo(order.id) },
                    colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Text("Advance Stage", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // 4. Restaurant Contact / Chef Call
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .border(1.dp, TerracottaPrimary, CircleShape)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.restaurant_logo),
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "Mhare Gaam Ki Rasoi",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextDark
                        )
                        Text(
                            text = "Helpdesk & Orders: +91 89797 53636",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }
                }

                OutlinedButton(
                    onClick = { /* Call Restaurant */ },
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, TerracottaPrimary)
                ) {
                    Icon(
                        imageVector = Icons.Default.Call,
                        contentDescription = null,
                        tint = TerracottaPrimary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Call Restaurant", color = TerracottaPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // 5. Order Summary
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Items in this Order (${order.items.size})",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(8.dp))

                order.items.forEach { item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "${item.quantity}x ${item.menuItem.name}",
                            fontSize = 13.sp,
                            color = TextDark
                        )
                        Text(
                            text = "₹${item.totalPrice.toInt()}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TerracottaDark
                        )
                    }
                }

                Divider(modifier = Modifier.padding(vertical = 10.dp), color = SurfaceBorder)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Total Paid (${order.paymentMethod.title.split(" ")[0]})", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = TextDark)
                    Text(text = "₹${order.totalAmount.toInt()}", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TerracottaPrimary)
                }
            }
        }
    }
}

@Composable
fun TimelineStep(
    title: String,
    subtitle: String,
    icon: ImageVector,
    isCompleted: Boolean,
    isCurrent: Boolean,
    isLast: Boolean = false
) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            isCompleted -> VegGreen
                            isCurrent -> TerracottaPrimary
                            else -> SurfaceBorder
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isCompleted || isCurrent) Color.White else TextMuted,
                    modifier = Modifier.size(16.dp)
                )
            }

            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(36.dp)
                        .background(if (isCompleted) VegGreen else SurfaceBorder)
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.padding(bottom = if (isLast) 0.dp else 16.dp)) {
            Text(
                text = title,
                fontWeight = if (isCurrent || isCompleted) FontWeight.Bold else FontWeight.Medium,
                fontSize = 13.sp,
                color = if (isCurrent) TerracottaPrimary else TextDark
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = TextSecondary
            )
        }
    }
}
