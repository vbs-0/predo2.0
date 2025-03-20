import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * This module handles the processing of food items for dietary recommendations
 * related to menstruation, including their nutritional impacts and user profiles.
 */
public class creator {
    // Static random instance
    private static final Random rand = new Random();
    
    // Refined food categories with proper subcategories
    // Map<String, List<String>>
    private static final Map<String, List<String>> food_categories = new LinkedHashMap<>();
    // Food items mapped to their categories and subcategories
    // Map<String, Object[]> where Object[] contains:
    // [category (String), subcat (String), processing_level (String), caffeine (Integer), flavor (String), allergens (String)]
    private static final Map<String, Object[]> food_mapping = new LinkedHashMap<>();
    // Nutritional data based on food category (more realistic ranges)
    // Map<String, Map<String, int[]>> where inner int[] contains two values representing ranges.
    private static final Map<String, Map<String, int[]>> category_nutrition = new LinkedHashMap<>();
    
    static {
        // Initialize food_categories
        food_categories.put("Fruits", List.of("Berries", "Citrus", "Tropical Fruits", "Stone Fruits", "Core Fruits"));
        food_categories.put("Vegetables", List.of("Leafy Greens", "Root Vegetables", "Cruciferous", "Alliums", "Nightshades"));
        food_categories.put("Proteins", List.of("Fish", "Poultry", "Red Meat", "Plant Protein", "Eggs"));
        food_categories.put("Dairy", List.of("Milk", "Cheese", "Yogurt", "Kefir", "Butter"));
        food_categories.put("Grains", List.of("Whole Grains", "Refined Grains", "Pseudograins", "Bread", "Pasta"));
        food_categories.put("Nuts & Seeds", List.of("Tree Nuts", "Seeds", "Nut Butters"));
        food_categories.put("Legumes", List.of("Beans", "Lentils", "Peas", "Soy Products"));
        food_categories.put("Beverages", List.of("Herbal Tea", "Coffee", "Alcohol", "Smoothies", "Juice"));
        food_categories.put("Herbs & Spices", List.of("Herbs", "Spices", "Adaptogens"));
        food_categories.put("Oils & Fats", List.of("Plant Oils", "Animal Fats", "MCT Oils"));
        
        // Initialize food_mapping
        food_mapping.put("Blueberries", new Object[]{"Fruits", "Berries", "Natural", 0, "Sweet", "None"});  // Typical food item
        food_mapping.put("Strawberries", new Object[]{"Fruits", "Berries", "Natural", 0, "Sweet", "None"});
        food_mapping.put("Oranges", new Object[]{"Fruits", "Citrus", "Natural", 0, "Sweet", "None"});
        food_mapping.put("Bananas", new Object[]{"Fruits", "Tropical Fruits", "Natural", 0, "Sweet", "None"});
        food_mapping.put("Avocados", new Object[]{"Fruits", "Tropical Fruits", "Natural", 0, "Neutral", "None"});
        
        food_mapping.put("Spinach", new Object[]{"Vegetables", "Leafy Greens", "Natural", 0, "Bitter", "None"});
        food_mapping.put("Kale", new Object[]{"Vegetables", "Leafy Greens", "Natural", 0, "Bitter", "None"});
        food_mapping.put("Broccoli", new Object[]{"Vegetables", "Cruciferous", "Natural", 0, "Bitter", "None"});
        food_mapping.put("Sweet Potatoes", new Object[]{"Vegetables", "Root Vegetables", "Natural", 0, "Sweet", "None"});
        food_mapping.put("Garlic", new Object[]{"Vegetables", "Alliums", "Natural", 0, "Spicy", "None"});
        
        food_mapping.put("Salmon", new Object[]{"Proteins", "Fish", "Natural", 0, "Neutral", "None"});
        food_mapping.put("Chicken Breast", new Object[]{"Proteins", "Poultry", "Natural", 0, "Neutral", "None"});
        food_mapping.put("Grass-fed Beef", new Object[]{"Proteins", "Red Meat", "Natural", 0, "Neutral", "None"});
        food_mapping.put("Tofu", new Object[]{"Proteins", "Plant Protein", "Minimally Processed", 0, "Neutral", "Soy"});
        food_mapping.put("Eggs", new Object[]{"Proteins", "Eggs", "Natural", 0, "Neutral", "Eggs"});
        
        food_mapping.put("Greek Yogurt", new Object[]{"Dairy", "Yogurt", "Minimally Processed", 0, "Sour", "Dairy"});
        food_mapping.put("Kefir", new Object[]{"Dairy", "Kefir", "Minimally Processed", 0, "Sour", "Dairy"});
        food_mapping.put("Cheddar Cheese", new Object[]{"Dairy", "Cheese", "Minimally Processed", 0, "Salty", "Dairy"});
        
        food_mapping.put("Quinoa", new Object[]{"Grains", "Pseudograins", "Minimally Processed", 0, "Neutral", "None"});
        food_mapping.put("Brown Rice", new Object[]{"Grains", "Whole Grains", "Minimally Processed", 0, "Neutral", "None"});
        food_mapping.put("White Bread", new Object[]{"Grains", "Bread", "Highly Processed", 0, "Neutral", "Gluten"});
        
        food_mapping.put("Almonds", new Object[]{"Nuts & Seeds", "Tree Nuts", "Natural", 0, "Neutral", "Nuts"});
        food_mapping.put("Flaxseeds", new Object[]{"Nuts & Seeds", "Seeds", "Natural", 0, "Bitter", "None"});
        food_mapping.put("Chia Seeds", new Object[]{"Nuts & Seeds", "Seeds", "Natural", 0, "Neutral", "None"});
        
        food_mapping.put("Lentils", new Object[]{"Legumes", "Lentils", "Minimally Processed", 0, "Neutral", "None"});
        food_mapping.put("Black Beans", new Object[]{"Legumes", "Beans", "Minimally Processed", 0, "Neutral", "None"});
        
        food_mapping.put("Peppermint Tea", new Object[]{"Beverages", "Herbal Tea", "Minimally Processed", 0, "Bitter", "None"});
        food_mapping.put("Coffee", new Object[]{"Beverages", "Coffee", "Minimally Processed", 150, "Bitter", "None"});
        food_mapping.put("Red Wine", new Object[]{"Beverages", "Alcohol", "Minimally Processed", 0, "Bitter", "None"});
        
        food_mapping.put("Turmeric", new Object[]{"Herbs & Spices", "Spices", "Natural", 0, "Bitter", "None"});
        food_mapping.put("Ginger", new Object[]{"Herbs & Spices", "Spices", "Natural", 0, "Spicy", "None"});
        food_mapping.put("Cinnamon", new Object[]{"Herbs & Spices", "Spices", "Natural", 0, "Sweet", "None"});
        
        food_mapping.put("Olive Oil", new Object[]{"Oils & Fats", "Plant Oils", "Minimally Processed", 0, "Neutral", "None"});
        food_mapping.put("Coconut Oil", new Object[]{"Oils & Fats", "Plant Oils", "Minimally Processed", 0, "Sweet", "None"});
        food_mapping.put("Dark Chocolate", new Object[]{"Confectionery", "Chocolate", "Minimally Processed", 20, "Bitter", "None"});
        
        // Initialize category_nutrition
        Map<String, int[]> fruitsNutrition = new LinkedHashMap<>();
        fruitsNutrition.put("calories", new int[]{40, 120});         // Lower calorie range for fruits
        fruitsNutrition.put("carbs", new int[]{10, 25});             // Higher carb content
        fruitsNutrition.put("proteins", new int[]{1, 2});          // Low protein (0.5 rounded to 1)
        fruitsNutrition.put("fats", new int[]{0, 1});              // Low fat (except avocados)
        category_nutrition.put("Fruits", fruitsNutrition);
        
        Map<String, int[]> vegetablesNutrition = new LinkedHashMap<>();
        vegetablesNutrition.put("calories", new int[]{20, 80});          // Very low calories
        vegetablesNutrition.put("carbs", new int[]{2, 15});              // Variable carbs
        vegetablesNutrition.put("proteins", new int[]{1, 4});            // Some protein
        vegetablesNutrition.put("fats", new int[]{0, 1});              // Very low fat
        category_nutrition.put("Vegetables", vegetablesNutrition);
        
        Map<String, int[]> proteinsNutrition = new LinkedHashMap<>();
        proteinsNutrition.put("calories", new int[]{100, 250});        // Higher calories
        proteinsNutrition.put("carbs", new int[]{0, 2});               // Low carbs
        proteinsNutrition.put("proteins", new int[]{20, 35});          // High protein
        proteinsNutrition.put("fats", new int[]{2, 20});               // Variable fat
        category_nutrition.put("Proteins", proteinsNutrition);
        
        Map<String, int[]> dairyNutrition = new LinkedHashMap<>();
        dairyNutrition.put("calories", new int[]{50, 400});         // Variable calories
        dairyNutrition.put("carbs", new int[]{2, 12});              // Some carbs (lactose)
        dairyNutrition.put("proteins", new int[]{3, 25});           // Good protein source
        dairyNutrition.put("fats", new int[]{0, 35});               // Variable fat
        category_nutrition.put("Dairy", dairyNutrition);
        
        Map<String, int[]> grainsNutrition = new LinkedHashMap<>();
        grainsNutrition.put("calories", new int[]{100, 350});        // Higher calories
        grainsNutrition.put("carbs", new int[]{20, 70});             // High carbs
        grainsNutrition.put("proteins", new int[]{2, 15});           // Some protein
        grainsNutrition.put("fats", new int[]{1, 3});              // Low fat (0.5 rounded to 1)
        category_nutrition.put("Grains", grainsNutrition);
        
        Map<String, int[]> nutsNutrition = new LinkedHashMap<>();
        nutsNutrition.put("calories", new int[]{500, 650});        // High calories
        nutsNutrition.put("carbs", new int[]{5, 20});              // Lower carbs
        nutsNutrition.put("proteins", new int[]{15, 25});          // Good protein
        nutsNutrition.put("fats", new int[]{40, 60});              // High healthy fats
        category_nutrition.put("Nuts & Seeds", nutsNutrition);
        
        Map<String, int[]> legumesNutrition = new LinkedHashMap<>();
        legumesNutrition.put("calories", new int[]{100, 150});        // Moderate calories
        legumesNutrition.put("carbs", new int[]{15, 25});             // Moderate carbs
        legumesNutrition.put("proteins", new int[]{7, 15});           // Good plant protein
        legumesNutrition.put("fats", new int[]{1, 3});              // Low fat (0.5 rounded to 1)
        category_nutrition.put("Legumes", legumesNutrition);
        
        Map<String, int[]> beveragesNutrition = new LinkedHashMap<>();
        beveragesNutrition.put("calories", new int[]{0, 150});          // Variable calories
        beveragesNutrition.put("carbs", new int[]{0, 15});              // Variable carbs
        beveragesNutrition.put("proteins", new int[]{0, 2});            // Low protein
        beveragesNutrition.put("fats", new int[]{0, 5});                // Low fat
        category_nutrition.put("Beverages", beveragesNutrition);
        
        Map<String, int[]> herbsNutrition = new LinkedHashMap<>();
        herbsNutrition.put("calories", new int[]{5, 50});           // Very low calories
        herbsNutrition.put("carbs", new int[]{1, 10});              // Low carbs
        herbsNutrition.put("proteins", new int[]{0, 2});            // Very low protein
        herbsNutrition.put("fats", new int[]{0, 2});                // Very low fat
        category_nutrition.put("Herbs & Spices", herbsNutrition);
        
        Map<String, int[]> oilsNutrition = new LinkedHashMap<>();
        oilsNutrition.put("calories", new int[]{800, 900});        // Very high calories
        oilsNutrition.put("carbs", new int[]{0, 0});               // No carbs
        oilsNutrition.put("proteins", new int[]{0, 0});            // No protein
        oilsNutrition.put("fats", new int[]{90, 100});             // All fat
        category_nutrition.put("Oils & Fats", oilsNutrition);
    }
    
    /**
     * Calculate the symptom impact based on the food properties.
     */
    public static Map<String, String> calculate_symptom_impact(String food_name, String category, int inflammatory_index, int glycemic_index, String processing_level) {
        Map<String, String> impact = new LinkedHashMap<>();
        
        // Default impact
        String default_impact = "Neutral";
        
        // Anti-inflammatory foods generally help with cramps, bloating, headaches
        if (inflammatory_index < 3) {  // Beneficial for low inflammatory index
            impact.put("cramps", "Beneficial");
            impact.put("bloating", "Beneficial");
            impact.put("headache", "Beneficial");
        } else if (inflammatory_index > 6) {
            impact.put("cramps", "Harmful");
            impact.put("bloating", "Harmful");
            impact.put("headache", "Harmful");
        } else {
            impact.put("cramps", default_impact);
            impact.put("bloating", default_impact);
            impact.put("headache", default_impact);
        }
        
        // High glycemic foods can worsen mood swings and fatigue
        if (glycemic_index > 70) {
            impact.put("mood_swings", "Harmful");
            impact.put("fatigue", "Harmful");
        } else if (glycemic_index < 40) {
            impact.put("mood_swings", "Beneficial");
            impact.put("fatigue", "Beneficial");
        } else {
            impact.put("mood_swings", default_impact);
            impact.put("fatigue", default_impact);
        }
        
        // Highly processed foods generally worsen acne
        if ("Highly Processed".equals(processing_level)) {
            impact.put("acne", "Harmful");
        } else if ("Natural".equals(processing_level) && (category.equals("Vegetables") || category.equals("Fruits"))) {
            impact.put("acne", "Beneficial");
        } else {
            impact.put("acne", default_impact);
        }
    
        return impact;
    }
    
    /**
     * Generate food items.
     */
    public static List<LinkedHashMap<String, Object>> generate_food_items() {
        List<LinkedHashMap<String, Object>> foods = new ArrayList<>();
        for (Map.Entry<String, Object[]> entry : food_mapping.entrySet()) {
            String food_name = entry.getKey();
            Object[] details = entry.getValue();
            String category = (String) details[0];
            String subcat = (String) details[1];
            String processing = (String) details[2];
            int caffeine = (Integer) details[3];
            String flavor = (String) details[4];
            String allergens = (String) details[5];
            
            int gi = rand.nextInt(70 - 30 + 1) + 30;  // Placeholder for the actual glycemic index extraction
            int inflam = rand.nextInt(10 - 1 + 1) + 1;  // Placeholder for the actual inflammatory index extraction
            Map<String, int[]> nutrition = category_nutrition.getOrDefault(category, new LinkedHashMap<>());
            
            int cal;
            if (nutrition.containsKey("calories")) {
                int[] range = nutrition.get("calories");
                cal = rand.nextInt(range[1] - range[0] + 1) + range[0];  // Calculate calories based on category
            } else {
                cal = 0;  // Default value if no nutrition info is available
            }
            
            Map<String, String> impact = calculate_symptom_impact(food_name, category, inflam, gi, processing);
            
            LinkedHashMap<String, Object> food = new LinkedHashMap<>();
            food.put("food_id", foods.size() + 1);
            food.put("food_name", food_name);
            food.put("food_category", category);
            food.put("food_subcategory", subcat);
            food.put("processing_level", processing);
            food.put("caffeine_content_mg", caffeine);
            food.put("flavor_profile", flavor);
            food.put("common_allergens", allergens);
            food.put("glycemic_index", gi);
            food.put("inflammatory_index", inflam);
            food.put("calories_kcal", Math.round(cal));
          
            
            // Add impact keys to the food map
            for (Map.Entry<String, String> imp : impact.entrySet()) {
                food.put("impact_on_" + imp.getKey(), imp.getValue());
            }
            foods.add(food);
        }
        return foods;
    }
    
    /**
     * Generate users.
     */
    public static List<LinkedHashMap<String, Object>> generate_users(int num_users) {
        List<LinkedHashMap<String, Object>> users = new ArrayList<>();
        String[] preferences = {"Low Carb", "Balanced", "High Protein"};
        for (int uid = 1; uid <= num_users; uid++) {
            LinkedHashMap<String, Object> user = new LinkedHashMap<>();
            user.put("user_id", uid);
            user.put("name", "User" + uid);
            user.put("preference", preferences[rand.nextInt(preferences.length)]);
            user.put("age", rand.nextInt(65 - 18 + 1) + 18);
            users.add(user);
        }
        return users;
    }
    
    /**
     * Generate the final dataset by merging users with sampled food items.
     */
    public static List<LinkedHashMap<String, Object>> generate_dataset() {
        List<LinkedHashMap<String, Object>> foods_df = generate_food_items();
        List<LinkedHashMap<String, Object>> users_df = generate_users(1000);
        List<LinkedHashMap<String, Object>> dataset = new ArrayList<>();
        
        for (LinkedHashMap<String, Object> user : users_df) {
            // Create a copy of foods list
            List<LinkedHashMap<String, Object>> compatible = new ArrayList<>(foods_df);
            // Randomly select between 8 and 12 food items without replacement
            int sampleSize = rand.nextInt(12 - 8 + 1) + 8;
            Collections.shuffle(compatible, rand);
            List<LinkedHashMap<String, Object>> selected = compatible.subList(0, Math.min(sampleSize, compatible.size()));
            
            for (LinkedHashMap<String, Object> food : selected) {
                // Merge user and food data into one entry
                LinkedHashMap<String, Object> entry = new LinkedHashMap<>();
                entry.putAll(user);
                entry.putAll(food);
                dataset.add(entry);
            }
        }
        return dataset;
    }
    
    public static void main(String[] args) {
        // Generate the final dataset
        List<LinkedHashMap<String, Object>> full_dataset = generate_dataset();
        // Save final dataset to CSV file
        String fileName = "food_done_final.csv";
        writeCSV(full_dataset, fileName);
        System.out.println("Dataset generated with " + full_dataset.size() + " entries");
    }
    
    /**
     * Write the dataset to a CSV file.
     */
    public static void writeCSV(List<LinkedHashMap<String, Object>> dataset, String fileName) {
        if (dataset.isEmpty()) {
            return;
        }
        
        // Retrieve header from the first entry (preserving insertion order)
        List<String> headers = new ArrayList<>(dataset.get(0).keySet());
        
        try (PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            // Write header row
            writer.println(String.join(",", headers));
            // Write data rows
            for (Map<String, Object> row : dataset) {
                List<String> values = new ArrayList<>();
                for (String header : headers) {
                    Object value = row.get(header);
                    values.add(value != null ? value.toString() : "");
                }
                writer.println(String.join(",", values));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
