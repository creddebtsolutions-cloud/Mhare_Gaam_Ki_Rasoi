package com.mharegaam.rasoi.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Home : Screen("home")
    object Menu : Screen("menu")
    object Cart : Screen("cart")
    object Checkout : Screen("checkout")
    object TableBooking : Screen("table_booking")
    object Orders : Screen("orders")
    object OrderSuccess : Screen("order_success/{orderId}") {
        fun createRoute(orderId: String) = "order_success/$orderId"
    }
    object OrderTracking : Screen("order_tracking/{orderId}") {
        fun createRoute(orderId: String) = "order_tracking/$orderId"
    }
    object AdminPortal : Screen("admin_portal")
    object StaffLogin : Screen("staff_login")
    object SuperAdminDashboard : Screen("super_admin_dashboard")
    object AdminDashboard : Screen("admin_dashboard")
    object KitchenDashboard : Screen("kitchen_dashboard")
    object DeliveryDashboard : Screen("delivery_dashboard")
    object StaffDashboard : Screen("staff_dashboard")
    object StaffManagement : Screen("staff_management")
    object AuditLogs : Screen("audit_logs")
}
