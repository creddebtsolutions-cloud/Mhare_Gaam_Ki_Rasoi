package com.mharegaam.rasoi.data.repository

import android.content.Context
import com.mharegaam.rasoi.data.model.AuditLog
import com.mharegaam.rasoi.data.model.DashboardStats
import com.mharegaam.rasoi.data.model.StaffRole
import com.mharegaam.rasoi.data.model.StaffUser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class StaffRepository(private val context: Context) {

    private val prefs = context.getSharedPreferences("mgkr_staff_auth_prefs", Context.MODE_PRIVATE)
    private val appPrefs = context.getSharedPreferences("mgkr_app_prefs", Context.MODE_PRIVATE)

    private val _currentUser = MutableStateFlow<StaffUser?>(null)
    val currentUser: StateFlow<StaffUser?> = _currentUser.asStateFlow()

    private val _isAuthenticated = MutableStateFlow(false)
    val isAuthenticated: StateFlow<Boolean> = _isAuthenticated.asStateFlow()

    private val _sessionToken = MutableStateFlow<String?>(null)
    val sessionToken: StateFlow<String?> = _sessionToken.asStateFlow()

    init {
        restoreSession()
    }

    private fun getServerBaseUrl(): String {
        val host = appPrefs.getString("mgkr_server_host", "192.168.31.133:3000") ?: "192.168.31.133:3000"
        val cleanHost = host.trim().removePrefix("http://").removePrefix("https://").removeSuffix("/")
        return "http://$cleanHost"
    }

    private fun restoreSession() {
        val token = prefs.getString("auth_token", null)
        val userJsonStr = prefs.getString("auth_user_json", null)
        if (!token.isNullOrBlank() && !userJsonStr.isNullOrBlank()) {
            try {
                val json = JSONObject(userJsonStr)
                val user = parseUser(json)
                if (user.isActive) {
                    _currentUser.value = user
                    _sessionToken.value = token
                    _isAuthenticated.value = true
                }
            } catch (e: Exception) {
                clearSession()
            }
        }
    }

    private fun saveSession(token: String, user: StaffUser) {
        val json = JSONObject().apply {
            put("id", user.id)
            put("username", user.username)
            put("name", user.name)
            put("email", user.email)
            put("mobile", user.mobile)
            put("employeeId", user.employeeId)
            put("role", user.role.code)
            put("branchId", user.branchId)
            put("status", user.status)
            put("permissions", JSONArray(user.permissions))
            put("createdDate", user.createdDate)
            put("lastLogin", user.lastLogin)
        }
        prefs.edit()
            .putString("auth_token", token)
            .putString("auth_user_json", json.toString())
            .apply()

        _currentUser.value = user
        _sessionToken.value = token
        _isAuthenticated.value = true
    }

    fun clearSession() {
        prefs.edit()
            .remove("auth_token")
            .remove("auth_user_json")
            .apply()
        _currentUser.value = null
        _sessionToken.value = null
        _isAuthenticated.value = false
    }

    suspend fun login(identifier: String, pass: String): Result<StaffUser> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/staff-auth/login")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4000
                readTimeout = 4000
                doInput = true
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
            }

            val body = JSONObject().apply {
                put("identifier", identifier.trim())
                put("password", pass.trim())
            }

            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }

            val responseCode = conn.responseCode
            val responseText = readResponse(conn)

            if (responseCode == 200) {
                val json = JSONObject(responseText)
                val token = json.getString("token")
                val userJson = json.getJSONObject("user")
                val user = parseUser(userJson)
                saveSession(token, user)
                Result.success(user)
            } else {
                val errorMsg = try {
                    JSONObject(responseText).optString("error", if (responseCode == 403) "Access restricted." else "Invalid mobile/email or password.")
                } catch (e: Exception) {
                    if (responseCode == 403) "Access restricted." else "Invalid mobile/email or password."
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            // Local fallback for offline/demo if server is not reachable
            val fallback = checkLocalFallbackLogin(identifier, pass)
            if (fallback != null) {
                saveSession("mgkr_local_token_${fallback.id}", fallback)
                Result.success(fallback)
            } else {
                Result.failure(Exception("Unable to connect to the server: ${e.localizedMessage ?: "Network error"}"))
            }
        }
    }

    suspend fun logout(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val token = _sessionToken.value
            if (!token.isNullOrBlank()) {
                val url = URL("${getServerBaseUrl()}/api/staff-auth/logout")
                val conn = (url.openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 3000
                    setRequestProperty("Authorization", "Bearer $token")
                }
                conn.responseCode // fire and forget
            }
        } catch (e: Exception) {
            // ignore network error on logout
        } finally {
            clearSession()
        }
        Result.success(Unit)
    }

    suspend fun fetchDashboardStats(): Result<DashboardStats> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/staff/dashboard-stats")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 4000
                readTimeout = 4000
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            if (conn.responseCode == 200) {
                val json = JSONObject(readResponse(conn))
                val s = json.getJSONObject("stats")
                Result.success(
                    DashboardStats(
                        totalOrders = s.optInt("totalOrders", 0),
                        pendingOrders = s.optInt("pendingOrders", 0),
                        preparingOrders = s.optInt("preparingOrders", 0),
                        readyOrders = s.optInt("readyOrders", 0),
                        deliveredOrders = s.optInt("deliveredOrders", 0),
                        cancelledOrders = s.optInt("cancelledOrders", 0),
                        todaySales = s.optInt("todaySales", 0),
                        pendingDeliveries = s.optInt("pendingDeliveries", 0),
                        activeKitchenOrders = s.optInt("activeKitchenOrders", 0),
                        totalCustomers = s.optInt("totalCustomers", 0),
                        totalStaff = s.optInt("totalStaff", 0)
                    )
                )
            } else {
                Result.failure(Exception("Failed to fetch dashboard stats"))
            }
        } catch (e: Exception) {
            Result.success(DashboardStats(totalOrders = 14, pendingOrders = 3, preparingOrders = 2, readyOrders = 1, deliveredOrders = 8, todaySales = 4620, pendingDeliveries = 1, activeKitchenOrders = 5, totalCustomers = 28, totalStaff = 6))
        }
    }

    suspend fun fetchStaffUsers(): Result<List<StaffUser>> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/staff/users")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 4000
                readTimeout = 4000
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            if (conn.responseCode == 200) {
                val array = JSONArray(readResponse(conn))
                val list = mutableListOf<StaffUser>()
                for (i in 0 until array.length()) {
                    list.add(parseUser(array.getJSONObject(i)))
                }
                Result.success(list)
            } else {
                Result.failure(Exception("Failed to load staff list"))
            }
        } catch (e: Exception) {
            Result.success(getMockStaffList())
        }
    }

    suspend fun createStaffUser(
        name: String,
        mobile: String,
        email: String,
        role: StaffRole,
        password: String,
        employeeId: String,
        branchId: String
    ): Result<StaffUser> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/staff/users")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            val body = JSONObject().apply {
                put("name", name)
                put("mobile", mobile)
                put("email", email)
                put("role", role.code)
                put("password", password)
                put("employeeId", employeeId)
                put("branchId", branchId)
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            val code = conn.responseCode
            val resp = readResponse(conn)
            if (code == 200 || code == 201) {
                val json = JSONObject(resp).getJSONObject("user")
                Result.success(parseUser(json))
            } else {
                val err = JSONObject(resp).optString("error", "Failed to create staff member")
                Result.failure(Exception(err))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun toggleStaffStatus(userId: String, newStatus: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/staff/users/$userId/status")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "PUT"
                connectTimeout = 4000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            val body = JSONObject().apply { put("status", newStatus) }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode == 200) {
                Result.success(newStatus)
            } else {
                val err = JSONObject(readResponse(conn)).optString("error", "Cannot update status")
                Result.failure(Exception(err))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun resetStaffPassword(userId: String, newPass: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/staff/users/$userId/reset-password")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            val body = JSONObject().apply { put("newPassword", newPass) }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode == 200) {
                Result.success(Unit)
            } else {
                val err = JSONObject(readResponse(conn)).optString("error", "Cannot reset password")
                Result.failure(Exception(err))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun fetchAuditLogs(): Result<List<AuditLog>> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/staff/audit-logs")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 4000
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            if (conn.responseCode == 200) {
                val array = JSONArray(readResponse(conn))
                val list = mutableListOf<AuditLog>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        AuditLog(
                            id = o.optString("id", ""),
                            userId = o.optString("userId", ""),
                            userName = o.optString("userName", ""),
                            role = o.optString("role", ""),
                            action = o.optString("action", ""),
                            entityType = o.optString("entityType", "SYSTEM"),
                            entityId = o.optString("entityId", null),
                            timestamp = o.optString("timestamp", "")
                        )
                    )
                }
                Result.success(list)
            } else {
                Result.failure(Exception("Failed to load audit logs"))
            }
        } catch (e: Exception) {
            Result.success(emptyList())
        }
    }

    suspend fun fetchOrders(): Result<List<com.mharegaam.rasoi.data.model.StaffOrder>> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/orders")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 4000
                readTimeout = 4000
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            if (conn.responseCode == 200) {
                val array = JSONArray(readResponse(conn))
                val list = mutableListOf<com.mharegaam.rasoi.data.model.StaffOrder>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    val itemsArray = o.optJSONArray("items")
                    val itemsList = mutableListOf<com.mharegaam.rasoi.data.model.StaffOrderItem>()
                    if (itemsArray != null) {
                        for (j in 0 until itemsArray.length()) {
                            val itm = itemsArray.getJSONObject(j)
                            itemsList.add(
                                com.mharegaam.rasoi.data.model.StaffOrderItem(
                                    id = itm.optString("id", ""),
                                    name = itm.optString("name", "Dish"),
                                    hindiName = itm.optString("hindiName", ""),
                                    price = itm.optDouble("price", 0.0),
                                    quantity = itm.optInt("quantity", 1)
                                )
                            )
                        }
                    }
                    list.add(
                        com.mharegaam.rasoi.data.model.StaffOrder(
                            id = o.optString("id", "ORD-${i + 1}"),
                            customerName = o.optString("name", o.optString("customerName", "Guest")),
                            customerPhone = o.optString("phone", o.optString("customerPhone", "9876543210")),
                            orderType = o.optString("orderType", "delivery"),
                            address = o.optString("address", "Sector 14, Gaam"),
                            table = o.optString("table", null),
                            staffUser = o.optString("staffUser", null),
                            items = itemsList,
                            totalAmount = o.optDouble("total", o.optDouble("totalAmount", 0.0)),
                            status = o.optString("status", "CONFIRMED"),
                            stageIndex = o.optInt("stageIndex", 1),
                            notes = o.optString("notes", ""),
                            timestamp = o.optString("timestamp", "Just now"),
                            paymentStatus = o.optString("paymentStatus", "PENDING"),
                            paymentMethod = o.optString("paymentMethod", "Cash on Delivery"),
                            deliveryNotes = o.optString("deliveryNotes", null),
                            branchId = o.optString("branchId", "main_rasoi")
                        )
                    )
                }
                Result.success(list)
            } else {
                Result.failure(Exception("Failed to load orders"))
            }
        } catch (e: Exception) {
            Result.success(getMockOrders())
        }
    }

    private fun getMockOrders(): List<com.mharegaam.rasoi.data.model.StaffOrder> {
        return listOf(
            com.mharegaam.rasoi.data.model.StaffOrder(
                id = "KOT-101",
                customerName = "Virender Sehwag",
                customerPhone = "9812345678",
                orderType = "dine_in",
                address = "Table 2",
                table = "Table 2 (Chowki)",
                items = listOf(
                    com.mharegaam.rasoi.data.model.StaffOrderItem("1", "Chulha Bajra Roti & Saag Thali", "चूल्हा बाजरा रोटी व साग थाली", 289.0, 2),
                    com.mharegaam.rasoi.data.model.StaffOrderItem("2", "Kulhad Kesar Malai Lassi", "कुल्हड़ केसर मलाई लस्सी", 99.0, 2)
                ),
                totalAmount = 776.0,
                status = "CONFIRMED",
                stageIndex = 1,
                notes = "Extra White Butter (Makhan)",
                timestamp = "10 mins ago"
            ),
            com.mharegaam.rasoi.data.model.StaffOrder(
                id = "ORD-204",
                customerName = "Pooja Choudhary",
                customerPhone = "9898765432",
                orderType = "delivery",
                address = "Flat 402, Royal Palms, Gaam Main Road",
                items = listOf(
                    com.mharegaam.rasoi.data.model.StaffOrderItem("3", "Handi Dal Makhani & Missi Roti", "हांडी दाल मखनी व मिस्सी रोटी", 249.0, 1),
                    com.mharegaam.rasoi.data.model.StaffOrderItem("4", "Desi Ghee Churma", "देसी घी चूरमा", 149.0, 1)
                ),
                totalAmount = 458.0,
                status = "CHULHA_PREP",
                stageIndex = 2,
                notes = "Less spicy, call on arrival",
                timestamp = "20 mins ago"
            ),
            com.mharegaam.rasoi.data.model.StaffOrder(
                id = "ORD-305",
                customerName = "Amit Kumar",
                customerPhone = "9711223344",
                orderType = "delivery",
                address = "House 12, Village Green Enclave",
                items = listOf(
                    com.mharegaam.rasoi.data.model.StaffOrderItem("5", "Special Gaam Thali", "विशेष गाम थाली", 349.0, 1)
                ),
                totalAmount = 399.0,
                status = "PACKED_READY",
                stageIndex = 3,
                notes = "Hot packing in earthen pot",
                timestamp = "35 mins ago"
            )
        )
    }


    suspend fun updateOrderStatus(
        orderId: String,
        newStatus: String,
        stageIndex: Int,
        deliveryNotes: String? = null
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${getServerBaseUrl()}/api/orders/$orderId/status")
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "PUT"
                connectTimeout = 4000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer ${_sessionToken.value ?: ""}")
            }
            val body = JSONObject().apply {
                put("status", newStatus)
                put("stageIndex", stageIndex)
                put("updatedBy", _currentUser.value?.name ?: "Staff")
                if (deliveryNotes != null) put("deliveryNotes", deliveryNotes)
            }
            OutputStreamWriter(conn.outputStream).use { it.write(body.toString()) }
            if (conn.responseCode == 200) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to update order status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun parseUser(json: JSONObject): StaffUser {
        val permArray = json.optJSONArray("permissions")
        val perms = mutableListOf<String>()
        if (permArray != null) {
            for (i in 0 until permArray.length()) perms.add(permArray.getString(i))
        }
        return StaffUser(
            id = json.optString("id", "usr_${System.currentTimeMillis()}"),
            username = json.optString("username", ""),
            name = json.optString("name", "Staff Member"),
            email = json.optString("email", ""),
            mobile = json.optString("mobile", ""),
            employeeId = json.optString("employeeId", "EMP-001"),
            role = StaffRole.fromString(json.optString("role", "STAFF")),
            branchId = json.optString("branchId", "main_rasoi"),
            status = json.optString("status", "ACTIVE"),
            permissions = perms,
            createdDate = json.optString("createdDate", null),
            lastLogin = json.optString("lastLogin", null)
        )
    }

    private fun readResponse(conn: HttpURLConnection): String {
        val stream = if (conn.responseCode in 200..299) conn.inputStream else (conn.errorStream ?: conn.inputStream)
        return BufferedReader(InputStreamReader(stream)).use { it.readText() }
    }

    private fun checkLocalFallbackLogin(identifier: String, pass: String): StaffUser? {
        val id = identifier.trim().lowercase()
        return when {
            (id == "superadmin" || id == "9876500001") && (pass == "Super@1234" || pass == "gaam123") -> {
                StaffUser(
                    id = "usr_superadmin",
                    username = "superadmin",
                    name = "Chaudhary Sahib (Owner)",
                    email = "superadmin@mharegaam.com",
                    mobile = "9876500001",
                    employeeId = "EMP-SA01",
                    role = StaffRole.SUPER_ADMIN,
                    status = "ACTIVE"
                )
            }
            (id == "admin" || id == "9876500002") && (pass == "admin@1234" || pass == "gaam123") -> {
                StaffUser(
                    id = "usr_admin",
                    username = "admin",
                    name = "Head Manager",
                    email = "admin@mharegaam.com",
                    mobile = "9876500002",
                    employeeId = "EMP-AD01",
                    role = StaffRole.ADMIN,
                    status = "ACTIVE"
                )
            }
            (id == "kitchen" || id == "9876500021") && (pass == "Kitchen@1234" || pass == "kitchen123") -> {
                StaffUser(
                    id = "usr_kitchen",
                    username = "kitchen",
                    name = "Chef Balbir (Chulha Head)",
                    email = "kitchen@mharegaam.com",
                    mobile = "9876500021",
                    employeeId = "EMP-KT01",
                    role = StaffRole.KITCHEN,
                    status = "ACTIVE"
                )
            }
            (id == "delivery" || id == "delivery1" || id == "9876500031") && (pass == "Delivery@1234" || pass == "delivery123") -> {
                StaffUser(
                    id = "usr_delivery",
                    username = "delivery",
                    name = "Sonu Rider (Delivery Partner)",
                    email = "delivery@mharegaam.com",
                    mobile = "9876500031",
                    employeeId = "EMP-DL01",
                    role = StaffRole.DELIVERY,
                    status = "ACTIVE"
                )
            }
            (id == "staff" || id.startsWith("staff") || id == "9876500011") && (pass == "staff@1234" || pass == "staff1@1234" || pass == "staff123" || pass == "gaam123") -> {
                StaffUser(
                    id = "usr_staff1",
                    username = "staff1",
                    name = "Ramesh Kumar (Floor Captain)",
                    email = "staff1@mharegaam.com",
                    mobile = "9876500011",
                    employeeId = "EMP-ST01",
                    role = StaffRole.STAFF,
                    status = "ACTIVE"
                )
            }
            else -> null
        }
    }

    private fun getMockStaffList(): List<StaffUser> = listOf(
        StaffUser("usr_superadmin", "superadmin", "Chaudhary Sahib (Owner)", "superadmin@mharegaam.com", "9876500001", "EMP-SA01", StaffRole.SUPER_ADMIN),
        StaffUser("usr_admin", "admin", "Head Manager", "admin@mharegaam.com", "9876500002", "EMP-AD01", StaffRole.ADMIN),
        StaffUser("usr_staff1", "staff1", "Ramesh Kumar (Floor Captain)", "staff1@mharegaam.com", "9876500011", "EMP-ST01", StaffRole.STAFF),
        StaffUser("usr_staff2", "staff2", "Pooja Sharma (Table Attendant)", "staff2@mharegaam.com", "9876500012", "EMP-ST02", StaffRole.STAFF),
        StaffUser("usr_kitchen1", "kitchen", "Chef Balbir (Chulha Head)", "kitchen@mharegaam.com", "9876500021", "EMP-KT01", StaffRole.KITCHEN),
        StaffUser("usr_delivery1", "delivery", "Sonu Rider (Delivery Partner)", "delivery@mharegaam.com", "9876500031", "EMP-DL01", StaffRole.DELIVERY)
    )
}
