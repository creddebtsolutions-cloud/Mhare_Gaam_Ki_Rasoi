package com.mharegaam.rasoi

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import com.mharegaam.rasoi.ui.components.RusticSideDrawer
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.mharegaam.rasoi.data.model.OrderType
import com.mharegaam.rasoi.ui.components.CartFloatingBar
import com.mharegaam.rasoi.ui.components.RusticBottomNav
import com.mharegaam.rasoi.ui.components.RusticTopAppBar
import com.mharegaam.rasoi.ui.navigation.Screen
import com.mharegaam.rasoi.ui.screens.AdminPortalScreen
import com.mharegaam.rasoi.ui.screens.CartScreen
import com.mharegaam.rasoi.ui.screens.CheckoutScreen
import com.mharegaam.rasoi.ui.screens.HomeScreen
import com.mharegaam.rasoi.ui.screens.ItemDetailDialog
import com.mharegaam.rasoi.ui.screens.MenuScreen
import com.mharegaam.rasoi.ui.screens.OrderSuccessScreen
import com.mharegaam.rasoi.ui.screens.OrderTrackingScreen
import com.mharegaam.rasoi.ui.screens.OrdersScreen
import com.mharegaam.rasoi.ui.screens.SplashScreen
import com.mharegaam.rasoi.ui.screens.TableBookingScreen
import com.mharegaam.rasoi.data.model.StaffRole
import com.mharegaam.rasoi.ui.screens.staff.AdminDashboardScreen
import com.mharegaam.rasoi.ui.screens.staff.AuditLogsScreen
import com.mharegaam.rasoi.ui.screens.staff.DeliveryDashboardScreen
import com.mharegaam.rasoi.ui.screens.staff.KitchenDashboardScreen
import com.mharegaam.rasoi.ui.screens.staff.StaffDashboardScreen
import com.mharegaam.rasoi.ui.screens.staff.StaffLoginScreen
import com.mharegaam.rasoi.ui.screens.staff.StaffManagementScreen
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.viewmodel.RestaurantViewModel
import com.mharegaam.rasoi.ui.viewmodel.StaffViewModel

@Composable
fun MhareGaamApp(
    viewModel: RestaurantViewModel = viewModel(),
    staffViewModel: StaffViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val context = LocalContext.current

    val cartCount by viewModel.totalCartCount.collectAsState()
    val cartSubtotal by viewModel.cartSubtotal.collectAsState()
    val detailItem by viewModel.detailItem.collectAsState()
    val toastMessage by viewModel.toastMessage.collectAsState()

    // Handle toast messages
    LaunchedEffect(toastMessage) {
        toastMessage?.let {
            Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            viewModel.clearToast()
        }
    }

    val isFullScreen = currentRoute == Screen.Splash.route ||
            currentRoute == Screen.AdminPortal.route ||
            currentRoute == Screen.StaffLogin.route ||
            currentRoute == Screen.SuperAdminDashboard.route ||
            currentRoute == Screen.AdminDashboard.route ||
            currentRoute == Screen.KitchenDashboard.route ||
            currentRoute == Screen.DeliveryDashboard.route ||
            currentRoute == Screen.StaffDashboard.route ||
            currentRoute == Screen.StaffManagement.route ||
            currentRoute == Screen.AuditLogs.route ||
            currentRoute?.startsWith("order_success") == true

    val showBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.Menu.route,
        Screen.TableBooking.route,
        Screen.Orders.route
    )

    val showFloatingCart = (currentRoute == Screen.Home.route || currentRoute == Screen.Menu.route) && cartCount > 0

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()
    val currentUser by staffViewModel.currentUser.collectAsState()

    ModalNavigationDrawer(
        drawerState = drawerState,
        gesturesEnabled = !isFullScreen,
        drawerContent = {
            ModalDrawerSheet(
                drawerContainerColor = BackgroundCream
            ) {
                RusticSideDrawer(
                    currentUser = currentUser,
                    onCloseDrawer = {
                        coroutineScope.launch { drawerState.close() }
                    },
                    onAdminLoginClick = {
                        coroutineScope.launch { drawerState.close() }
                        navController.navigate(Screen.AdminPortal.route)
                    },
                    onStaffLoginClick = {
                        coroutineScope.launch { drawerState.close() }
                        if (currentUser?.isFloorStaff == true) {
                            navController.navigate(Screen.StaffDashboard.route)
                        } else {
                            staffViewModel.setTargetRole(StaffRole.STAFF)
                            navController.navigate(Screen.StaffLogin.route)
                        }
                    },
                    onKitchenLoginClick = {
                        coroutineScope.launch { drawerState.close() }
                        if (currentUser?.isKitchen == true) {
                            navController.navigate(Screen.KitchenDashboard.route)
                        } else {
                            staffViewModel.setTargetRole(StaffRole.KITCHEN)
                            navController.navigate(Screen.StaffLogin.route)
                        }
                    },
                    onDeliveryLoginClick = {
                        coroutineScope.launch { drawerState.close() }
                        if (currentUser?.isDelivery == true) {
                            navController.navigate(Screen.DeliveryDashboard.route)
                        } else {
                            staffViewModel.setTargetRole(StaffRole.DELIVERY)
                            navController.navigate(Screen.StaffLogin.route)
                        }
                    },
                    onLogoutClick = {
                        coroutineScope.launch { drawerState.close() }
                        staffViewModel.logout {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    }
                )
            }
        }
    ) {
        Scaffold(
            topBar = {
                if (!isFullScreen) {
                    val showBack = currentRoute !in listOf(
                        Screen.Home.route,
                        Screen.TableBooking.route,
                        Screen.Orders.route
                    )
                    val title = when (currentRoute) {
                        Screen.Menu.route -> "Rasoi Menu • रसोई"
                        Screen.Cart.route -> "Your Thali • थाली"
                        Screen.Checkout.route -> "Checkout • भुगतान"
                        Screen.TableBooking.route -> "Baithak Booking"
                        Screen.Orders.route -> "My Orders"
                        else -> if (currentRoute?.startsWith("order_tracking") == true) "Live Chulha Tracker" else null
                    }

                    RusticTopAppBar(
                        title = title,
                        showBackButton = showBack,
                        onBackClick = { navController.popBackStack() },
                        cartItemCount = cartCount,
                        onCartClick = {
                            if (currentRoute != Screen.Cart.route) {
                                navController.navigate(Screen.Cart.route)
                            }
                        },
                        onLogoClick = {
                            coroutineScope.launch { drawerState.open() }
                        },
                        onAdminClick = {
                            navController.navigate(Screen.AdminPortal.route)
                        }
                    )
                }
            },
        bottomBar = {
            if (showBottomBar) {
                RusticBottomNav(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        if (currentRoute != route) {
                            navController.navigate(route) {
                                popUpTo(Screen.Home.route) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    }
                )
            }
        },
        containerColor = BackgroundCream
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(BackgroundCream)
        ) {
            NavHost(
                navController = navController,
                startDestination = Screen.Splash.route
            ) {
                composable(Screen.Splash.route) {
                    SplashScreen(
                        onSplashFinished = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.Home.route) {
                    HomeScreen(
                        viewModel = viewModel,
                        onNavigateToMenu = { navController.navigate(Screen.Menu.route) },
                        onNavigateToBooking = { navController.navigate(Screen.TableBooking.route) },
                        onNavigateToCart = { navController.navigate(Screen.Cart.route) },
                        onNavigateToAdmin = { navController.navigate(Screen.AdminPortal.route) }
                    )
                }

                composable(Screen.Menu.route) {
                    MenuScreen(viewModel = viewModel)
                }

                composable(Screen.TableBooking.route) {
                    TableBookingScreen(viewModel = viewModel)
                }

                composable(Screen.Orders.route) {
                    OrdersScreen(
                        viewModel = viewModel,
                        onTrackOrder = { orderId ->
                            navController.navigate(Screen.OrderTracking.createRoute(orderId))
                        },
                        onBrowseMenu = { navController.navigate(Screen.Menu.route) },
                        onNavigateToAdmin = { navController.navigate(Screen.AdminPortal.route) }
                    )
                }

                composable(Screen.Cart.route) {
                    CartScreen(
                        viewModel = viewModel,
                        onNavigateToCheckout = { orderType ->
                            navController.navigate(Screen.Checkout.route)
                        },
                        onNavigateToMenu = { navController.navigate(Screen.Menu.route) }
                    )
                }

                composable(Screen.Checkout.route) {
                    CheckoutScreen(
                        orderType = OrderType.DELIVERY,
                        viewModel = viewModel,
                        onOrderPlaced = { order ->
                            navController.navigate(Screen.OrderSuccess.createRoute(order.id)) {
                                popUpTo(Screen.Home.route)
                            }
                        }
                    )
                }

                composable(
                    route = Screen.OrderSuccess.route,
                    arguments = listOf(navArgument("orderId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
                    OrderSuccessScreen(
                        orderId = orderId,
                        onTrackOrder = {
                            navController.navigate(Screen.OrderTracking.createRoute(orderId)) {
                                popUpTo(Screen.Home.route)
                            }
                        },
                        onHomeClick = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { inclusive = true }
                            }
                        }
                    )
                }

                composable(
                    route = Screen.OrderTracking.route,
                    arguments = listOf(navArgument("orderId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val orderId = backStackEntry.arguments?.getString("orderId") ?: ""
                    OrderTrackingScreen(
                        orderId = orderId,
                        viewModel = viewModel
                    )
                }

                composable(Screen.AdminPortal.route) {
                    AdminPortalScreen(
                        onNavigateBack = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { inclusive = false }
                            }
                        }
                    )
                }

                composable(Screen.StaffLogin.route) {
                    StaffLoginScreen(
                        viewModel = staffViewModel,
                        onNavigateBack = { navController.popBackStack() },
                        onRoleAuthenticated = { role ->
                            val targetRoute = when (role) {
                                StaffRole.SUPER_ADMIN -> Screen.SuperAdminDashboard.route
                                StaffRole.ADMIN -> Screen.AdminDashboard.route
                                StaffRole.STAFF -> Screen.StaffDashboard.route
                                StaffRole.KITCHEN -> Screen.KitchenDashboard.route
                                StaffRole.DELIVERY -> Screen.DeliveryDashboard.route
                            }
                            navController.navigate(targetRoute) {
                                popUpTo(Screen.Home.route)
                            }
                        }
                    )
                }

                composable(Screen.SuperAdminDashboard.route) {
                    AdminDashboardScreen(
                        viewModel = staffViewModel,
                        isSuperAdmin = true,
                        onNavigateToStaffManagement = { navController.navigate(Screen.StaffManagement.route) },
                        onNavigateToKitchen = { navController.navigate(Screen.KitchenDashboard.route) },
                        onNavigateToDelivery = { navController.navigate(Screen.DeliveryDashboard.route) },
                        onNavigateToStaffPOS = { navController.navigate(Screen.StaffDashboard.route) },
                        onNavigateToAuditLogs = { navController.navigate(Screen.AuditLogs.route) },
                        onLogout = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.AdminDashboard.route) {
                    AdminDashboardScreen(
                        viewModel = staffViewModel,
                        isSuperAdmin = false,
                        onNavigateToStaffManagement = { navController.navigate(Screen.StaffManagement.route) },
                        onNavigateToKitchen = { navController.navigate(Screen.KitchenDashboard.route) },
                        onNavigateToDelivery = { navController.navigate(Screen.DeliveryDashboard.route) },
                        onNavigateToStaffPOS = { navController.navigate(Screen.StaffDashboard.route) },
                        onNavigateToAuditLogs = { navController.navigate(Screen.AuditLogs.route) },
                        onLogout = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.KitchenDashboard.route) {
                    KitchenDashboardScreen(
                        viewModel = staffViewModel,
                        onLogout = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.DeliveryDashboard.route) {
                    DeliveryDashboardScreen(
                        viewModel = staffViewModel,
                        onLogout = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.StaffDashboard.route) {
                    StaffDashboardScreen(
                        viewModel = staffViewModel,
                        onLogout = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.StaffManagement.route) {
                    StaffManagementScreen(
                        viewModel = staffViewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }

                composable(Screen.AuditLogs.route) {
                    AuditLogsScreen(
                        viewModel = staffViewModel,
                        onNavigateBack = { navController.popBackStack() }
                    )
                }
            }

            // Floating Sticky Cart bar
            if (showFloatingCart) {
                CartFloatingBar(
                    totalItems = cartCount,
                    subtotal = cartSubtotal,
                    onViewCart = { navController.navigate(Screen.Cart.route) },
                    modifier = Modifier.align(Alignment.BottomCenter)
                )
            }

            // Customization Modal Sheet
            detailItem?.let { item ->
                ItemDetailDialog(
                    item = item,
                    onDismiss = { viewModel.closeItemDetail() },
                    onAddCustomized = { selectedItem, quantity, addOns, spice, instructions ->
                        viewModel.addCustomizedToCart(selectedItem, quantity, addOns, spice, instructions)
                    }
                )
            }
        }
    }
}
}
