package com.mharegaam.rasoi.ui.screens.staff

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LockReset
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import com.mharegaam.rasoi.ui.theme.VillageGreen
import com.mharegaam.rasoi.ui.viewmodel.StaffViewModel
import kotlinx.coroutines.launch

@Composable
fun StaffManagementScreen(
    viewModel: StaffViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val staffList by viewModel.staffList.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()
    val isSuperAdmin = currentUser?.isSuperAdmin == true

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    var showAddDialog by remember { mutableStateOf(false) }
    var userForPasswordReset by remember { mutableStateOf<StaffUser?>(null) }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = TerracottaPrimary,
                contentColor = Color.White
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add Staff")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(BackgroundCream)
                .statusBarsPadding()
                .padding(innerPadding)
        ) {
            // Header Bar
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(bottomStart = 16.dp, bottomEnd = 16.dp),
                colors = CardDefaults.cardColors(containerColor = ClayBrown),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onNavigateBack) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White
                            )
                        }
                        Column {
                            Text(
                                text = "STAFF MANAGEMENT",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = DesiGheeGold
                            )
                            Text(
                                text = "कर्मचारी प्रबंधन • ${staffList.size} Accounts",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.85f)
                            )
                        }
                    }

                    IconButton(onClick = { viewModel.loadStaff() }, enabled = !isRefreshing) {
                        if (isRefreshing) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                        } else {
                            Icon(imageVector = Icons.Default.Refresh, contentDescription = "Refresh", tint = Color.White)
                        }
                    }
                }
            }

            // Staff List
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                contentPadding = PaddingValues(vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(staffList, key = { it.id }) { userItem ->
                    StaffUserCard(
                        user = userItem,
                        isSuperAdmin = isSuperAdmin,
                        onToggleStatus = {
                            viewModel.toggleStaffStatus(userItem.id, userItem.status)
                            scope.launch { snackbarHostState.showSnackbar("Status updated for ${userItem.name}") }
                        },
                        onResetPassword = {
                            userForPasswordReset = userItem
                        }
                    )
                }
            }
        }
    }

    // Add Staff Dialog
    if (showAddDialog) {
        AddStaffDialog(
            isSuperAdmin = isSuperAdmin,
            onDismiss = { showAddDialog = false },
            onAddStaff = { name, mobile, email, role, password, empId ->
                viewModel.createStaff(
                    name = name,
                    mobile = mobile,
                    email = email,
                    role = role,
                    password = password,
                    employeeId = empId,
                    onDone = { success, msg ->
                        scope.launch { snackbarHostState.showSnackbar(msg) }
                    }
                )
                showAddDialog = false
            }
        )
    }

    // Reset Password Dialog
    userForPasswordReset?.let { targetUser ->
        ResetPasswordDialog(
            targetUser = targetUser,
            onDismiss = { userForPasswordReset = null },
            onConfirm = { newPass ->
                viewModel.resetStaffPassword(targetUser.id, newPass) { success, msg ->
                    scope.launch { snackbarHostState.showSnackbar(msg) }
                }
                userForPasswordReset = null
            }
        )
    }
}

@Composable
private fun StaffUserCard(
    user: StaffUser,
    isSuperAdmin: Boolean,
    onToggleStatus: () -> Unit,
    onResetPassword: () -> Unit
) {
    val isTargetSuperAdmin = user.role == StaffRole.SUPER_ADMIN
    val canModify = isSuperAdmin || !isTargetSuperAdmin

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
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(TerracottaPrimary.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = user.role.icon, fontSize = 20.sp)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = user.name,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = TextDark
                            )
                            if (isTargetSuperAdmin) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(text = "👑", fontSize = 14.sp)
                            }
                        }
                        Text(
                            text = "${user.employeeId} • ${user.role.title}",
                            fontSize = 12.sp,
                            color = TerracottaDark,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Status chip
                val isActive = user.status.equals("ACTIVE", ignoreCase = true)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isActive) VillageGreen.copy(alpha = 0.15f) else NonVegRed.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (isActive) "ACTIVE" else "DISABLED",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isActive) VillageGreen else NonVegRed
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = SurfaceBorder)
            Spacer(modifier = Modifier.height(8.dp))

            // Details
            Text(text = "📞 Mobile: ${user.mobile}", fontSize = 12.sp, color = TextDark)
            if (user.email.isNotBlank()) {
                Text(text = "✉️ Email: ${user.email}", fontSize = 12.sp, color = TextDark)
            }
            Text(
                text = "🕒 Last Login: ${user.lastLogin ?: "Never logged in"}",
                fontSize = 11.sp,
                color = TextMuted
            )

            // Admin actions (Prevent normal Admin from touching Super Admin)
            if (canModify && !isTargetSuperAdmin) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onResetPassword) {
                        Icon(imageVector = Icons.Default.LockReset, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Reset Password", fontSize = 12.sp)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedButton(
                        onClick = onToggleStatus,
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = if (user.isActive) NonVegRed else VillageGreen
                        )
                    ) {
                        Text(if (user.isActive) "Disable" else "Enable", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddStaffDialog(
    isSuperAdmin: Boolean,
    onDismiss: () -> Unit,
    onAddStaff: (String, String, String, StaffRole, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var mobile by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var employeeId by remember { mutableStateOf("EMP-${(100..999).random()}") }
    var password by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf(StaffRole.STAFF) }
    var roleDropdownExpanded by remember { mutableStateOf(false) }

    // Admin cannot create Super Admin
    val selectableRoles = if (isSuperAdmin) {
        listOf(StaffRole.ADMIN, StaffRole.STAFF, StaffRole.KITCHEN, StaffRole.DELIVERY)
    } else {
        listOf(StaffRole.STAFF, StaffRole.KITCHEN, StaffRole.DELIVERY)
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add New Staff Member", fontWeight = FontWeight.Bold, color = TerracottaDark) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Full Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = mobile,
                    onValueChange = { mobile = it },
                    label = { Text("Mobile Number *") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email (Optional)") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Initial Password *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Role Dropdown
                ExposedDropdownMenuBox(
                    expanded = roleDropdownExpanded,
                    onExpandedChange = { roleDropdownExpanded = !roleDropdownExpanded }
                ) {
                    OutlinedTextField(
                        value = "${selectedRole.icon} ${selectedRole.title}",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Role") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleDropdownExpanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = roleDropdownExpanded,
                        onDismissRequest = { roleDropdownExpanded = false }
                    ) {
                        selectableRoles.forEach { role ->
                            DropdownMenuItem(
                                text = { Text("${role.icon} ${role.title}") },
                                onClick = {
                                    selectedRole = role
                                    roleDropdownExpanded = false
                                }
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank() && mobile.isNotBlank() && password.isNotBlank()) {
                        onAddStaff(name, mobile, email, selectedRole, password, employeeId)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary)
            ) {
                Text("Create Account", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun ResetPasswordDialog(
    targetUser: StaffUser,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit
) {
    var newPassword by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Reset Password", fontWeight = FontWeight.Bold, color = TerracottaDark) },
        text = {
            Column {
                Text("Enter a new password for ${targetUser.name} (${targetUser.role.title}):")
                Spacer(modifier = Modifier.height(10.dp))
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it },
                    label = { Text("New Password") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (newPassword.length >= 4) onConfirm(newPassword)
                },
                enabled = newPassword.length >= 4,
                colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary)
            ) {
                Text("Update Password")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
