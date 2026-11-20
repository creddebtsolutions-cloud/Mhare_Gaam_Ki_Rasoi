package com.mharegaam.rasoi.ui.screens

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.theme.SurfaceBorder
import com.mharegaam.rasoi.ui.theme.SurfaceCard
import com.mharegaam.rasoi.ui.theme.TerracottaDark
import com.mharegaam.rasoi.ui.theme.TerracottaPrimary
import com.mharegaam.rasoi.ui.theme.TextDark
import com.mharegaam.rasoi.ui.theme.TextSecondary
import com.mharegaam.rasoi.ui.theme.VillageGreen

private const val PREFS_NAME = "mgkr_app_prefs"
private const val KEY_SERVER_HOST = "mgkr_server_host"
private const val DEFAULT_SERVER_HOST = "local"
private const val LOCAL_ASSET_URL = "file:///android_asset/web/admin.html?role=admin"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AdminPortalScreen(
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE) }

    var serverHost by remember {
        mutableStateOf(prefs.getString(KEY_SERVER_HOST, DEFAULT_SERVER_HOST) ?: DEFAULT_SERVER_HOST)
    }

    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var hasError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var tempHostInput by remember { mutableStateOf(serverHost) }

    val fullUrl = if (serverHost == "local" || serverHost.isBlank()) {
        LOCAL_ASSET_URL
    } else if (serverHost.startsWith("http://") || serverHost.startsWith("https://")) {
        if (serverHost.contains("/admin.html")) serverHost else "$serverHost/admin.html?role=admin"
    } else {
        "http://$serverHost/admin.html?role=admin"
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        // --- TOP PORTAL BAR ---
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(BackgroundCream)
                .statusBarsPadding()
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onNavigateBack,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .border(1.dp, SurfaceBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TerracottaDark,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column {
                        Text(
                            text = "Admin & Staff Portal",
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = TerracottaDark
                        )
                        Text(
                            text = "👑 Admin • 🍽️ Staff • 🔥 Kitchen • 🛵 Rider",
                            fontSize = 10.sp,
                            color = TextSecondary,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Settings / Server IP button
                    IconButton(
                        onClick = {
                            tempHostInput = serverHost
                            showSettingsDialog = true
                        },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .border(1.dp, SurfaceBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Server Settings",
                            tint = TerracottaPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Refresh Button
                    IconButton(
                        onClick = {
                            hasError = false
                            webViewInstance?.loadUrl(fullUrl)
                        },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .border(1.dp, SurfaceBorder, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Reload",
                            tint = TerracottaDark,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }

        // Sub-bar showing current server connection
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF2E7D32).copy(alpha = 0.08f))
                .border(width = 0.5.dp, color = Color(0xFF2E7D32).copy(alpha = 0.2f))
                .padding(horizontal = 14.dp, vertical = 4.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (serverHost == "local" || serverHost.isBlank()) "⚡ In-App Management Engine (Offline Ready)" else "📡 Server: $serverHost",
                    fontSize = 11.sp,
                    color = Color(0xFF1B5E20),
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "Tap ⚙️ to change IP",
                    fontSize = 10.sp,
                    color = TextSecondary
                )
            }
        }

        // --- WEBVIEW CONTAINER ---
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    WebView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )

                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            databaseEnabled = true
                            allowFileAccess = true
                            allowContentAccess = true
                            allowFileAccessFromFileURLs = true
                            allowUniversalAccessFromFileURLs = true
                            mediaPlaybackRequiresUserGesture = false
                            cacheMode = WebSettings.LOAD_DEFAULT
                            useWideViewPort = true
                            loadWithOverviewMode = true
                            builtInZoomControls = false
                            displayZoomControls = false
                            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                        }

                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                super.onPageStarted(view, url, favicon)
                                isLoading = true
                                hasError = false
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isLoading = false
                            }

                            override fun onReceivedError(
                                view: WebView?,
                                request: WebResourceRequest?,
                                error: WebResourceError?
                            ) {
                                super.onReceivedError(view, request, error)
                                if (request?.isForMainFrame == true) {
                                    val currentUrl = request.url?.toString() ?: ""
                                    if (!currentUrl.startsWith("file:///android_asset/")) {
                                        // Auto fallback to local bundled admin portal
                                        view?.loadUrl(LOCAL_ASSET_URL)
                                        return
                                    }
                                    isLoading = false
                                    hasError = true
                                    errorMessage = error?.description?.toString()
                                        ?: "Cannot connect to server at $serverHost"
                                }
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onJsAlert(
                                view: WebView?,
                                url: String?,
                                message: String?,
                                result: JsResult?
                            ): Boolean {
                                result?.confirm()
                                return true
                            }

                            override fun onJsConfirm(
                                view: WebView?,
                                url: String?,
                                message: String?,
                                result: JsResult?
                            ): Boolean {
                                result?.confirm()
                                return true
                            }

                            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                                return true
                            }
                        }

                        webViewInstance = this
                        loadUrl(fullUrl)
                    }
                },
                update = { webView ->
                    webViewInstance = webView
                }
            )

            // Loading Overlay
            if (isLoading && !hasError) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(BackgroundCream.copy(alpha = 0.7f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(
                            color = TerracottaPrimary,
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Connecting to Rasoi Management Server...",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = TerracottaDark
                        )
                    }
                }
            }

            // Connection Error State
            if (hasError) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(BackgroundCream)
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                        shape = RoundedCornerShape(16.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Connection Warning",
                                tint = Color(0xFFD32F2F),
                                modifier = Modifier.size(48.dp)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = "Cannot Reach Rasoi Server",
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = TextDark
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "The app could not connect to:\n$fullUrl",
                                fontSize = 12.sp,
                                color = TextSecondary,
                                modifier = Modifier
                                    .background(Color(0xFFEEEEEE), RoundedCornerShape(8.dp))
                                    .padding(8.dp)
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            Text(
                                text = "💡 Quick Checklist:\n" +
                                        "1. Make sure your computer is running `node web/server.js`\n" +
                                        "2. Ensure your phone is on the SAME Wi-Fi network as the PC\n" +
                                        "3. If your PC IP changed, tap 'Change Server IP' below",
                                fontSize = 12.sp,
                                color = TextDark,
                                lineHeight = 18.sp
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        tempHostInput = serverHost
                                        showSettingsDialog = true
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text("⚙️ Change IP", fontSize = 12.sp)
                                }

                                Button(
                                    onClick = {
                                        hasError = false
                                        isLoading = true
                                        webViewInstance?.loadUrl(fullUrl)
                                    },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text("🔄 Retry", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // --- SERVER IP CONFIGURATION DIALOG ---
    if (showSettingsDialog) {
        AlertDialog(
            onDismissRequest = { showSettingsDialog = false },
            title = {
                Text(
                    text = "⚙️ Rasoi Server IP / Host",
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = TerracottaDark
                )
            },
            text = {
                Column {
                    Text(
                        text = "Enter your PC's local Wi-Fi IP address and port (default is 192.168.31.133:3000):",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = tempHostInput,
                        onValueChange = { tempHostInput = it },
                        label = { Text("Server Host:Port") },
                        placeholder = { Text("192.168.31.133:3000") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Quick Presets:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { tempHostInput = DEFAULT_SERVER_HOST },
                            colors = ButtonDefaults.buttonColors(containerColor = VillageGreen),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.height(32.dp),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 8.dp)
                        ) {
                            Text("Wi-Fi ($DEFAULT_SERVER_HOST)", fontSize = 10.sp)
                        }

                        Button(
                            onClick = { tempHostInput = "10.0.2.2:3000" },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF555555)),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.height(32.dp),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 8.dp)
                        ) {
                            Text("Emulator (10.0.2.2)", fontSize = 10.sp)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val cleaned = tempHostInput.trim()
                            .removePrefix("http://")
                            .removePrefix("https://")
                            .removeSuffix("/admin.html")
                            .removeSuffix("/")

                        if (cleaned.isNotBlank()) {
                            serverHost = cleaned
                            prefs.edit().putString(KEY_SERVER_HOST, cleaned).apply()
                            showSettingsDialog = false
                            hasError = false
                            isLoading = true
                            webViewInstance?.loadUrl("http://$cleaned/admin.html")
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TerracottaPrimary)
                ) {
                    Text("Save & Connect")
                }
            },
            dismissButton = {
                TextButton(onClick = { showSettingsDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
