package com.mharegaam.rasoi.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.TableBar
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.data.model.Order
import com.mharegaam.rasoi.data.model.OrderType
import com.mharegaam.rasoi.data.model.PaymentMethod
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.theme.SurfaceBorder
import com.mharegaam.rasoi.ui.theme.SurfaceWarm
import com.mharegaam.rasoi.ui.theme.TerracottaDark
import com.mharegaam.rasoi.ui.theme.TerracottaPrimary
import com.mharegaam.rasoi.ui.theme.TextDark
import com.mharegaam.rasoi.ui.theme.TextMuted
import androidx.compose.runtime.collectAsState
import com.mharegaam.rasoi.ui.theme.TextSecondary
import com.mharegaam.rasoi.ui.viewmodel.RestaurantViewModel

@Composable
fun CheckoutScreen(
    orderType: OrderType,
    viewModel: RestaurantViewModel,
    onOrderPlaced: (Order) -> Unit,
    modifier: Modifier = Modifier
) {
    var customerName by remember { mutableStateOf("Gaurav Singh") }
    var customerPhone by remember { mutableStateOf("8979753636") }
    var deliveryAddress by remember { mutableStateOf("House 102, Shanti Kunj, Near Village Chowk") }
    var tableNumber by remember { mutableStateOf("Table 07 (Khatiya Baithak)") }
    var selectedPayment by remember { mutableStateOf(PaymentMethod.UPI) }

    // UPI Payment & UTR verification state
    var utrNumber by remember { mutableStateOf("") }
    var utrError by remember { mutableStateOf<String?>(null) }
    var paymentConfirmed by remember { mutableStateOf(false) }

    // Calculate dynamic total
    val subtotal by viewModel.cartSubtotal.collectAsState()
    val packing = if (orderType == OrderType.DELIVERY) 25.0 else 0.0
    val delivery = if (orderType == OrderType.DELIVERY) 40.0 else 0.0
    val tax = subtotal * 0.05
    val finalTotalAmount = (subtotal + packing + delivery + tax).coerceAtLeast(0.0)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundCream)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Destination / Order Type
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (orderType == OrderType.DINE_IN) Icons.Default.TableBar else Icons.Default.LocationOn,
                        contentDescription = null,
                        tint = TerracottaPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (orderType == OrderType.DINE_IN) "Dine-In Details" else "Delivery Destination",
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextDark
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                if (orderType == OrderType.DINE_IN) {
                    OutlinedTextField(
                        value = tableNumber,
                        onValueChange = { tableNumber = it },
                        label = { Text("Table / Khatiya No.") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = TerracottaPrimary,
                            unfocusedBorderColor = SurfaceBorder
                        )
                    )
                } else {
                    OutlinedTextField(
                        value = deliveryAddress,
                        onValueChange = { deliveryAddress = it },
                        label = { Text("Delivery Address") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = TerracottaPrimary,
                            unfocusedBorderColor = SurfaceBorder
                        ),
                        maxLines = 3
                    )
                }
            }
        }

        // 2. Customer Contact
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Contact Information",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = customerName,
                    onValueChange = { customerName = it },
                    label = { Text("Full Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TerracottaPrimary,
                        unfocusedBorderColor = SurfaceBorder
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = customerPhone,
                    onValueChange = { customerPhone = it },
                    label = { Text("Mobile Number (For updates)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TerracottaPrimary,
                        unfocusedBorderColor = SurfaceBorder
                    ),
                    singleLine = true
                )
            }
        }

        // 3. Payment Methods
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceWarm),
            border = androidx.compose.foundation.BorderStroke(1.dp, SurfaceBorder)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Payment Method / भुगतान का तरीका",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextDark
                )

                Spacer(modifier = Modifier.height(12.dp))

                PaymentOption(
                    title = "PhonePe Scanner / UPI (7819952799@ybl)",
                    subtitle = "Scan QR with PhonePe, GPay, Paytm & enter UTR",
                    icon = Icons.Default.QrCode2,
                    isSelected = selectedPayment == PaymentMethod.UPI,
                    onSelect = { selectedPayment = PaymentMethod.UPI }
                )

                if (selectedPayment == PaymentMethod.UPI) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF9F3EA)),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, TerracottaPrimary)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "📱 Scan & Pay via PhonePe / UPI",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = TerracottaDark
                            )
                            Text(
                                text = "Official Merchant: ADITYA CHAUHAN",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextDark
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // PhonePe QR Code Image
                            Box(
                                modifier = Modifier
                                    .size(200.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .border(1.dp, Color(0xFFE2D6C5), RoundedCornerShape(12.dp))
                                    .background(Color.White)
                                    .padding(6.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                androidx.compose.foundation.Image(
                                    painter = androidx.compose.ui.res.painterResource(id = com.mharegaam.rasoi.R.drawable.phonepe_upi_qr),
                                    contentDescription = "PhonePe QR Code Scanner - 7819952799@ybl",
                                    modifier = Modifier.fillMaxSize()
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // UPI ID with Copy
                            val clipboardManager = androidx.compose.ui.platform.LocalClipboardManager.current
                            var copiedText by remember { mutableStateOf(false) }
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFFEFE6D8))
                                    .clickable {
                                        clipboardManager.setText(androidx.compose.ui.text.AnnotatedString("7819952799@ybl"))
                                        copiedText = true
                                    }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = "UPI ID: 7819952799@ybl",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = TerracottaDark
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (copiedText) "✓ Copied" else "📋 Copy",
                                    fontSize = 11.sp,
                                    color = if (copiedText) Color(0xFF2E7D32) else TerracottaPrimary,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // UTR Input Field
                            OutlinedTextField(
                                value = utrNumber,
                                onValueChange = { input ->
                                    if (input.length <= 12 && input.all { it.isDigit() }) {
                                        utrNumber = input
                                        utrError = null
                                    }
                                },
                                label = { Text("12-Digit UPI Transaction / UTR No. *") },
                                placeholder = { Text("e.g. 428910394857") },
                                singleLine = true,
                                isError = utrError != null,
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(10.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = TerracottaPrimary,
                                    unfocusedBorderColor = SurfaceBorder
                                )
                            )

                            if (utrError != null) {
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = utrError ?: "",
                                    color = Color(0xFFC62828),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Confirmation Checkbox
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { paymentConfirmed = !paymentConfirmed }
                            ) {
                                androidx.compose.material3.Checkbox(
                                    checked = paymentConfirmed,
                                    onCheckedChange = { paymentConfirmed = it },
                                    colors = androidx.compose.material3.CheckboxDefaults.colors(
                                        checkedColor = TerracottaPrimary
                                    )
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "I have paid ₹${String.format("%.0f", finalTotalAmount)} to 7819952799@ybl (Aditya Chauhan)",
                                    fontSize = 12.sp,
                                    color = TextDark,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                PaymentOption(
                    title = if (orderType == OrderType.DINE_IN) "Pay at Counter / Table" else "Cash on Delivery (COD)",
                    subtitle = "Pay with cash or QR upon arrival",
                    icon = Icons.Default.Payments,
                    isSelected = selectedPayment == PaymentMethod.CASH,
                    onSelect = { selectedPayment = PaymentMethod.CASH }
                )

                Spacer(modifier = Modifier.height(8.dp))

                PaymentOption(
                    title = "Credit / Debit Card",
                    subtitle = "Visa, Mastercard, RuPay",
                    icon = Icons.Default.CreditCard,
                    isSelected = selectedPayment == PaymentMethod.CARD,
                    onSelect = { selectedPayment = PaymentMethod.CARD }
                )
            }
        }

        // 4. Place Order Action
        var generalError by remember { mutableStateOf<String?>(null) }

        if (generalError != null) {
            Text(
                text = generalError ?: "",
                color = Color(0xFFC62828),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 4.dp)
            )
        }

        Button(
            onClick = {
                if (selectedPayment == PaymentMethod.UPI) {
                    if (utrNumber.length != 12) {
                        utrError = "⚠️ Please enter a complete 12-digit UTR number"
                        generalError = "Order CANNOT be confirmed without payment! Enter 12-digit UTR."
                        return@Button
                    }
                    if (!paymentConfirmed) {
                        generalError = "Please check the box confirming you transferred ₹${String.format("%.0f", finalTotalAmount)} to 7819952799@ybl"
                        return@Button
                    }
                }

                val order = viewModel.placeOrder(
                    orderType = orderType,
                    deliveryAddress = deliveryAddress,
                    tableNumber = if (orderType == OrderType.DINE_IN) tableNumber else null,
                    paymentMethod = selectedPayment
                )
                onOrderPlaced(order)
            },
            colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            Text(
                text = "🔥 Place Order & Light Chulha (₹${String.format("%.0f", finalTotalAmount)})",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }
    }
}

@Composable
fun PaymentOption(
    title: String,
    subtitle: String,
    icon: ImageVector,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(
                width = 1.dp,
                color = if (isSelected) TerracottaPrimary else SurfaceBorder,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable { onSelect() }
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = isSelected,
            onClick = onSelect,
            colors = RadioButtonDefaults.colors(selectedColor = TerracottaPrimary)
        )

        Spacer(modifier = Modifier.width(8.dp))

        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (isSelected) TerracottaPrimary else TextMuted,
            modifier = Modifier.size(24.dp)
        )

        Spacer(modifier = Modifier.width(12.dp))

        Column {
            Text(
                text = title,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = TextDark
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = TextSecondary
            )
        }
    }
}
