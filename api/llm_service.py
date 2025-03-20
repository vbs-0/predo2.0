import os
import requests
import json
import time

class GroqAPI:
    def __init__(self):
        # Try both API keys, use the first one that works
        self.api_keys = [
            "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",
            "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"
        ]
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.3-70b-versatile"
        
    def _make_request(self, endpoint, payload, api_key_index=0):
        """Make a request to the Groq API with retry logic for API keys"""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_keys[api_key_index]}"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/{endpoint}",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 401 and api_key_index < len(self.api_keys) - 1:
                # Try the next API key
                print(f"API key {api_key_index+1} failed. Trying next key...")
                return self._make_request(endpoint, payload, api_key_index + 1)
            else:
                print(f"API request failed: {response.status_code} - {response.text}")
                return {"error": response.text}
                
        except Exception as e:
            print(f"Error making API request: {str(e)}")
            if api_key_index < len(self.api_keys) - 1:
                # Try the next API key
                print(f"Trying next API key...")
                return self._make_request(endpoint, payload, api_key_index + 1)
            else:
                return {"error": str(e)}
    
    def get_food_attributes(self, food_name):
        """Get food attributes from the LLM, including corrected food name"""
        prompt = f"""
        You are a nutritional expert. I need detailed information about {food_name}.
        Please provide the following attributes for this food in JSON format.
        
        IMPORTANT: First determine if this is actually a food item that humans typically eat. 
        If it's not a food item (like "keyboard", "book", "car", etc.), set "is_non_edible" to true.
        
        If the user has a non-standard name, provide the standard name in the food_name field.

        1. is_non_edible (boolean, set to true if this is not a food item that humans eat)
        2. food_name (the correct standard name for this food, fixing any spelling mistakes)
        3. food_category (e.g., Fruits, Vegetables, Grains, Proteins, Dairy, Nuts & Seeds, Beverages, etc.)
        4. food_subcategory (more specific category, e.g., Berries, Leafy Greens, Whole Grains, etc.)
        5. processing_level (Natural, Minimally Processed, Processed, Ultra-Processed)
        6. caffeine_content_mg (numeric value, 0 if none)
        7. flavor_profile (Sweet, Sour, Bitter, Spicy, Neutral, etc.)
        8. common_allergens (None, Dairy, Nuts, Gluten, Eggs, Soy, etc. - choose the most relevant or None)
        9. glycemic_index (numeric value between 0-100)
        10. inflammatory_index (numeric value between 1-10, where 1 is anti-inflammatory and 10 is highly inflammatory)
        11. calories_kcal (numeric value per 100g)
        
        Return only the JSON object with these attributes, nothing else.
        """

# test will be conducted based on what we have done till now and then we can proceed based on that and for that generate a complete documentation based on the json u generated previusly and then use that as referance to test it 



        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a precise nutritional database that returns only JSON data for foods."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 500
        }
        
        response = self._make_request("chat/completions", payload)
        
        if "error" in response:
            # Return default values if API fails
            return self._get_default_food_attributes(food_name)
        
        try:
            content = response["choices"][0]["message"]["content"]
            # Extract JSON object from the response
            json_str = content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
            
            attributes = json.loads(json_str)
            
            # Check if this is a non-edible item
            if attributes.get('is_non_edible', False) == True:
                # Return a simplified structure for non-edible items
                return {
                    "name": food_name,
                    "category": "None",
                    "subcategory": "None",
                    "processing_level": "None",
                    "calories": "Unknown",
                    "glycemic_index": "Unknown",
                    "inflammatory_index": "1/10",
                    "allergens": "None",
                    "is_non_edible": True
                }
            
            # For regular food items, use the original name provided by the user
            attributes["food_name"] = food_name
            return attributes
        except Exception as e:
            print(f"Error parsing LLM response: {str(e)}")
            print(f"Raw response: {response}")
            # Return default values if parsing fails
            return self._get_default_food_attributes(food_name)
    
    def _get_default_food_attributes(self, food_name):
        """Return default values if the API fails"""
        return {
            "food_name": food_name,
            "food_category": "Unspecified",
            "food_subcategory": "Unspecified",
            "processing_level": "Natural",
            "caffeine_content_mg": 0,
            "flavor_profile": "Neutral",
            "common_allergens": "None",
            "glycemic_index": 50,
            "inflammatory_index": 5,
            "calories_kcal": 100,
            "is_non_edible": False
        }
    
    def chat(self, message, conversation_history=None):
        """General chat functionality"""
        if conversation_history is None:
            conversation_history = []
            
        messages = [
            {"role": "system", "content": "You are a helpful nutrition assistant specialized in women's health and menstruation. Be concise, informative, and supportive."}
        ] + conversation_history + [
            {"role": "user", "content": message}
        ]
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 800
        }
        
        response = self._make_request("chat/completions", payload)
        
        if "error" in response:
            return "I'm having trouble connecting to my knowledge base right now. Please try again later."
        
        try:
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Error parsing chat response: {str(e)}")
            return "I'm having trouble generating a response right now. Please try again."

    def get_structured_response(self, prompt):
        """Get a structured JSON response from the LLM"""
        messages = [
            {"role": "system", "content": "You are a wellness expert specializing in women's health and menstrual wellness. Provide detailed, structured responses in valid JSON format only."},
            {"role": "user", "content": prompt}
        ]
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 1000
        }
        
        response = self._make_request("chat/completions", payload)
        
        if "error" in response:
            # Return a default structured response if API fails
            return json.dumps({
                "activity_name": "Gentle Yoga Flow",
                "description": "A gentle sequence of yoga poses to help manage menstrual symptoms",
                "steps": [
                    "Find a quiet, comfortable space with room for a yoga mat",
                    "Begin with 5 minutes of deep breathing to center yourself",
                    "Start with gentle Cat-Cow stretches to warm up the spine",
                    "Move to Child's Pose to relieve tension",
                    "Try a gentle forward fold to stretch hamstrings",
                    "Practice a supported bridge pose using pillows",
                    "End with a 5-minute Savasana for deep relaxation"
                ],
                "extras": "Yoga mat, comfortable clothing, optional pillows for support",
                "benefits": "Reduces cramping, improves circulation, releases tension, and balances mood"
            })
        
        try:
            content = response["choices"][0]["message"]["content"]
            # Extract JSON from response if needed
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
            else:
                json_str = content
                
            # Validate JSON by parsing it
            json.loads(json_str)
            return json_str
            
        except Exception as e:
            print(f"Error parsing structured response: {str(e)}")
            # Return fallback response
            return json.dumps({
                "activity_name": "Mindful Walking",
                "description": "A simple walking meditation to ease menstrual discomfort",
                "steps": [
                    "Find a peaceful path or area where you can walk uninterrupted",
                    "Begin by standing still and taking 3 deep breaths",
                    "Start walking at a comfortable, slow pace",
                    "Focus on each step, feeling your feet connect with the ground",
                    "Notice your breathing, syncing it with your steps",
                    "Walk for 10-15 minutes, maintaining awareness",
                    "End by standing still and acknowledging how you feel"
                ],
                "extras": "Comfortable shoes, weather-appropriate clothing",
                "benefits": "Reduces stress hormones, improves circulation, provides gentle movement without strain"
            })
            
    def get_scientific_explanation(self, prompt):
        """Get a scientific explanation from the LLM"""
        messages = [
            {"role": "system", "content": "You are a medical expert specializing in women's health, hormones, and exercise physiology. Provide evidence-based, scientifically accurate explanations."},
            {"role": "user", "content": prompt}
        ]
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 800
        }
        
        response = self._make_request("chat/completions", payload)
        
        if "error" in response:
            # Return default explanation if API fails
            return [
                "Hormonal fluctuations during this phase affect neurotransmitters that influence mood and energy levels.",
                "This activity helps release endorphins and reduces cortisol, which is particularly beneficial for hormonal balance.",
                "The movements improve circulation and oxygen delivery to tissues, helping relieve menstrual discomfort.",
                "Research shows that mindful movement can help regulate the nervous system during hormonal fluctuations.",
                "This activity targets muscle groups that tend to hold tension during this specific phase of your cycle."
            ]
        
        try:
            content = response["choices"][0]["message"]["content"]
            # Process the response to extract key points
            lines = content.split('\n')
            points = []
            current_point = ""
            
            for line in lines:
                line = line.strip()
                # Skip empty lines
                if not line:
                    continue
                    
                # If line starts with a number or bullet, it's a new point
                if line[0].isdigit() and '. ' in line[:3]:
                    if current_point:
                        points.append(current_point)
                    current_point = line[line.find('.')+1:].strip()
                elif line.startswith('- '):
                    if current_point:
                        points.append(current_point)
                    current_point = line[2:].strip()
                elif line.startswith('• '):
                    if current_point:
                        points.append(current_point)
                    current_point = line[2:].strip()
                else:
                    # Continue current point
                    if current_point:
                        current_point += " " + line
                    else:
                        current_point = line
            
            # Add the last point
            if current_point:
                points.append(current_point)
                
            # If no points were extracted, split by sentences
            if not points:
                import re
                points = re.split(r'(?<=[.!?])\s+', content)
                # Filter out short sentences and limit to 5 points
                points = [p for p in points if len(p) > 20][:5]
                
            return points
            
        except Exception as e:
            print(f"Error parsing explanation response: {str(e)}")
            # Return fallback explanation
            return [
                "During this menstrual phase, specific hormonal changes affect both physical comfort and mood regulation.",
                "The recommended activity works by stimulating endorphin release while reducing inflammation markers.",
                "Research indicates that gentle movement during this phase can improve blood flow to the uterus, reducing cramping.",
                "The mind-body connection activated by this activity helps regulate cortisol levels, which fluctuate during menstruation.",
                "Specific muscle groups targeted by this activity help release tension that accumulates due to hormonal changes."
            ] 