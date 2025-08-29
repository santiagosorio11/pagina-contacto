import json

# Load the existing models.json file
with open('json/models.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update the three models with placeholder fields
for model in data['models']:
    if model['id'] in ['floriane', 'gaelle', 'giulia']:
        # Add empty arrays for polaroids and videos if they don't exist
        if 'polaroids' not in model:
            model['polaroids'] = []
        if 'videos' not in model:
            model['videos'] = []

# Write the updated data back to the file
with open('json/models.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Successfully updated models.json with placeholder fields for polaroids and videos!")