import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.metrics import roc_curve, auc, accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.multioutput import MultiOutputClassifier
import joblib
import os

# Create directories if they don't exist
os.makedirs("models/trained_models", exist_ok=True)
os.makedirs("static/images", exist_ok=True)

# Load the dataset
print("Loading dataset...")
df = pd.read_csv("menstruation_food_recommendations_noisy.csv")

# Define target variables
target_columns = [
    "impact_on_cramps",
    "impact_on_bloating",
    "impact_on_headache",
    "impact_on_mood_swings",
    "impact_on_fatigue",
    "impact_on_acne"
]

# Print dataset info
print(f"Dataset shape: {df.shape}")
print(f"Target columns: {target_columns}")

# Encode categorical features
categorical_cols = df.select_dtypes(include=['object']).columns
label_encoders = {}

for col in categorical_cols:
    if col not in target_columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

# Encode target variables
target_encoders = {}
for col in target_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    target_encoders[col] = le

# Save label encoders
joblib.dump(label_encoders, "models/trained_models/label_encoders.pkl")
joblib.dump(target_encoders, "models/trained_models/target_encoders.pkl")

# Define features
feature_columns = [col for col in df.columns if col not in target_columns and col not in ['user_id', 'name']]

# Split data
X = df[feature_columns]
y = df[target_columns]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Save scaler
joblib.dump(scaler, "models/trained_models/scaler.pkl")

# Define models to train
models = {
    "Logistic Regression": MultiOutputClassifier(LogisticRegression(max_iter=1000)),
    "Random Forest": MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42)),
    "Gradient Boosting": MultiOutputClassifier(GradientBoostingClassifier(n_estimators=100, random_state=42)),
    "SVM": MultiOutputClassifier(SVC(probability=True, random_state=42))
}

# Dictionary to store results
results = {}
best_model_name = None
best_score = 0

# Train and evaluate each model
for name, model in models.items():
    print(f"Training {name}...")
    model.fit(X_train_scaled, y_train)
    
    # Predict on test set
    y_pred = model.predict(X_test_scaled)
    
    # Calculate metrics for each target separately and average
    accuracies = []
    precisions = []
    recalls = []
    f1s = []
    
    for i in range(y_test.shape[1]):
        accuracies.append(accuracy_score(y_test.iloc[:, i], y_pred[:, i]))
        precisions.append(precision_score(y_test.iloc[:, i], y_pred[:, i], 
                        average='weighted', zero_division=0))
        recalls.append(recall_score(y_test.iloc[:, i], y_pred[:, i], 
                      average='weighted', zero_division=0))
        f1s.append(f1_score(y_test.iloc[:, i], y_pred[:, i], 
                  average='weighted', zero_division=0))
    
    accuracy = np.mean(accuracies)
    precision = np.mean(precisions)
    recall = np.mean(recalls)
    f1 = np.mean(f1s)
    
    print(f"{name} - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")
    
    # Store results
    results[name] = {
        'model': model,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'y_pred_proba': model.predict_proba(X_test_scaled)
    }
    
    # Update best model
    if accuracy > best_score:
        best_score = accuracy
        best_model_name = name

# Print classification report for best model
best_model = results[best_model_name]['model']
y_pred = best_model.predict(X_test_scaled)
print(f"\nBest model: {best_model_name} with accuracy {best_score:.4f}")
print("\nClassification Report for Best Model:")
for i, target in enumerate(target_columns):
    print(f"\nTarget: {target}")
    print(classification_report(y_test.iloc[:, i], y_pred[:, i], zero_division=0))

# Save best model
joblib.dump(best_model, f"models/trained_models/best_model.pkl")
print(f"Best model saved: {best_model_name}")

# Save feature columns
with open("models/trained_models/feature_columns.txt", "w") as f:
    f.write(",".join(feature_columns))

# Plot ROC curves for all models
plt.figure(figsize=(15, 10))

for target_idx, target in enumerate(target_columns):
    plt.subplot(2, 3, target_idx + 1)
    
    for name in models.keys():
        # Get binary predictions for this target
        y_test_binary = y_test.iloc[:, target_idx]
        y_score = results[name]['y_pred_proba'][target_idx]
        
        # Calculate ROC curve
        fpr = {}
        tpr = {}
        roc_auc = {}
        
        for i in range(len(np.unique(y_test_binary))):
            # Convert to one-vs-rest for ROC
            y_binary = (y_test_binary == i).astype(int)
            if y_score.shape[1] > i:  # Check if the model has predictions for this class
                fpr[i], tpr[i], _ = roc_curve(y_binary, y_score[:, i])
                roc_auc[i] = auc(fpr[i], tpr[i])
        
        # Plot ROC curve for each class
        for i in range(len(np.unique(y_test_binary))):
            if i in roc_auc:
                plt.plot(fpr[i], tpr[i], lw=2, 
                         label=f'{name} - Class {i} (AUC = {roc_auc[i]:.2f})')
    
    plt.plot([0, 1], [0, 1], 'k--', lw=2)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve - {target}')
    plt.legend(loc="lower right", fontsize='small')

plt.tight_layout()
plt.savefig("static/images/roc_curves.png")
print("ROC curves saved to static/images/roc_curves.png")

# Create a summary of model performances
summary_df = pd.DataFrame({
    'Model': list(results.keys()),
    'Accuracy': [results[model]['accuracy'] for model in results],
    'Precision': [results[model]['precision'] for model in results],
    'Recall': [results[model]['recall'] for model in results],
    'F1 Score': [results[model]['f1'] for model in results]
})

summary_df.to_csv("models/trained_models/model_performance.csv", index=False)
print("Model performance summary saved to models/trained_models/model_performance.csv")

print("\nTraining complete!")
print(f"Best model: {best_model_name}")
print(f"Saved to: models/trained_models/best_model.pkl") 