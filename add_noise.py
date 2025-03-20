import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

def add_noise_to_dataset(input_file, output_file, noise_level=0.6):
    """
    Add noise to both numerical and categorical features in a dataset.
    
    Parameters:
        input_file (str): Path to the input CSV file
        output_file (str): Path to save the noisy dataset
        noise_level (float): Intensity of noise to add (default: 0.6)
    """
    # Load the dataset
    df = pd.read_csv(input_file)
    
    # Add noise to all features
    for col in df.columns:
        # For numerical columns
        if df[col].dtype in ['int64', 'float64']:
            original_values = df[col].values
            col_std = original_values.std()
            noise = np.random.normal(0, noise_level * col_std, size=len(original_values))
            noisy_values = original_values + noise
            df[col] = np.clip(noisy_values, original_values.min(), original_values.max())
        
        # For categorical columns
        elif df[col].dtype == 'object':
            # Get unique categories
            categories = df[col].unique()
            if len(categories) > 1:
                # Randomly flip a percentage of values to other categories
                mask = np.random.random(size=len(df)) < noise_level
                if mask.any():
                    # For each value to flip, choose a random different category
                    new_values = np.random.choice(
                        [c for c in categories if c != df[col].iloc[0]], 
                        size=mask.sum()
                    )
                    df.loc[mask, col] = new_values
    
    # Save the noisy dataset
    df.to_csv(output_file, index=False)
    print(f"Noisy dataset saved to {output_file}")

if __name__ == "__main__":
    # Input and output file paths
    input_file = "menstruation_food_recommendations_working.csv"
    output_file = "menstruation_food_recommendations_noisy.csv"
    
    # Add noise with a standard deviation of 60% of each feature's standard deviation
    add_noise_to_dataset(input_file, output_file, noise_level=0.1)
