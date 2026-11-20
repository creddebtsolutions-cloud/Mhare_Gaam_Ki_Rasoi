package com.mharegaam.rasoi.ui.screens.staff

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DeliveryDining
import androidx.compose.material.icons.filled.Directions
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.data.model.StaffOrder
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.theme.ClayBrown
import com.mharegaam.rasoi.ui.theme.DesiGheeGold
import com.mharegaam.rasoi.ui.theme.NonVegRed
import com.mharegaam.rasoi.ui.theme.SurfaceBorder
import com.mharegaam.rasoi.ui.theme.SurfaceCard
import com.mharegaam.rasoi.ui.theme.TerracottaDark
import com.mharegaam.rasoi.ui.theme.TerracottaPrimary
import com.mharegaam.rasoi.ui.theme.TextDark
import com.mharegaam.rasoi.ui.theme.TextMuted
import com.mharegaam.rasoi.ui.theme.TextSecondary
import com.mharegaam.rasoi.ui.theme.VillageGreen
import com.mharegaam.rasoi.ui.viewmodel.StaffViewModel
import java.net.URLEncoder

@Composable
fun DeliveryDashboardScreen(
    viewModel: StaffViewModel,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val currentUser by viewModel.currentUser.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }
    var showLogoutDialog by remember { mutableStateOf(false) }

    val tabTitles = listOf("ASSIGNED", "OUT FOR DELIVERY", "DELIVERED")

    // Filter delivery orders only
    val deliveryOrders = orders.filter { it.isDelivery || it.orderType.equals("delivery", ignoreCase = true) }

    val assignedOrders = deliveryOrders.filter {
        val s = it.status.uppercase()
        s == "CONFIRMED" || s == "CHULHA_PREP" || s == "PACKED_READY" || s == "READY" || s == "ASSIGNED"
    }
    val outForDeliveryOrders = deliveryOrders.filter {
        val s = it.status.uppercase()
        s == "OUT_FOR_DELIVERY" || s == "PICKED_UP"
    }
    val deliveredOrders = deliveryOrders.filter {
        val s = it.status.uppercase()
        s == "DELIVERED" || s == "FAILED_DELIVERY"
    }

    val currentList = when (selectedTab) {
        0 -> assignedOrders
        1 -> outForDeliveryOrders
        else -> deliveredOrders
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Exit Rider Console?", fontWeight = FontWeight.Bold, color = TerracottaDark) },
            text = { Text("Are you sure you want to log out from the Delivery Rider Console?", color = TextDark) },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout(onLogout)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NonVegRed)
                ) {
                    Text("Logout", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Cancel", color = TextDark)
                }
            }
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundCream)
            .statusBarsPadding()
    ) {
        // Rider Header
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp),
            colors = CardDefaults.cardColors(containerColor = DesiGheeGold),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🛵", fontSize = 22.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "RIDER DISPATCH CONSOLE",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = TerracottaDark,
                                letterSpacing = 1.sp
                            )
                        }
                        Text(
                            text = currentUser?.name ?: "Delivery Rider Partner",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TerracottaDark
                        )
                        Text(
                            text = "डिलीवरी राइडर • Active Parcels: ${assignedOrders.size + outForDeliveryOrders.size}",
                            fontSize = 12.sp,
                            color = TerracottaDark.copy(alpha = 0.85f)
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { viewModel.loadOrders() },
                            enabled = !isRefreshing
                        ) {
                            if (isRefreshing) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = TerracottaDark,
                                    strokeWidth = 2.dp
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Refresh",
                                    tint = TerracottaDark
                                )
                            }
                        }
                        IconButton(onClick = { showLogoutDialog = true }) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                                contentDescription = "Logout",
                                tint = TerracottaDark
                            )
                        }
                    }
                }
            }
        }

        // Tabs
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = SurfaceCard,
            contentColor = TerracottaPrimary,
            indicator = { tabPositions ->
                TabRowDefaults.SecondaryIndicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                    color = TerracottaPrimary,
                    height = 3.dp
                )
            }
        ) {
            tabTitles.forEachIndexed { index, title ->
                val count = when (index) {
                    0 -> assignedOrders.size
                    1 -> outForDeliveryOrders.size
                    else -> deliveredOrders.size
                }
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = "$title ($count)",
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                            color = if (selectedTab == index) TerracottaPrimary else TextMuted,
                            fontSize = 13.sp
                        )
                    }
                )
            }
        }

        // Content
        if (currentList.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = when (selectedTab) {
                            0 -> "📦"
                            1 -> "🛵"
                            else -> "✨"
                        },
                        fontSize = 48.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = when (selectedTab) {
                            0 -> "No Assigned Deliveries"
                            1 -> "No Orders Currently Out for Delivery"
                            else -> "No Completed Deliveries Yet"
                        },
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextDark
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Assigned delivery dispatches will appear here.",
                        fontSize = 13.sp,
                        color = TextMuted
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                contentPadding = PaddingValues(vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(currentList, key = { it.id }) { order ->
                    DeliveryOrderCard(
                        order = order,
                        onCallCustomer = {
                            try {
                                val intent = Intent(Intent.ACTION_DIAL).apply {
                                    data = Uri.parse("tel:${order.customerPhone.ifBlank { "9876543210" }}")
                                }
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                // Ignore if dialer not supported on device/emulator
                            }
                        },
                        onOpenMap = {
                            try {
                                val encoded = URLEncoder.encode(order.address, "UTF-8")
                                val gmmIntentUri = Uri.parse("geo:0,0?q=$encoded")
                                val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                                context.startActivity(mapIntent)
                            } catch (e: Exception) {
                                // Maps not available
                            }
                        },
                        onAcceptDelivery = {
                            viewModel.updateOrderStatus(order.id, "PICKED_UP", 4, "Rider accepted and picked up parcel")
                        },
                        onPickedUp = {
                            viewModel.updateOrderStatus(order.id, "PICKED_UP", 4, "Rider picked up parcel from Rasoi")
                        },
                        onOutForDelivery = {
                            viewModel.updateOrderStatus(order.id, "OUT_FOR_DELIVERY", 5, "Rider is en route to customer location")
                        },
                        onMarkDelivered = {
                            viewModel.updateOrderStatus(order.id, "DELIVERED", 6, "Delivered hot and fresh to customer")
                        },
                        onFailedDelivery = {
                            viewModel.updateOrderStatus(order.id, "FAILED_DELIVERY", 6, "Delivery failed - Customer unreachable")
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun DeliveryOrderCard(
    order: StaffOrder,
    onCallCustomer: () -> Unit,
    onOpenMap: () -> Unit,
    onAcceptDelivery: () -> Unit,
    onPickedUp: () -> Unit,
    onOutForDelivery: () -> Unit,
    onMarkDelivered: () -> Unit,
    onFailedDelivery: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(SurfaceBorder)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header Row: Order Number & Amount
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "DELIVERY #${order.id}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
                        color = TerracottaDark
                    )
                    Text(
                        text = "🕒 ${order.timestamp}",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(DesiGheeGold.copy(alpha = 0.2f))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "₹${order.totalAmount.toInt()}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = TerracottaDark
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            HorizontalDivider(color = SurfaceBorder)
            Spacer(modifier = Modifier.height(10.dp))

            // Customer Details with Call button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = order.customerName,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                    Text(
                        text = "📞 ${order.customerPhone.ifBlank { "9876543210" }}",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }

                Button(
                    onClick = onCallCustomer,
                    colors = ButtonDefaults.buttonColors(containerColor = VillageGreen),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(imageVector = Icons.Default.Call, contentDescription = "Call", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("CALL", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Address with Navigation
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(BackgroundCream)
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "📍 Delivery Address:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted
                    )
                    Text(
                        text = order.address,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextDark
                    )
                }
                IconButton(onClick = onOpenMap) {
                    Icon(
                        imageVector = Icons.Default.Directions,
                        contentDescription = "Navigate",
                        tint = TerracottaPrimary
                    )
                }
            }

            // Payment Status & Delivery Notes
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Payment: ${order.paymentMethod}",
                    fontSize = 12.sp,
                    color = TextMuted,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = if (order.paymentStatus == "PAID") "PAID ONLINE" else "COLLECT CASH",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (order.paymentStatus == "PAID") VillageGreen else NonVegRed
                )
            }

            if (order.notes.isNotBlank() || order.deliveryNotes != null) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "📝 Note: ${order.deliveryNotes ?: order.notes}",
                    fontSize = 12.sp,
                    color = TerracottaDark,
                    fontWeight = FontWeight.Medium
                )
            }

            // Action Buttons based on status
            Spacer(modifier = Modifier.height(14.dp))
            val s = order.status.uppercase()
            when {
                s == "CONFIRMED" || s == "CHULHA_PREP" || s == "PACKED_READY" || s == "READY" || s == "ASSIGNED" -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = onAcceptDelivery,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = DesiGheeGold)
                        ) {
                            Text("ACCEPT DELIVERY", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TerracottaDark)
                        }
                        Button(
                            onClick = onPickedUp,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary)
                        ) {
                            Text("PICKED UP", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }
                s == "PICKED_UP" -> {
                    Button(
                        onClick = onOutForDelivery,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary)
                    ) {
                        Icon(imageVector = Icons.Default.DeliveryDining, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("OUT FOR DELIVERY (रवाना)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
                s == "OUT_FOR_DELIVERY" -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = onFailedDelivery,
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = NonVegRed)
                        ) {
                            Icon(imageVector = Icons.Default.Cancel, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("FAILED", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Button(
                            onClick = onMarkDelivered,
                            modifier = Modifier.weight(1.5f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = VillageGreen)
                        ) {
                            Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("DELIVERED (पहुंचा)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
                s == "DELIVERED" -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(VillageGreen.copy(alpha = 0.12f))
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "✓ Order Delivered Successfully",
                            color = VillageGreen,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
                else -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(NonVegRed.copy(alpha = 0.12f))
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "✕ Delivery Failed / Cancelled",
                            color = NonVegRed,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}
