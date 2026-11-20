package com.mharegaam.rasoi.ui.screens.staff

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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DeliveryDining
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material.icons.filled.TableBar
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.data.model.DashboardStats
import com.mharegaam.rasoi.data.model.StaffRole
import com.mharegaam.rasoi.data.model.StaffUser
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

private data class MetricCardData(
    val title: String,
    val hindiTitle: String,
    val value: String,
    val accentColor: Color,
    val icon: String
)

private data class QuickActionItem(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val iconBgColor: Color,
    val onClick: () -> Unit
)

@Composable
fun AdminDashboardScreen(
    viewModel: StaffViewModel,
    isSuperAdmin: Boolean,
    onNavigateToStaffManagement: () -> Unit,
    onNavigateToKitchen: () -> Unit,
    onNavigateToDelivery: () -> Unit,
    onNavigateToStaffPOS: () -> Unit,
    onNavigateToAuditLogs: () -> Unit,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val stats by viewModel.dashboardStats.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()
    var showLogoutDialog by remember { mutableStateOf(false) }

    val roleLabel = if (isSuperAdmin) "SUPER ADMIN" else "ADMIN / MANAGER"
    val roleHindi = if (isSuperAdmin) "मुख्य प्रशासक (Super Admin)" else "शाखा प्रबंधक (Admin)"

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = {
                Text(
                    text = "Sign Out from Staff Console?",
                    fontWeight = FontWeight.Bold,
                    color = TerracottaDark
                )
            },
            text = {
                Text(
                    text = "Are you sure you want to log out? You will be safely returned to the customer portal.",
                    color = TextDark
                )
            },
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
        // Top Header
        AdminTopHeader(
            userName = currentUser?.name ?: "Admin User",
            employeeId = currentUser?.employeeId ?: "EMP-001",
            roleLabel = roleLabel,
            roleHindi = roleHindi,
            isSuperAdmin = isSuperAdmin,
            isRefreshing = isRefreshing,
            onRefresh = { viewModel.refreshAll() },
            onLogoutClick = { showLogoutDialog = true }
        )

        // Main Content Area
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Live Operational Highlights
            item {
                Text(
                    text = "Operational Metrics • लाइव डैशबोर्ड",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TerracottaDark
                )
            }

            // Metrics Cards in a 2-column or 3-column flow
            item {
                MetricsSection(stats = stats)
            }

            // Quick Operational Workspaces
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Operational Modules • प्रबंधन विभाग",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TerracottaDark
                )
            }

            item {
                val actions = listOfNotNull(
                    QuickActionItem(
                        title = "Kitchen Display (KDS)",
                        subtitle = "Live Chulha prep & orders",
                        icon = Icons.Default.Restaurant,
                        iconBgColor = NonVegRed,
                        onClick = onNavigateToKitchen
                    ),
                    QuickActionItem(
                        title = "Delivery Fleet",
                        subtitle = "Rider tracking & dispatch",
                        icon = Icons.Default.DeliveryDining,
                        iconBgColor = DesiGheeGold,
                        onClick = onNavigateToDelivery
                    ),
                    QuickActionItem(
                        title = "Floor POS & Tables",
                        subtitle = "In-house orders & billing",
                        icon = Icons.Default.TableBar,
                        iconBgColor = VillageGreen,
                        onClick = onNavigateToStaffPOS
                    ),
                    QuickActionItem(
                        title = "Staff Management",
                        subtitle = if (isSuperAdmin) "Add & manage all roles" else "Manage branch staff",
                        icon = Icons.Default.Group,
                        iconBgColor = ClayBrown,
                        onClick = onNavigateToStaffManagement
                    ),
                    QuickActionItem(
                        title = "Security Audit Logs",
                        subtitle = "Track logins & updates",
                        icon = Icons.Default.History,
                        iconBgColor = TerracottaDark,
                        onClick = onNavigateToAuditLogs
                    )
                )

                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    actions.forEach { action ->
                        QuickActionCard(action = action)
                    }
                }
            }

            // Branch Details Card
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(SurfaceBorder))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "🏢 Active Branch: ",
                                fontWeight = FontWeight.Bold,
                                color = TerracottaDark,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "Mhare Gaam Ki Rasoi - Main Hub (Rasoi 1)",
                                fontWeight = FontWeight.SemiBold,
                                color = TextDark,
                                fontSize = 14.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Branch Code: main_rasoi • Status: OPERATIONAL • Multi-Branch Ready",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun AdminTopHeader(
    userName: String,
    employeeId: String,
    roleLabel: String,
    roleHindi: String,
    isSuperAdmin: Boolean,
    isRefreshing: Boolean,
    onRefresh: () -> Unit,
    onLogoutClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(bottomStart = 20.dp, bottomEnd = 20.dp),
        colors = CardDefaults.cardColors(containerColor = TerracottaPrimary),
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
                        Text(
                            text = if (isSuperAdmin) "👑" else "🛡️",
                            fontSize = 20.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = roleLabel,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = DesiGheeGold,
                            letterSpacing = 1.sp
                        )
                    }
                    Text(
                        text = userName,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "$employeeId • $roleHindi",
                        fontSize = 12.sp,
                        color = Color.White.copy(alpha = 0.85f)
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onRefresh,
                        enabled = !isRefreshing
                    ) {
                        if (isRefreshing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Refresh",
                                tint = Color.White
                            )
                        }
                    }

                    IconButton(onClick = onLogoutClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = "Logout",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricsSection(stats: DashboardStats) {
    val metrics = listOf(
        MetricCardData("Today's Sales", "आज की कुल बिक्री", "₹${stats.todaySales}", DesiGheeGold, "💰"),
        MetricCardData("Total Orders", "कुल ऑर्डर्स", "${stats.totalOrders}", TerracottaDark, "📦"),
        MetricCardData("Pending Orders", "प्रतीक्षारत ऑर्डर्स", "${stats.pendingOrders}", NonVegRed, "⏳"),
        MetricCardData("Cooking in Chulha", "चूल्हे पर तैयार", "${stats.preparingOrders}", TerracottaPrimary, "🔥"),
        MetricCardData("Ready / Packed", "पैक होकर तैयार", "${stats.readyOrders}", VillageGreen, "✨"),
        MetricCardData("Delivered", "सफलतापूर्वक पहुंचा", "${stats.deliveredOrders}", VillageGreen, "✅"),
        MetricCardData("Active Deliveries", "रास्ते में डिलीवरी", "${stats.pendingDeliveries}", DesiGheeGold, "🛵"),
        MetricCardData("Active Kitchen", "रसोई में सक्रिय", "${stats.activeKitchenOrders}", TerracottaDark, "👨‍🍳"),
        MetricCardData("Active Staff", "सक्रिय कर्मचारी", "${stats.totalStaff}", ClayBrown, "👥")
    )

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        for (i in metrics.indices step 2) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    SingleMetricCard(metrics[i])
                }
                if (i + 1 < metrics.size) {
                    Box(modifier = Modifier.weight(1f)) {
                        SingleMetricCard(metrics[i + 1])
                    }
                } else {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
private fun SingleMetricCard(data: MetricCardData) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(SurfaceBorder)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = data.hindiTitle,
                    fontSize = 11.sp,
                    color = TextMuted,
                    fontWeight = FontWeight.Medium
                )
                Text(text = data.icon, fontSize = 16.sp)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = data.value,
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = data.accentColor
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = data.title,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextDark
            )
        }
    }
}

@Composable
private fun QuickActionCard(action: QuickActionItem) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { action.onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(SurfaceBorder)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(action.iconBgColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = action.icon,
                        contentDescription = action.title,
                        tint = action.iconBgColor,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text(
                        text = action.title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                    Text(
                        text = action.subtitle,
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }
            }
            Text(
                text = "➔",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TerracottaPrimary
            )
        }
    }
}
