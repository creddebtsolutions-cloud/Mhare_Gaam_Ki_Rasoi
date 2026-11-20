package com.mharegaam.rasoi.data.repository

import com.mharegaam.rasoi.R
import com.mharegaam.rasoi.data.model.AddOnOption
import com.mharegaam.rasoi.data.model.Category
import com.mharegaam.rasoi.data.model.MenuItem
import com.mharegaam.rasoi.data.model.SpiceLevel

class MenuRepository {

    val categories: List<Category> = listOf(
        Category(
            id = "all",
            title = "All Items",
            hindiTitle = "सब व्यंजन",
            description = "Explore all authentic village preparations",
            iconEmoji = "🍲"
        ),
        Category(
            id = "thalis",
            title = "Gaam Thalis",
            hindiTitle = "गाम की थालियां",
            description = "Wholesome royal village platters served in brass kansa",
            iconEmoji = "🍱"
        ),
        Category(
            id = "handi",
            title = "Handi & Chulha",
            hindiTitle = "हांडी व चूल्हे से",
            description = "Slow simmered in clay pots on firewood chulha",
            iconEmoji = "🏺"
        ),
        Category(
            id = "rotis",
            title = "Desi Rotis",
            hindiTitle = "सौंधी रोटियां",
            description = "Piping hot grains made on clay tandoor & tawa",
            iconEmoji = "🫓"
        ),
        Category(
            id = "sweets",
            title = "Churma & Sweets",
            hindiTitle = "देसी घी चूरमा",
            description = "Made with pure A2 cow bilona desi ghee & gud",
            iconEmoji = "🍯"
        ),
        Category(
            id = "pizzas",
            title = "Smokey Pizzas",
            hindiTitle = "स्मोकी पिज़्ज़ा",
            description = "Wood-fired crispy pizzas prepared in mud-oven",
            iconEmoji = "🍕"
        ),
        Category(
            id = "beverages",
            title = "Drinks & Cold Coffee",
            hindiTitle = "कुल्हड़ पेय व कॉफ़ी",
            description = "Chilled thick lassi, cold coffee & chaach",
            iconEmoji = "☕"
        )
    )

    private val commonAddOns: List<AddOnOption> = listOf(
        AddOnOption("add_1", "Extra Pure Desi Ghee Dollop", "अतिरिक्त शुद्ध देसी घी", 30.0),
        AddOnOption("add_2", "Fresh White Butter (Makhan)", "घर का सफेद मक्खन", 35.0),
        AddOnOption("add_3", "Pure Gud (Organic Jaggery)", "देसी गुड़ की डली", 20.0),
        AddOnOption("add_4", "Village Garlic-Chilli Chutney", "लहसुन-लाल मिर्च चटनी", 15.0),
        AddOnOption("add_5", "Clay Roasted Chulha Papad", "चूल्हे पर सिका पापड़", 20.0)
    )

    val menuItems: List<MenuItem> = listOf(
        // 1. Signature Thalis
        MenuItem(
            id = "thali_special",
            name = "Mhare Gaam Ki Special Thali",
            hindiName = "म्‍हारे गाम की स्पेशल थाली",
            categoryId = "thalis",
            description = "The ultimate royal village feast: 2 Bajra Rotis topped with melting white butter, Sarson Ka Saag, 24-hr Handi Dal Makhani, Desi Ghee Churma, Kadhi Pakoda, Steamed Rice, Village Raita, Gur, Garlic Chutney & Kulhad Chaach.",
            price = 349.0,
            originalPrice = 420.0,
            imageRes = R.drawable.dish_thali,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = true,
            preparationTimeMin = 25,
            spiceLevel = SpiceLevel.MEDIUM,
            rating = 4.9f,
            reviewCount = 380,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "thali_bajra_saag",
            name = "Chulha Bajra Roti & Saag Thali",
            hindiName = "चूल्हा बाजरा रोटी व साग थाली",
            categoryId = "thalis",
            description = "Winter village nostalgia: 3 fresh Bajra Rotis smoked over cow dung firewood chulha, Sarson Saag loaded with homemade makhan, Radish-onion kachumber and pure jaggery.",
            price = 289.0,
            originalPrice = 330.0,
            imageRes = R.drawable.dish_bajra_saag,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = true,
            preparationTimeMin = 20,
            spiceLevel = SpiceLevel.MEDIUM,
            rating = 4.8f,
            reviewCount = 210,
            availableAddOns = commonAddOns
        ),

        // 2. Handi & Chulha Specials
        MenuItem(
            id = "handi_dal",
            name = "Chulha Handi Dal Makhani",
            hindiName = "चूल्हे की हांडी दाल मखनी",
            categoryId = "handi",
            description = "Black urad dal slow-cooked for 18 hours overnight in an authentic earthen clay handi pot, enriched with farm butter and pure cow desi ghee.",
            price = 269.0,
            originalPrice = 299.0,
            imageRes = R.drawable.dish_handi_dal,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = true,
            preparationTimeMin = 15,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.9f,
            reviewCount = 512,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "handi_paneer",
            name = "Gaam Handi Paneer Kadhai",
            hindiName = "गाम हांडी पनीर कढ़ाई",
            categoryId = "handi",
            description = "Fresh malai paneer cubes tossed with whole pounded spices, bell peppers and caramelized village onions in a clay pot.",
            price = 299.0,
            originalPrice = 340.0,
            imageRes = R.drawable.dish_handi_paneer,
            isVeg = true,
            isBestseller = false,
            isVillageSpecial = false,
            isDesiGheeSpecial = true,
            preparationTimeMin = 20,
            spiceLevel = SpiceLevel.SPICY,
            rating = 4.7f,
            reviewCount = 189,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "handi_kadhi",
            name = "Desi Ghee Kadhi Pakoda",
            hindiName = "देसी घी कढ़ी पकोड़ा",
            categoryId = "handi",
            description = "Sour buttermilk kadhi slow-simmered with crispy fenugreek onion pakodas, finished with a sizzling heeng-zeera desi ghee chhonk.",
            price = 219.0,
            originalPrice = 249.0,
            imageRes = R.drawable.dish_kadhi_pakoda,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = true,
            preparationTimeMin = 15,
            spiceLevel = SpiceLevel.MEDIUM,
            rating = 4.8f,
            reviewCount = 142,
            availableAddOns = commonAddOns
        ),

        // 3. Sweets & Churma
        MenuItem(
            id = "sweet_churma",
            name = "Pure Desi Ghee Gud Churma",
            hindiName = "शुद्ध देसी घी गुड़ चूरमा",
            categoryId = "sweets",
            description = "Coarsely ground whole wheat muthiyas hand-crushed with organic brown jaggery, loaded with almonds, cashews, cardamom, and overflowing pure desi ghee.",
            price = 199.0,
            originalPrice = 240.0,
            imageRes = R.drawable.dish_churma,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = true,
            preparationTimeMin = 10,
            spiceLevel = SpiceLevel.MILD,
            rating = 5.0f,
            reviewCount = 425,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "sweet_malpua",
            name = "Earthen Rabri Malpua Platter",
            hindiName = "कुल्हड़ रबड़ी मालपुआ",
            categoryId = "sweets",
            description = "Crispy golden malpuas dipped in saffron sugar syrup, topped with thick reduced milk rabri in an earthen saucer.",
            price = 179.0,
            originalPrice = 210.0,
            imageRes = R.drawable.dish_rabri_malpua,
            isVeg = true,
            isBestseller = false,
            isVillageSpecial = false,
            isDesiGheeSpecial = true,
            preparationTimeMin = 12,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.8f,
            reviewCount = 110,
            availableAddOns = commonAddOns
        ),

        // 4. Kulhad Drinks
        MenuItem(
            id = "drink_kesar_lassi",
            name = "Kulhad Kesar Malai Lassi",
            hindiName = "कुल्हड़ केसर मलाई लस्सी",
            categoryId = "beverages",
            description = "Velvety hand-churned thick curd lassi infused with Kashmiri saffron, cardamom, topped with thick malai and chopped pistachios in an earthen kulhad.",
            price = 99.0,
            originalPrice = 120.0,
            imageRes = R.drawable.dish_kulhad_lassi,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = false,
            preparationTimeMin = 5,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.9f,
            reviewCount = 618,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "drink_chaach",
            name = "Gaam Masala Chaach (Buttermilk)",
            hindiName = "गाम मसाला छाछ",
            categoryId = "beverages",
            description = "Refreshing chilled buttermilk tempered with roasted cumin, rock salt, mint leaves, and fresh green coriander.",
            price = 59.0,
            originalPrice = 75.0,
            imageRes = R.drawable.dish_masala_chaach,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = false,
            preparationTimeMin = 5,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.8f,
            reviewCount = 280,
            availableAddOns = commonAddOns
        ),

        // 5. Rotis & Breads
        MenuItem(
            id = "roti_bajra_makhan",
            name = "Tawa Bajra Roti with Makhan (2 Pcs)",
            hindiName = "बाजरा रोटी मक्‍खन वाली (2 नग)",
            categoryId = "rotis",
            description = "Hand-patted organic pearl millet rotis roasted on a clay tawa, served with a big dollop of fresh churned white butter.",
            price = 89.0,
            originalPrice = 100.0,
            imageRes = R.drawable.dish_bajra_roti,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = true,
            preparationTimeMin = 15,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.9f,
            reviewCount = 310,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "roti_missi",
            name = "Besan Missi Roti with Ghee (2 Pcs)",
            hindiName = "मिस्सी रोटी देसी घी में (2 नग)",
            categoryId = "rotis",
            description = "Gram flour dough mixed with chopped onions, green chilies, ajwain and kasuri methi, baked in tandoor and brushed generously with desi ghee.",
            price = 79.0,
            originalPrice = 90.0,
            imageRes = R.drawable.dish_thali,
            isVeg = true,
            isBestseller = false,
            isVillageSpecial = false,
            isDesiGheeSpecial = true,
            preparationTimeMin = 12,
            spiceLevel = SpiceLevel.MEDIUM,
            rating = 4.7f,
            reviewCount = 95,
            availableAddOns = commonAddOns
        ),

        // 6. Smokey Pizzas
        MenuItem(
            id = "pizza_smokey_paneer_tikka",
            name = "Smokey Paneer Tikka Pizza",
            hindiName = "चूल्हा स्मोकी पनीर टिक्का पिज़्ज़ा",
            categoryId = "pizzas",
            description = "Wood-fired crispy charred crust topped with marinated smoky tandoori paneer cubes, crunchy capsicum, charred red onions, gooey mozzarella cheese and mint chutney swirl.",
            price = 269.0,
            originalPrice = 310.0,
            imageRes = R.drawable.dish_smokey_pizza,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = false,
            preparationTimeMin = 18,
            spiceLevel = SpiceLevel.MEDIUM,
            rating = 4.9f,
            reviewCount = 420,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "pizza_smokey_farmhouse",
            name = "Smokey Farmhouse Veggie Pizza",
            hindiName = "स्मोकी फार्महाउस वेज पिज़्ज़ा",
            categoryId = "pizzas",
            description = "Loaded wood-smoked garden pizza featuring sweet golden corn, bell peppers, fresh tomatoes, sliced olives, jalapenos and dried oregano over bubbling cheese.",
            price = 249.0,
            originalPrice = 289.0,
            imageRes = R.drawable.dish_smokey_pizza,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = false,
            isDesiGheeSpecial = false,
            preparationTimeMin = 18,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.8f,
            reviewCount = 265,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "pizza_smokey_makhani_paneer",
            name = "Smokey Makhani Paneer & Corn Pizza",
            hindiName = "स्मोकी मखनी पनीर कॉर्न पिज़्ज़ा",
            categoryId = "pizzas",
            description = "Desi twist to Italian pizza: slow-cooked rich makhani gravy sauce base, char-grilled malai paneer, buttery sweet corn, and double mozzarella cheese.",
            price = 279.0,
            originalPrice = 320.0,
            imageRes = R.drawable.dish_smokey_pizza,
            isVeg = true,
            isBestseller = false,
            isVillageSpecial = true,
            isDesiGheeSpecial = true,
            preparationTimeMin = 20,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.9f,
            reviewCount = 195,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "pizza_smokey_periperi",
            name = "Smokey Spicy Peri-Peri Veg Pizza",
            hindiName = "स्मोकी पेरी-पेरी वेज पिज़्ज़ा",
            categoryId = "pizzas",
            description = "Fiery rustic pizza spiked with smoky African bird's eye peri-peri seasoning, spicy red paprika, crisp onions, crunchy capsicum and molten cheese.",
            price = 239.0,
            originalPrice = 270.0,
            imageRes = R.drawable.dish_smokey_pizza,
            isVeg = true,
            isBestseller = false,
            isVillageSpecial = false,
            isDesiGheeSpecial = false,
            preparationTimeMin = 16,
            spiceLevel = SpiceLevel.SPICY,
            rating = 4.7f,
            reviewCount = 140,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "pizza_smokey_margherita",
            name = "Smokey Margherita Double Cheese Pizza",
            hindiName = "स्मोकी मार्गरीटा डबल चीज़ पिज़्ज़ा",
            categoryId = "pizzas",
            description = "Classic wood-charred artisanal base, san marzano herbed tomato concasse sauce, fragrant basil leaves, and overflowing molten double smoked cheese.",
            price = 199.0,
            originalPrice = 239.0,
            imageRes = R.drawable.dish_smokey_pizza,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = false,
            isDesiGheeSpecial = false,
            preparationTimeMin = 15,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.8f,
            reviewCount = 310,
            availableAddOns = commonAddOns
        ),

        // 7. Cold Coffees
        MenuItem(
            id = "coffee_classic_cold",
            name = "Classic Kulhad Cold Coffee",
            hindiName = "क्लासिक कुल्हड़ कोल्ड कॉफ़ी",
            categoryId = "beverages",
            description = "Rich creamy blended dark roasted espresso coffee with chilled full-cream milk, served in an authentic earthen kulhad with velvety froth.",
            price = 89.0,
            originalPrice = 110.0,
            imageRes = R.drawable.dish_cold_coffee,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = true,
            isDesiGheeSpecial = false,
            preparationTimeMin = 5,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.9f,
            reviewCount = 540,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "coffee_choco_mocha",
            name = "Smokey Choco Mocha Cold Coffee",
            hindiName = "स्मोकी मोचा कोल्ड कॉफ़ी",
            categoryId = "beverages",
            description = "Dark Belgian cocoa blended with chilled espresso, rich creamy milk, chocolate syrup drizzle and a subtle roasted hazelnut-smoky touch.",
            price = 109.0,
            originalPrice = 130.0,
            imageRes = R.drawable.dish_cold_coffee,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = false,
            isDesiGheeSpecial = false,
            preparationTimeMin = 6,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.8f,
            reviewCount = 380,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "coffee_hazelnut_cold",
            name = "Hazelnut Cream Cold Coffee",
            hindiName = "हेज़लनट क्रीम कोल्ड कॉफ़ी",
            categoryId = "beverages",
            description = "Gourmet cold coffee infused with roasted hazelnut syrup, creamy vanilla froth, and cracked coffee beans.",
            price = 119.0,
            originalPrice = 140.0,
            imageRes = R.drawable.dish_cold_coffee,
            isVeg = true,
            isBestseller = false,
            isVillageSpecial = false,
            isDesiGheeSpecial = false,
            preparationTimeMin = 6,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.7f,
            reviewCount = 210,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "coffee_caramel_crunch",
            name = "Caramel Crunch Cold Coffee",
            hindiName = "कैरेमल क्रंच कोल्ड कॉफ़ी",
            categoryId = "beverages",
            description = "Chilled espresso churned with rich butterscotch caramel sauce, topped with golden crunchy butter praline and caramel drizzle.",
            price = 119.0,
            originalPrice = 140.0,
            imageRes = R.drawable.dish_cold_coffee,
            isVeg = true,
            isBestseller = false,
            isVillageSpecial = false,
            isDesiGheeSpecial = false,
            preparationTimeMin = 6,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.8f,
            reviewCount = 175,
            availableAddOns = commonAddOns
        ),
        MenuItem(
            id = "coffee_vanilla_float",
            name = "Vanilla Ice Cream Cold Coffee Float",
            hindiName = "वैनिला फ्लोट कोल्ड कॉफ़ी",
            categoryId = "beverages",
            description = "Thick hand-blended cold coffee topped with a huge scoop of artisanal vanilla bean ice cream and dusted with dark cocoa.",
            price = 129.0,
            originalPrice = 150.0,
            imageRes = R.drawable.dish_cold_coffee,
            isVeg = true,
            isBestseller = true,
            isVillageSpecial = false,
            isDesiGheeSpecial = false,
            preparationTimeMin = 5,
            spiceLevel = SpiceLevel.MILD,
            rating = 4.9f,
            reviewCount = 460,
            availableAddOns = commonAddOns
        )
    )

    fun getItemsByCategory(categoryId: String): List<MenuItem> {
        return if (categoryId == "all") menuItems else menuItems.filter { it.categoryId == categoryId }
    }

    fun getItemById(id: String): MenuItem? {
        return menuItems.find { it.id == id }
    }

    fun searchItems(query: String, vegOnly: Boolean = false): List<MenuItem> {
        return menuItems.filter { item ->
            val matchesQuery = item.name.contains(query, ignoreCase = true) ||
                    item.hindiName.contains(query, ignoreCase = true) ||
                    item.description.contains(query, ignoreCase = true)
            val matchesVeg = if (vegOnly) item.isVeg else true
            matchesQuery && matchesVeg
        }
    }
}
