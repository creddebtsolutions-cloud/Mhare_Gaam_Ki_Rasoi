package com.mharegaam.rasoi.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.R
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.theme.DesiGheeGold
import com.mharegaam.rasoi.ui.theme.EarthenMud
import com.mharegaam.rasoi.ui.theme.SurfaceCard
import com.mharegaam.rasoi.ui.theme.TerracottaDark
import com.mharegaam.rasoi.ui.theme.TerracottaPrimary
import com.mharegaam.rasoi.ui.theme.VillageGreen
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit
) {
    val scale = remember { Animatable(0.6f) }
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(key1 = true) {
        scale.animateTo(
            targetValue = 1f,
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessLow
            )
        )
        alpha.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 800)
        )
        delay(1800)
        onSplashFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        BackgroundCream,
                        SurfaceCard,
                        BackgroundCream
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(24.dp)
        ) {
            // Logo with warm earthen border
            Box(
                modifier = Modifier
                    .size(190.dp)
                    .scale(scale.value)
                    .clip(CircleShape)
                    .border(width = 3.dp, color = TerracottaPrimary, shape = CircleShape)
                    .border(width = 6.dp, color = DesiGheeGold.copy(alpha = 0.3f), shape = CircleShape)
                    .background(Color.White)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.restaurant_logo),
                    contentDescription = "Mhare Gaam Ki Rasoi Logo",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // English Restaurant Name
            Text(
                text = "Mhare Gaam Ki Rasoi",
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                fontSize = 28.sp,
                color = TerracottaDark,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Hindi Traditional Name
            Text(
                text = "म्‍हारे गाम की रसोई",
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.SemiBold,
                fontSize = 20.sp,
                color = VillageGreen
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Tagline Pill
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(TerracottaPrimary.copy(alpha = 0.12f))
                    .padding(horizontal = 20.dp, vertical = 8.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "❖",
                        color = TerracottaPrimary,
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "ghar jaisa swaad • घर जैसा स्वाद",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = TerracottaPrimary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "❖",
                        color = TerracottaPrimary,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            Text(
                text = "Authentic Chulha Cooking & Pure Desi Ghee",
                fontSize = 12.sp,
                color = EarthenMud.copy(alpha = 0.7f),
                fontWeight = FontWeight.Medium
            )
        }
    }
}
