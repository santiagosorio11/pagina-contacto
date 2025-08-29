import json
import os
from urllib.parse import quote

# Load the existing models.json file
with open('json/models.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Path to the mujeres directory
mujeres_dir = 'models/mujeres'

# Function to create URL-safe path
def create_safe_path(path):
    # Replace backslashes with forward slashes and URL encode
    return '/' + '/'.join(quote(part) for part in path.split('/'))

# Function to normalize names for comparison
def normalize_name(name):
    return name.upper().replace(' ', '').replace('-', '').replace('_', '')

# Get all folder names in the mujeres directory
folder_names = [f for f in os.listdir(mujeres_dir) if os.path.isdir(os.path.join(mujeres_dir, f))]

# Create a mapping of normalized folder names to actual folder names
folder_mapping = {normalize_name(folder): folder for folder in folder_names}

# List of women to update
women_to_update = ['floriane', 'gaelle', 'giulia']

# Iterate through all models
for model in data['models']:
    if model['category'] == 'women' and model['id'] in women_to_update:
        model_name = model['name'].upper()
        model_id = model['id'].upper()
        
        # Try to find a matching folder
        # First try exact match with model name
        folder_name = None
        normalized_model_name = normalize_name(model_name)
        
        if normalized_model_name in folder_mapping:
            folder_name = folder_mapping[normalized_model_name]
        else:
            # Try with model id
            normalized_model_id = normalize_name(model_id)
            if normalized_model_id in folder_mapping:
                folder_name = folder_mapping[normalized_model_id]
        
        # Special cases
        if model_id == 'FLORIANE':
            # Look for folder containing 'floriane' and 'ribeiro'
            for folder in folder_names:
                if 'FLORIANE' in folder.upper() and 'RIBEIRO' in folder.upper():
                    folder_name = folder
                    break
        elif model_id == 'GAELLE':
            # Look for folder containing 'gaelle' and 'francesa'
            for folder in folder_names:
                if 'GAELLE' in folder.upper() and 'FRANCESA' in folder.upper():
                    folder_name = folder
                    break
        
        # If we found a matching folder
        if folder_name:
            model_folder = os.path.join(mujeres_dir, folder_name)
            
            # Clear existing portfolio images except the thumbnail
            thumbnail_url = model['portfolioImages'][0] if model['portfolioImages'] else ''
            model['portfolioImages'] = [thumbnail_url] if thumbnail_url else []
            
            # Add all images from the folder
            try:
                image_files = [f for f in os.listdir(model_folder) if f.lower().endswith('.webp')]
                for filename in sorted(image_files):
                    # Create the correct path structure
                    relative_path = os.path.join(model_folder, filename).replace('\\', '/')
                    safe_path = create_safe_path(relative_path)
                    model['portfolioImages'].append(safe_path)
                    
                print(f"Updated portfolio for {model_name} with {len(image_files)} images")
            except Exception as e:
                print(f"Error processing folder {model_folder}: {e}")
        else:
            print(f"No folder found for model {model_name} (ID: {model_id})")

# Write the updated data back to the file
with open('json/models_updated_women.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Portfolio image paths updated successfully! Saved to models_updated_women.json")