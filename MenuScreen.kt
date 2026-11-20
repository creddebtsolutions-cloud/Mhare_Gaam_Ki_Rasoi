package com.mharegaam.rasoi.ui.screens

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mharegaam.rasoi.ui.components.CategoryChip
import com.mharegaam.rasoi.ui.components.MenuItemCard
import com.mharegaam.rasoi.ui.components.VegNonVegBadge
import com.mharegaam.rasoi.ui.theme.BackgroundCream
import com.mharegaam.rasoi.ui.theme.SurfaceBorder
import com.mharegaam.rasoi.ui.theme.SurfaceWarm
import com.mharegaam.rasoi.ui.theme.TerracottaPrimary
import com.mharegaam.rasoi.ui.theme.TextDark
import com.mharegaam.rasoi.ui.theme.TextMuted
import com.mharegaam.rasoi.ui.theme.TextSecondary
import com.mharegaam.rasoi.ui.theme.VegGreen
import com.mharegaam.rasoi.ui.viewmodel.RestaurantViewModel

@Composable
fun MenuScreen(
    viewModel: RestaurantViewModel,
    modifier: Modifier = Modifier
) {
    val items by viewModel.filteredMenuItems.collectAsState()
    val categories = viewModel.categories
    val selectedCategory by viewModel.selectedCategoryId.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val vegOnly by viewModel.vegOnlyFilter.collectAsState()
    val cartItems by viewModel.cartItems.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BackgroundCream)
    ) {
        // 1. Search Bar and Filter row
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { viewModel.updateSearchQuery(it) },
                placeholder = {
                    Text(
                        "Search dishes, roti, thali, lassi...",
                        fontSize = 13.sp,
                        color = TextMuted
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = TerracottaPrimary
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotBlank()) {
                        IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Clear",
                                tint = TextMuted,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = TerracottaPrimary,
                    unfocusedBorderColor = SurfaceBorder
                ),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Veg Only Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { viewModel.toggleVegOnly() }
                ) {
                    VegNonVegBadge(isVeg = true, size = 18)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Pure Veg Only / शुद्ध शाकाहारी",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextDark
                    )
                }

                Switch(
                    checked = vegOnly,
                    onCheckedChange = { viewModel.toggleVegOnly() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = VegGreen,
                        uncheckedThumbColor = Color.White,
                        uncheckedTrackColor = SurfaceBorder
                    )
                )
            }
        }

        // 2. Category selection chips
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(categories) { category ->
                CategoryChip(
                    category = category,
                    isSelected = selectedCategory == category.id,
                    onSelect = { viewModel.selectCategory(category.id) }
                )
            }
        }

        // 3. Menu Items List
        if (items.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "🌾",
                        fontSize = 40.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "No dishes found",
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = TextDark
                    )
                    Text(
                        text = "Try searching for Bajra Roti, Thali, or Handi Dal",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 90.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(items, key = { it.id }) { item ->
                    val cartItem = cartItems.find { it.menuItem.id == item.id }
                    val quantity = cartItem?.quantity ?: 0

                    MenuItemCard(
                        item = item,
                        cartQuantity = quantity,
                        onAddToCart = { viewModel.quickAddToCart(item) },
                        onIncrease = {
                            cartItem?.let { viewModel.updateCartQuantity(it.id, it.quantity + 1) }
                                ?: viewModel.quickAddToCart(item)
                        },
                        onDecrease = {
                            cartItem?.let { viewModel.updateCartQuantity(it.id, it.quantity - 1) }
                        },
                        onItemClick = { viewModel.openItemDetail(item) }
                    )
                }
            }
        }
    }
}
