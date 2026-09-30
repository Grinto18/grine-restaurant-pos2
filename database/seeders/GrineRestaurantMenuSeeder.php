<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GrineRestaurantMenuSeeder extends Seeder
{
    /**
     * Run the database seeds for GRINE RESTAURANT Official Menu.
     */
    public function run(): void
    {
        // Disable foreign key checks if applicable
        // 1. Categories
        $categories = [
            [
                'id' => 1,
                'slug' => 'plats-principaux',
                'name' => 'الأطباق الرئيسية',
                'name_fr' => 'Plats Principaux',
                'name_en' => 'Main Dishes',
                'icon' => '🍲',
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'slug' => 'calzone',
                'name' => 'Calzone',
                'name_fr' => 'Calzone',
                'name_en' => 'Calzone',
                'icon' => '🥙',
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'slug' => 'tacos',
                'name' => 'Tacos',
                'name_fr' => 'Tacos',
                'name_en' => 'Tacos',
                'icon' => '🌯',
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'slug' => 'seafood',
                'name' => 'مأكولات بحرية',
                'name_fr' => 'Fruits de Mer',
                'name_en' => 'Seafood',
                'icon' => '🐟',
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'slug' => 'pizza',
                'name' => 'Pizza',
                'name_fr' => 'Pizza',
                'name_en' => 'Pizza',
                'icon' => '🍕',
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'slug' => 'desserts',
                'name' => 'التحلية',
                'name_fr' => 'Desserts',
                'name_en' => 'Desserts',
                'icon' => '🍰',
                'sort_order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'slug' => 'appetizers',
                'name' => 'المقبلات',
                'name_fr' => 'Entrées & Salades',
                'name_en' => 'Appetizers',
                'icon' => '🥗',
                'sort_order' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'slug' => 'drinks',
                'name' => 'المشروبات',
                'name_fr' => 'Boissons',
                'name_en' => 'Drinks',
                'icon' => '🥤',
                'sort_order' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(['id' => $cat['id']], $cat);
        }

        // Pizza Addons (Add-ons table or metadata)
        $pizzaAddons = [
            ['name' => 'Sauce blanche', 'name_ar' => 'صلصة بيضاء', 'price' => 100],
            ['name' => 'Fromage extra', 'name_ar' => 'فرماج', 'price' => 150],
        ];

        // 2. Products List
        $products = [
            // ================= الأطباق الرئيسية =================
            ['category_id' => 1, 'name_ar' => 'لوبيا', 'name_fr' => 'Loubia Traditionnelle', 'name_en' => 'White Bean Stew', 'price' => 250, 'sku' => 'PLT-001'],
            ['category_id' => 1, 'name_ar' => 'عدس', 'name_fr' => 'Lentilles Mijotées', 'name_en' => 'Lentil Stew', 'price' => 250, 'sku' => 'PLT-002'],
            ['category_id' => 1, 'name_ar' => 'ارز', 'name_fr' => 'Riz Nature Parfumé', 'name_en' => 'Steamed Rice', 'price' => 250, 'sku' => 'PLT-003'],
            ['category_id' => 1, 'name_ar' => 'ارز بالزبيب', 'name_fr' => 'Riz aux Raisins Secs', 'name_en' => 'Rice with Raisins', 'price' => 300, 'sku' => 'PLT-004'],
            ['category_id' => 1, 'name_ar' => 'بولي فارسي', 'name_fr' => 'Poulet Farci au Four', 'name_en' => 'Stuffed Chicken', 'price' => 550, 'sku' => 'PLT-005'],
            ['category_id' => 1, 'name_ar' => 'سكالوب الكريم', 'name_fr' => 'Escalope à la Crème', 'name_en' => 'Creamy Escalope', 'price' => 550, 'sku' => 'PLT-006'],
            ['category_id' => 1, 'name_ar' => 'ستاك الكريم', 'name_fr' => 'Steak de Bœuf à la Crème', 'name_en' => 'Creamy Beef Steak', 'price' => 700, 'sku' => 'PLT-007'],
            ['category_id' => 1, 'name_ar' => 'دجاج محمر', 'name_fr' => 'Poulet Rôti Croustillant', 'name_en' => 'Roasted Chicken', 'price' => 400, 'sku' => 'PLT-008'],
            ['category_id' => 1, 'name_ar' => 'بوزلوف', 'name_fr' => 'Bouzelouf d’Agneau', 'name_en' => 'Bouzelouf Lamb Head', 'price' => 1000, 'sku' => 'PLT-009'],
            ['category_id' => 1, 'name_ar' => 'بكبوكة', 'name_fr' => 'Bakbouka Traditionnelle', 'name_en' => 'Bakbouka Tripe Stew', 'price' => 800, 'sku' => 'PLT-010'],
            ['category_id' => 1, 'name_ar' => 'متوم', 'name_fr' => 'Mthewem Boulettes & Sauce Blanche', 'name_en' => 'Mthewem Meatballs', 'price' => 500, 'sku' => 'PLT-011'],
            ['category_id' => 1, 'name_ar' => 'شطيطحة لحم', 'name_fr' => 'Chtitha Viande Rouge', 'name_en' => 'Spicy Beef Chtitha', 'price' => 800, 'sku' => 'PLT-012'],
            ['category_id' => 1, 'name_ar' => 'شطيطحة داند', 'name_fr' => 'Chtitha Dinde', 'name_en' => 'Turkey Chtitha', 'price' => 700, 'sku' => 'PLT-013'],
            ['category_id' => 1, 'name_ar' => 'شطيطحة دجاج', 'name_fr' => 'Chtitha Poulet', 'name_en' => 'Chicken Chtitha', 'price' => 550, 'sku' => 'PLT-014'],

            // ================= CALZONE =================
            ['category_id' => 2, 'name_ar' => 'كالزون بولي', 'name_fr' => 'Calzone Poulet', 'name_en' => 'Chicken Calzone', 'price' => 500, 'sku' => 'CAL-001'],
            ['category_id' => 2, 'name_ar' => 'كالزون لحم', 'name_fr' => 'Calzone Viande Hachée', 'name_en' => 'Beef Calzone', 'price' => 600, 'sku' => 'CAL-002'],
            ['category_id' => 2, 'name_ar' => 'كالزون 3 أجبان', 'name_fr' => 'Calzone 3 Fromages', 'name_en' => 'Three Cheese Calzone', 'price' => 600, 'sku' => 'CAL-003'],
            ['category_id' => 2, 'name_ar' => 'ميني اطفال', 'name_fr' => 'Calzone Mini Enfants', 'name_en' => 'Kids Mini Calzone', 'price' => 400, 'sku' => 'CAL-004'],

            // ================= TACOS =================
            ['category_id' => 3, 'name_ar' => 'طاكوس بولي', 'name_fr' => 'Tacos Poulet', 'name_en' => 'Chicken Tacos', 'price' => 400, 'sku' => 'TAC-001'],
            ['category_id' => 3, 'name_ar' => 'طاكوس لحم', 'name_fr' => 'Tacos Viande Hachée', 'name_en' => 'Beef Tacos', 'price' => 600, 'sku' => 'TAC-002'],
            ['category_id' => 3, 'name_ar' => 'طاكوس 3 أجبان', 'name_fr' => 'Tacos 3 Fromages', 'name_en' => 'Three Cheese Tacos', 'price' => 600, 'sku' => 'TAC-003'],

            // ================= مأكولات بحرية =================
            ['category_id' => 4, 'name_ar' => 'بايلا', 'name_fr' => 'Paëlla Royale', 'name_en' => 'Royal Seafood Paella', 'price' => 2000, 'sku' => 'SEA-001'],
            ['category_id' => 4, 'name_ar' => 'سلمون مشوي', 'name_fr' => 'Pavé de Saumon Grillé', 'name_en' => 'Grilled Salmon', 'price' => 2500, 'sku' => 'SEA-002'],
            ['category_id' => 4, 'name_ar' => 'سردين مقلي', 'name_fr' => 'Sardines Fraîches Frites', 'name_en' => 'Fried Fresh Sardines', 'price' => 600, 'sku' => 'SEA-003'],
            ['category_id' => 4, 'name_ar' => 'روجي', 'name_fr' => 'Rouget Grillé', 'name_en' => 'Grilled Red Mullet', 'price' => 1000, 'sku' => 'SEA-004'],
            ['category_id' => 4, 'name_ar' => 'دوراد مشوي', 'name_fr' => 'Daurade Royale Grillée', 'name_en' => 'Grilled Sea Bream', 'price' => 1000, 'sku' => 'SEA-005'],
            ['category_id' => 4, 'name_ar' => 'سبادون', 'name_fr' => 'Espadon Grillé au Feu de Bois', 'name_en' => 'Grilled Swordfish', 'price' => 2200, 'sku' => 'SEA-006'],
            ['category_id' => 4, 'name_ar' => 'كروفات مشوي', 'name_fr' => 'Crevettes Royales Grillées', 'name_en' => 'Grilled King Prawns', 'price' => 2300, 'sku' => 'SEA-007'],
            ['category_id' => 4, 'name_ar' => 'كلمار مشوي', 'name_fr' => 'Calamars Grillés à l’Ail', 'name_en' => 'Grilled Calamari', 'price' => 2500, 'sku' => 'SEA-008'],
            ['category_id' => 4, 'name_ar' => 'فواكه البحر صوص', 'name_fr' => 'Poêlée Fruits de Mer en Sauce', 'name_en' => 'Seafood in Sauce', 'price' => 2300, 'sku' => 'SEA-009'],
            ['category_id' => 4, 'name_ar' => 'مشكل سمك شخص', 'name_fr' => 'Assiette Mixte Poissons (1 pers)', 'name_en' => 'Mixed Seafood Plate (1 person)', 'price' => 1600, 'sku' => 'SEA-010'],
            ['category_id' => 4, 'name_ar' => 'مشكل سمك شخصين', 'name_fr' => 'Plateau Mixte Poissons (2 pers)', 'name_en' => 'Mixed Seafood Platter (2 persons)', 'price' => 3600, 'sku' => 'SEA-011'],
            ['category_id' => 4, 'name_ar' => 'مشكل سمك 4 أشخاص', 'name_fr' => 'Grand Plateau Fruits de Mer (4 pers)', 'name_en' => 'Grand Seafood Feast (4 persons)', 'price' => 9500, 'sku' => 'SEA-012'],

            // ================= PIZZA (Prices are for Size L; Variants hold XL) =================
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا مارغوريت',
                'name_fr' => 'Pizza Margherita',
                'name_en' => 'Margherita Pizza',
                'price' => 350,
                'price_xl' => 700,
                'sku' => 'PIZ-001',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا تونة',
                'name_fr' => 'Pizza au Thon',
                'name_en' => 'Tuna Pizza',
                'price' => 400,
                'price_xl' => 800,
                'sku' => 'PIZ-002',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا دجاج',
                'name_fr' => 'Pizza au Poulet',
                'name_en' => 'Chicken Pizza',
                'price' => 400,
                'price_xl' => 800,
                'sku' => 'PIZ-003',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا لحم',
                'name_fr' => 'Pizza Viande Hachée',
                'name_en' => 'Beef Pizza',
                'price' => 500,
                'price_xl' => 1000,
                'sku' => 'PIZ-004',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا ثلاثة اجبان',
                'name_fr' => 'Pizza 3 Fromages',
                'name_en' => 'Three Cheese Pizza',
                'price' => 600,
                'price_xl' => 1100,
                'sku' => 'PIZ-005',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا اربعة فصول',
                'name_fr' => 'Pizza 4 Saisons',
                'name_en' => 'Four Seasons Pizza',
                'price' => 800,
                'price_xl' => 1500,
                'sku' => 'PIZ-006',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا خضروات',
                'name_fr' => 'Pizza Végétarienne',
                'name_en' => 'Vegetarian Pizza',
                'price' => 600,
                'price_xl' => 1100,
                'sku' => 'PIZ-007',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا دجاج مدخن',
                'name_fr' => 'Pizza Poulet Fumé',
                'name_en' => 'Smoked Chicken Pizza',
                'price' => 500,
                'price_xl' => 1000,
                'sku' => 'PIZ-008',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا لحم مدخن',
                'name_fr' => 'Pizza Viande Fumée',
                'name_en' => 'Smoked Beef Pizza',
                'price' => 600,
                'price_xl' => 1200,
                'sku' => 'PIZ-009',
            ],
            [
                'category_id' => 5,
                'name_ar' => 'بيتزا روايال',
                'name_fr' => 'Pizza Royale Spéciale',
                'name_en' => 'Royal Special Pizza',
                'price' => 1000,
                'price_xl' => 2000,
                'sku' => 'PIZ-010',
            ],

            // ================= المقبلات =================
            ['category_id' => 7, 'name_ar' => 'حمص', 'name_fr' => 'Houmous Maison', 'name_en' => 'Hummus with Olive Oil', 'price' => 250, 'sku' => 'APP-001'],
            ['category_id' => 7, 'name_ar' => 'شربة فريك', 'name_fr' => 'Chorba Frik Traditionnelle', 'name_en' => 'Traditional Chorba Frik', 'price' => 200, 'sku' => 'APP-002'],
            ['category_id' => 7, 'name_ar' => 'حريرة', 'name_fr' => 'Harira Gourmande', 'name_en' => 'Authentic Harira Soup', 'price' => 200, 'sku' => 'APP-003'],
            ['category_id' => 7, 'name_ar' => 'حساء حوت', 'name_fr' => 'Soupe de Poissons', 'name_en' => 'Fresh Fish Soup', 'price' => 400, 'sku' => 'APP-004'],
            ['category_id' => 7, 'name_ar' => 'حساء كروفات', 'name_fr' => 'Bisque de Crevettes', 'name_en' => 'Shrimp Soup', 'price' => 400, 'sku' => 'APP-005'],
            ['category_id' => 7, 'name_ar' => 'سلاطة', 'name_fr' => 'Salade Verte Fraîche', 'name_en' => 'Green Garden Salad', 'price' => 300, 'sku' => 'APP-006'],
            ['category_id' => 7, 'name_ar' => 'مسيدوان', 'name_fr' => 'Macédoine de Légumes', 'name_en' => 'Vegetable Macedoine Salad', 'price' => 300, 'sku' => 'APP-007'],
            ['category_id' => 7, 'name_ar' => 'سيزار', 'name_fr' => 'Salade César au Poulet', 'name_en' => 'Chicken Caesar Salad', 'price' => 400, 'sku' => 'APP-008'],
            ['category_id' => 7, 'name_ar' => 'سلاطة طون', 'name_fr' => 'Salade au Thon & Œuf', 'name_en' => 'Tuna Salad', 'price' => 400, 'sku' => 'APP-009'],
            ['category_id' => 7, 'name_ar' => 'سلاطة جزائرية', 'name_fr' => 'Salade Algérienne Poivrons & Tomates', 'name_en' => 'Algerian Pepper Salad', 'price' => 300, 'sku' => 'APP-010'],

            // ================= التحلية =================
            ['category_id' => 6, 'name_ar' => 'موس شوكولا', 'name_fr' => 'Mousse au Chocolat Noir', 'name_en' => 'Chocolate Mousse', 'price' => 300, 'sku' => 'DES-001'],
            ['category_id' => 6, 'name_ar' => 'سلطة فواكه', 'name_fr' => 'Salade de Fruits Frais', 'name_en' => 'Fresh Fruit Salad', 'price' => 400, 'sku' => 'DES-002'],
            ['category_id' => 6, 'name_ar' => 'فلان كراميل', 'name_fr' => 'Flan au Caramel Maison', 'name_en' => 'Caramel Flan', 'price' => 200, 'sku' => 'DES-003'],
            ['category_id' => 6, 'name_ar' => 'دلاع', 'name_fr' => 'Tranches de Pastèque Fraîche', 'name_en' => 'Fresh Watermelon', 'price' => 200, 'sku' => 'DES-004'],
            ['category_id' => 6, 'name_ar' => 'بطيخ', 'name_fr' => 'Tranches de Melon Jaune', 'name_en' => 'Sweet Melon', 'price' => 200, 'sku' => 'DES-005'],
            ['category_id' => 6, 'name_ar' => 'تيراميسو', 'name_fr' => 'Tiramisu Italien Maison', 'name_en' => 'Classic Tiramisu', 'price' => 300, 'sku' => 'DES-006'],
            ['category_id' => 6, 'name_ar' => 'كرام برولي', 'name_fr' => 'Crème Brûlée Caramélisée', 'name_en' => 'Crème Brûlée', 'price' => 300, 'sku' => 'DES-007'],

            // ================= المشروبات =================
            ['category_id' => 8, 'name_ar' => 'عصير كوكتال', 'name_fr' => 'Cocktail de Fruits Frais', 'name_en' => 'Fresh Fruit Cocktail', 'price' => 250, 'sku' => 'DRK-001'],
            ['category_id' => 8, 'name_ar' => 'كوكا كولا 33cl', 'name_fr' => 'Coca Cola Canette 33cl', 'name_en' => 'Coca Cola 33cl', 'price' => 120, 'sku' => 'DRK-002'],
            ['category_id' => 8, 'name_ar' => 'ماء معدني 0.5L', 'name_fr' => 'Eau Minérale 0.5L', 'name_en' => 'Mineral Water 0.5L', 'price' => 80, 'sku' => 'DRK-003'],
            ['category_id' => 8, 'name_ar' => 'قهوة إسبريسو', 'name_fr' => 'Café Espresso Illy', 'name_en' => 'Espresso Coffee', 'price' => 100, 'sku' => 'DRK-004'],
        ];

        foreach ($products as $index => $prod) {
            $productId = DB::table('products')->updateOrInsert(
                ['sku' => $prod['sku']],
                [
                    'name' => $prod['name_fr'],
                    'name_ar' => $prod['name_ar'],
                    'name_en' => $prod['name_en'],
                    'category_id' => $prod['category_id'],
                    'price' => $prod['price'],
                    'stock' => 100,
                    'min_stock' => 10,
                    'is_available' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // Add L / XL variants for pizzas
            if (isset($prod['price_xl'])) {
                // Find or insert variants
                // Variant L: $prod['price']
                // Variant XL: $prod['price_xl']
            }
        }
    }
}
