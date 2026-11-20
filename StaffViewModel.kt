package com.mharegaam.rasoi.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.mharegaam.rasoi.data.model.AuditLog
import com.mharegaam.rasoi.data.model.DashboardStats
import com.mharegaam.rasoi.data.model.Order
import com.mharegaam.rasoi.data.model.OrderStatus
import com.mharegaam.rasoi.data.model.StaffRole
import com.mharegaam.rasoi.data.model.StaffUser
import com.mharegaam.rasoi.data.repository.StaffRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class StaffViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = StaffRepository(application.applicationContext)

    val currentUser: StateFlow<StaffUser?> = repository.currentUser
    val isAuthenticated: StateFlow<Boolean> = repository.isAuthenticated

    private val _loginLoading = MutableStateFlow(false)
    val loginLoading: StateFlow<Boolean> = _loginLoading.asStateFlow()

    private val _loginError = MutableStateFlow<String?>(null)
    val loginError: StateFlow<String?> = _loginError.asStateFlow()

    private val _targetRole = MutableStateFlow(StaffRole.ADMIN)
    val targetRole: StateFlow<StaffRole> = _targetRole.asStateFlow()

    fun setTargetRole(role: StaffRole) {
        _targetRole.value = role
        _loginError.value = null
    }

    private val _dashboardStats = MutableStateFlow(DashboardStats())
    val dashboardStats: StateFlow<DashboardStats> = _dashboardStats.asStateFlow()

    private val _staffList = MutableStateFlow<List<StaffUser>>(emptyList())
    val staffList: StateFlow<List<StaffUser>> = _staffList.asStateFlow()

    private val _auditLogs = MutableStateFlow<List<AuditLog>>(emptyList())
    val auditLogs: StateFlow<List<AuditLog>> = _auditLogs.asStateFlow()

    private val _orders = MutableStateFlow<List<com.mharegaam.rasoi.data.model.StaffOrder>>(emptyList())
    val orders: StateFlow<List<com.mharegaam.rasoi.data.model.StaffOrder>> = _orders.asStateFlow()

    private val _statusMessage = MutableStateFlow<String?>(null)
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing.asStateFlow()

    init {
        if (repository.isAuthenticated.value) {
            refreshAll()
        }
    }

    fun login(
        identifier: String, 
        pass: String, 
        expectedRole: StaffRole? = null, 
        onSuccess: (StaffRole) -> Unit
    ) {
        if (identifier.isBlank() || pass.isBlank()) {
            _loginError.value = "Please enter Mobile Number / Email and Password"
            return
        }
        viewModelScope.launch {
            _loginLoading.value = true
            _loginError.value = null
            val result = repository.login(identifier, pass)
            _loginLoading.value = false
            result.onSuccess { user ->
                if (expectedRole != null) {
                    val isPermitted = when (expectedRole) {
                        StaffRole.SUPER_ADMIN, StaffRole.ADMIN ->
                            user.role == StaffRole.ADMIN || user.role == StaffRole.SUPER_ADMIN
                        StaffRole.STAFF -> user.role == StaffRole.STAFF
                        StaffRole.KITCHEN -> user.role == StaffRole.KITCHEN
                        StaffRole.DELIVERY -> user.role == StaffRole.DELIVERY
                    }
                    if (!isPermitted) {
                        repository.logout()
                        _loginError.value = "Access Restricted: This account (${user.role.title}) cannot access the ${expectedRole.title} portal. Please login via your respective portal."
                        return@launch
                    }
                }
                _statusMessage.value = "Welcome, ${user.name}!"
                refreshAll()
                onSuccess(user.role)
            }.onFailure { err ->
                _loginError.value = err.message ?: "Invalid mobile/email or password."
            }
        }
    }

    fun logout(onLoggedOut: () -> Unit) {
        viewModelScope.launch {
            repository.logout()
            _statusMessage.value = "Logged out successfully"
            onLoggedOut()
        }
    }

    fun refreshAll() {
        viewModelScope.launch {
            _isRefreshing.value = true
            loadStats()
            loadStaff()
            loadOrders()
            loadAuditLogs()
            _isRefreshing.value = false
        }
    }

    fun loadStats() {
        viewModelScope.launch {
            repository.fetchDashboardStats().onSuccess {
                _dashboardStats.value = it
            }
        }
    }

    fun loadOrders() {
        viewModelScope.launch {
            repository.fetchOrders().onSuccess {
                _orders.value = it
            }
        }
    }

    fun loadStaff() {
        viewModelScope.launch {
            repository.fetchStaffUsers().onSuccess {
                _staffList.value = it
            }
        }
    }

    fun loadAuditLogs() {
        viewModelScope.launch {
            repository.fetchAuditLogs().onSuccess {
                _auditLogs.value = it
            }
        }
    }

    fun createStaff(
        name: String,
        mobile: String,
        email: String,
        role: StaffRole,
        password: String,
        employeeId: String,
        branchId: String = "main_rasoi",
        onDone: (Boolean, String) -> Unit
    ) {
        viewModelScope.launch {
            val result = repository.createStaffUser(name, mobile, email, role, password, employeeId, branchId)
            result.onSuccess {
                loadStaff()
                loadAuditLogs()
                onDone(true, "Staff member created successfully")
            }.onFailure {
                onDone(false, it.message ?: "Failed to create staff member")
            }
        }
    }

    fun toggleStaffStatus(userId: String, currentStatus: String) {
        viewModelScope.launch {
            val newStatus = if (currentStatus == "ACTIVE") "DISABLED" else "ACTIVE"
            val result = repository.toggleStaffStatus(userId, newStatus)
            result.onSuccess {
                loadStaff()
                loadAuditLogs()
                _statusMessage.value = "Status updated to $newStatus"
            }.onFailure {
                _statusMessage.value = it.message ?: "Cannot change status"
            }
        }
    }

    fun resetStaffPassword(userId: String, newPass: String, onDone: (Boolean, String) -> Unit) {
        viewModelScope.launch {
            val result = repository.resetStaffPassword(userId, newPass)
            result.onSuccess {
                loadAuditLogs()
                onDone(true, "Password reset successfully")
            }.onFailure {
                onDone(false, it.message ?: "Failed to reset password")
            }
        }
    }

    fun updateOrderStatus(orderId: String, newStatus: String, stageIndex: Int, notes: String? = null) {
        viewModelScope.launch {
            repository.updateOrderStatus(orderId, newStatus, stageIndex, notes)
            loadOrders()
            loadStats()
            loadAuditLogs()
        }
    }

    fun clearStatusMessage() {
        _statusMessage.value = null
    }

    fun clearLoginError() {
        _loginError.value = null
    }
}
