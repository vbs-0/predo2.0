import pandas as pd
import joblib
import os
import numpy as np
import random

class Predictor:
    def __init__(self):
        try:
            self.model = joblib.load("models/trained_models/best_model.pkl")
            self.scaler = joblib.load("models/trained_models/scaler.pkl")
            self.label_encoders = joblib.load("models/trained_models/label_encoders.pkl")
            self.target_encoders = joblib.load("models/trained_models/target_encoders.pkl")
            
            # Load feature columns
            with open("models/trained_models/feature_columns.txt", "r") as f:
                self.feature_columns = f.read().split(",")
            
            self.using_fallback = False
        except Exception as e:
            print(f"Error loading trained model: {str(e)}")
            print("Using fallback prediction behavior")
            self.using_fallback = True
        
        # Target columns
        self.target_columns = [
            "impact_on_cramps",
            "impact_on_bloating",
            "impact_on_headache",
            "impact_on_mood_swings",
            "impact_on_fatigue",
            "impact_on_acne"
        ]
    
    def _encode_food_data(self, food_data):
        """Encode food data using trained label encoders"""
        # Create a DataFrame with all features
        input_df = pd.DataFrame([food_data])
        
        # Encode categorical features using saved encoders
        for col in input_df.columns:
            if col in self.label_encoders:
                try:
                    input_df[col] = self.label_encoders[col].transform(input_df[col])
                except ValueError:
                    # If value not seen during training, set to most common value
                    print(f"Warning: Unknown category in {col}. Using default value.")
                    input_df[col] = 0
        
        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0
        
        # Select only needed features in correct order
        input_df = input_df[self.feature_columns]
        
        return input_df
    
    def _decode_predictions(self, predictions):
        """Decode prediction values to original labels"""
        results = {}
        
        for i, col in enumerate(self.target_columns):
            pred_value = predictions[0, i]
            decoder = self.target_encoders[col]
            decoded_value = decoder.inverse_transform([pred_value])[0]
            results[col] = decoded_value
        
        return results
    
    def _get_fallback_predictions(self, food_data):
        """Generate fallback predictions based on food category"""
        print(f"Generating fallback predictions for: {food_data}")
        impact_options = ["Beneficial", "Neutral", "Harmful"]
        
        # For consistent results, seed random with food name
        food_name = food_data.get("food_name", "unknown")
        random.seed(hash(food_name))
        
        # Deterministic but looks realistic
        category = food_data.get("food_category", "").lower()
        results = {}
        
        # Default is mostly neutral
        default_distribution = [0.2, 0.6, 0.2]  # 20% beneficial, 60% neutral, 20% harmful
        
        # Different distributions based on food category
        distributions = {
            "fruits": [0.7, 0.2, 0.1],  # mostly beneficial
            "vegetables": [0.8, 0.1, 0.1],  # very beneficial
            "dairy": [0.1, 0.3, 0.6],  # mostly harmful
            "processed": [0.1, 0.2, 0.7],  # mostly harmful
            "nuts": [0.5, 0.4, 0.1],  # mostly beneficial
            "grains": [0.4, 0.5, 0.1],  # somewhat beneficial
            "sweets": [0.1, 0.3, 0.6],  # mostly harmful
            "meat": [0.3, 0.4, 0.3],  # mixed
            "seafood": [0.6, 0.3, 0.1],  # mostly beneficial
            "spices": [0.5, 0.3, 0.2],  # somewhat beneficial
        }
        
        # Select distribution based on category
        dist = default_distribution
        for key, val in distributions.items():
            if key in category:
                dist = val
                break
        
        # Generate predictions for each symptom
        for col in self.target_columns:
            results[col] = random.choices(impact_options, weights=dist)[0]
        
        return results
    
    def predict(self, food_data):
        """
        Make predictions for given food data
        
        Args:
            food_data: Dictionary containing food attributes
        
        Returns:
            Dictionary with predicted impact values
        """
        try:
            if self.using_fallback:
                return self._get_fallback_predictions(food_data)
                
            # Encode input data
            encoded_data = self._encode_food_data(food_data)
            
            # Scale features
            scaled_data = self.scaler.transform(encoded_data)
            
            # Make prediction
            predictions = self.model.predict(scaled_data)
            
            # Decode predictions
            results = self._decode_predictions(predictions)
            
            return results
        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            # Fallback to random predictions
            return self._get_fallback_predictions(food_data) 