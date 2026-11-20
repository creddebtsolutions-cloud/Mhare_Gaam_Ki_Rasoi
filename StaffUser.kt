package com.mharegaam.rasoi.data.model

enum class StaffRole(val code: String, val title: String, val hindiTitle: String, val icon: String) {
    SUPER_ADMIN("SUPER_ADMIN", "Super Admin", "मुख्य संचालक", "👑"),
    ADMIN("ADMIN", "Admin / Manager", "प्रबंधक", "🛡️"),
    STAFF("STAFF", "Floor Staff (POS)", "कर्मचारी / वेटर", "🍽️"),
    KITCHEN("KITCHEN", "Kitchen Master (KDS)", "रसोई चूल्हा मास्टर", "🔥"),
    DELIVERY("DELIVERY", "Delivery Partner", "डिलीवरी राइडर", "🛵");

    companion object {
        fun fromString(value: String?): StaffRole {
            val v = (value ?: "").trim().uppercase()
            return when {
                v == "SUPER_ADMIN" || v.contains("SUPER") -> SUPER_ADMIN
                v == "ADMIN" || v.contains("MASTER ADMIN") || v.contains("MANAGER") -> ADMIN
                v == "KITCHEN" || v.contains("CHULHA") || v.contains("KDS") -> KITCHEN
                v == "DELIVERY" || v.contains("RIDER") -> DELIVERY
                else -> STAFF
            }
        }
    }
}

object StaffPermissions {
    const val DASHBOARD_VIEW = "dashboard.view"
    const val USERS_MANAGE = "users.manage"
    const val STAFF_VIEW = "staff.view"
    const val STAFF_CREATE = "staff.create"
    const val STAFF_UPDATE = "staff.update"
    const val STAFF_DISABLE = "staff.disable"
    const val KITCHEN_VIEW = "kitchen.view"
    const val KITCHEN_UPDATE = "kitchen.update"
    const val DELIVERY_VIEW = "delivery.view"
    const val DELIVERY_ASSIGN = "delivery.assign"
    const val DELIVERY_UPDATE = "delivery.update"
    const val MENU_VIEW = "menu.view"
    const val MENU_CREATE = "menu.create"
    const val MENU_UPDATE = "menu.update"
    const val MENU_DELETE = "menu.delete"
    const val CATEGORIES_MANAGE = "categories.manage"
    const val ORDERS_VIEW = "orders.view"
    const val ORDERS_CREATE = "orders.create"
    const val ORDERS_UPDATE = "orders.update"
    const val ORDERS_CANCEL = "orders.cancel"
    const val ORDERS_STATUS = "orders.status"
    const val BOOKINGS_MANAGE = "bookings.manage"
    const val CUSTOMERS_VIEW = "customers.view"
    const val CUSTOMERS_UPDATE = "customers.update"
    const val REPORTS_VIEW = "reports.view"
    const val REPORTS_SALES = "reports.sales"
    const val REPORTS_PAYMENTS = "reports.payments"
    const val REPORTS_DELIVERY = "reports.delivery"
    const val REPORTS_KITCHEN = "reports.kitchen"
    const val NOTIFICATIONS_MANAGE = "notifications.manage"
    const val OFFERS_MANAGE = "offers.manage"
    const val SETTINGS_VIEW = "settings.view"
    const val SETTINGS_UPDATE = "settings.update"
    const val BRANCH_MANAGE = "branch.manage"
    const val ROLES_MANAGE = "roles.manage"
}

data class StaffUser(
    val id: String,
    val username: String,
    val name: String,
    val email: String,
    val mobile: String,
    val employeeId: String = "EMP-001",
    val role: StaffRole = StaffRole.STAFF,
    val branchId: String = "main_rasoi",
    val status: String = "ACTIVE", // ACTIVE or DISABLED
    val permissions: List<String> = emptyList(),
    val createdDate: String? = null,
    val lastLogin: String? = null
) {
    val isActive: Boolean get() = status.equals("ACTIVE", ignoreCase = true)

    fun hasPermission(permission: String): Boolean {
        if (!isActive) return false
        if (role == StaffRole.SUPER_ADMIN) return true
        return permissions.contains(permission)
    }

    val isSuperAdmin: Boolean get() = role == StaffRole.SUPER_ADMIN
    val isAdmin: Boolean get() = role == StaffRole.ADMIN || role == StaffRole.SUPER_ADMIN
    val isKitchen: Boolean get() = role == StaffRole.KITCHEN
    val isDelivery: Boolean get() = role == StaffRole.DELIVERY
    val isFloorStaff: Boolean get() = role == StaffRole.STAFF
}

data class DashboardStats(
    val totalOrders: Int = 0,
    val pendingOrders: Int = 0,
    val preparingOrders: Int = 0,
    val readyOrders: Int = 0,
    val deliveredOrders: Int = 0,
    val cancelledOrders: Int = 0,
    val todaySales: Int = 0,
    val pendingDeliveries: Int = 0,
    val activeKitchenOrders: Int = 0,
    val totalCustomers: Int = 0,
    val totalStaff: Int = 0
)

data class AuditLog(
    val id: String,
    val userId: String,
    val userName: String,
    val role: String,
    val action: String,
    val entityType: String = "SYSTEM",
    val entityId: String? = null,
    val timestamp: String,
    val metadata: Map<String, String> = emptyMap()
)

data class StaffOrderItem(
    val id: String = "",
    val name: String = "",
    val hindiName: String = "",
    val price: Double = 0.0,
    val quantity: Int = 1
)

data class StaffOrder(
    val id: String,
    val customerName: String = "Guest",
    val customerPhone: String = "",
    val orderType: String = "delivery", // "delivery", "dine_in", "takeaway"
    val address: String = "",
    val table: String? = null,
    val staffUser: String? = null,
    val items: List<StaffOrderItem> = emptyList(),
    val totalAmount: Double = 0.0,
    val status: String = "CONFIRMED", // "CONFIRMED", "CHULHA_PREP", "PACKED_READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "FAILED_DELIVERY"
    val stageIndex: Int = 1,
    val notes: String = "",
    val timestamp: String = "",
    val paymentStatus: String = "PENDING",
    val paymentMethod: String = "Cash on Delivery",
    val deliveryNotes: String? = null,
    val branchId: String = "main_rasoi"
) {
    val isDineIn: Boolean get() = orderType.equals("dine_in", ignoreCase = true)
    val isDelivery: Boolean get() = orderType.equals("delivery", ignoreCase = true)
    val isTakeaway: Boolean get() = orderType.equals("takeaway", ignoreCase = true)
}

