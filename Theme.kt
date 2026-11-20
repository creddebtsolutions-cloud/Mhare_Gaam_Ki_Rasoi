package com.mharegaam.rasoi.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = TerracottaPrimary,
    onPrimary = SurfaceWarm,
    primaryContainer = GheeGoldContainer,
    onPrimaryContainer = TerracottaDark,
    secondary = VillageGreen,
    onSecondary = SurfaceWarm,
    secondaryContainer = MintSoft,
    onSecondaryContainer = LeafGreenDark,
    tertiary = DesiGheeGold,
    onTertiary = SurfaceWarm,
    background = BackgroundCream,
    onBackground = TextDark,
    surface = SurfaceWarm,
    onSurface = TextDark,
    surfaceVariant = SurfaceCard,
    onSurfaceVariant = TextSecondary,
    outline = SurfaceBorder
)

private val DarkColorScheme = darkColorScheme(
    primary = TerracottaLight,
    onPrimary = SurfaceWarm,
    primaryContainer = ClayBrown,
    onPrimaryContainer = GheeGoldLight,
    secondary = VillageGreen,
    onSecondary = SurfaceWarm,
    tertiary = GheeGoldLight,
    onTertiary = TextDark,
    background = EarthenMud,
    onBackground = BackgroundCream,
    surface = ClayBrown,
    onSurface = BackgroundCream,
    surfaceVariant = EarthenMud,
    onSurfaceVariant = SurfaceBorder,
    outline = ClayBrown
)

@Composable
fun MhareGaamTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            window?.let {
                it.statusBarColor = colorScheme.background.toArgb()
                it.navigationBarColor = colorScheme.background.toArgb()
                WindowCompat.getInsetsController(it, view).apply {
                    isAppearanceLightStatusBars = !darkTheme
                    isAppearanceLightNavigationBars = !darkTheme
                }
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}
