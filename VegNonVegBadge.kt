package com.mharegaam.rasoi.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.mharegaam.rasoi.ui.theme.NonVegRed
import com.mharegaam.rasoi.ui.theme.VegGreen

@Composable
fun VegNonVegBadge(
    isVeg: Boolean,
    modifier: Modifier = Modifier,
    size: Int = 16
) {
    val color = if (isVeg) VegGreen else NonVegRed
    val boxSize = size.dp
    val dotSize = (size * 0.5f).dp

    Box(
        modifier = modifier
            .size(boxSize)
            .border(width = 1.5.dp, color = color, shape = RoundedCornerShape(3.dp)),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            modifier = Modifier.size(dotSize),
            shape = CircleShape,
            color = color
        ) {}
    }
}
