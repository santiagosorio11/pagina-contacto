import json
import re
import os

def load_models_data(json_file_path):
    """Load models data from JSON file"""
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data['models']

def generate_model_details_html(model_details, category):
    """Generate HTML for model details based on category"""
    if not model_details:
        return ""
    
    details_html = ""
    if category == "men":
        # Order for men: ESTATURA, CAMISA, PANTALON, ZAPATOS, CABELLO, OJOS
        order = ["ESTATURA", "CAMISA", "PANTALON", "ZAPATOS", "CABELLO", "OJOS"]
    else:  # women
        # Order for women: ESTATURA, BUSTO, CINTURA, CADERA, BLUSA, PANTALON, ZAPATOS, CABELLO, OJOS, BRASSIER, PANTY
        order = ["ESTATURA", "BUSTO", "CINTURA", "CADERA", "BLUSA", "PANTALON", "ZAPATOS", "CABELLO", "OJOS", "BRASSIER", "PANTY"]
    
    for key in order:
        if key in model_details and model_details[key] != "":
            value = model_details[key]
            # Format numeric values without decimals if they're whole numbers
            if isinstance(value, (int, float)) and value == int(value):
                value = int(value)
            details_html += f"                            <p>{key}: {value}</p>\n"
    
    return details_html.rstrip("\n")  # Remove trailing newline

def create_model_card_html(model, category):
    """Create HTML for a single model card"""
    model_id = model['id']
    name = model['name']
    thumbnail_url = model['thumbnailUrl']
    details_html = generate_model_details_html(model['details'], category)
    
    # Convert name to URL-friendly format for portfolio link
    url_friendly_name = name.lower().replace(" ", "-").replace("ñ", "n").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
    
    # Handle special cases for portfolio links
    portfolio_id_map = {
        "DAVID A": "david-a",
        "DAVID C": "david-c",
        "JUAN JOSE": "juan-jose",
        "MATIAS P": "matias-p",
        "SEBAS": "sebas",
        "SERGEI": "sergei",
        "FANNY": "daniela",  # Fanny seems to be Daniela in the HTML
        "MA CARO": "maria-caro",
        "MA JULI": "maria-juli",
        "MARIA NELLY": "maria-nelly",
        "MARIA PAU": "maria-pau",
        "SOPHIA ": "sophia",  # Handle extra space
        "VALE E": "vale-e",
        "VALERIA A": "valeria-a",
        "VALERIA M": "valeria-m"
    }
    
    portfolio_id = portfolio_id_map.get(name, model_id)
    
    # Handle zoom-in class for specific models
    zoom_class = " zoom-in" if name in ["ANASTASIIA", "IVANNA"] else ""
    
    card_html = f'''            <a href="portfolio.html?id={portfolio_id}" class="model-card{zoom_class}">
                <div class="model-image-wrapper">
                    <img src="{thumbnail_url}" alt="{name}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x400?text=Image+Not+Found';">
                    <div class="model-card-overlay">
                        <div class="model-details">
{details_html}
                        </div>
                    </div>
                </div>
                <span class="model-card-name">{name}</span>
            </a>
'''
    return card_html

def update_html_file(html_file_path, models_data, category):
    """Update the HTML file with new model data"""
    # Read the existing HTML file
    with open(html_file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Find the model grid container
    pattern = r'(<div id="model-grid" class="model-grid-container">\s*<!-- Model cards will be generated here -->)(.*?)(\s*</div>\s*</main>)'
    match = re.search(pattern, html_content, re.DOTALL)
    
    if not match:
        print(f"Could not find model grid container in {html_file_path}")
        return False
    
    # Generate new model cards HTML
    model_cards_html = ""
    category_models = [model for model in models_data if model['category'] == category]
    
    for model in category_models:
        model_cards_html += create_model_card_html(model, category)
    
    # Replace the model cards section
    start = match.group(1)
    end = match.group(3)
    new_html_content = re.sub(pattern, f"{start}\n{model_cards_html}\n{end}", html_content, flags=re.DOTALL)
    
    # Write the updated HTML back to file
    with open(html_file_path, 'w', encoding='utf-8') as file:
        file.write(new_html_content)
    
    print(f"Updated {html_file_path} with {len(category_models)} models")
    return True

def main():
    # Define file paths
    json_file_path = os.path.join("json", "models_actualizado.json")
    men_html_path = os.path.join("pages", "men.html")
    women_html_path = os.path.join("pages", "women.html")
    
    # Check if files exist
    if not os.path.exists(json_file_path):
        print(f"JSON file not found: {json_file_path}")
        return
    
    if not os.path.exists(men_html_path):
        print(f"Men HTML file not found: {men_html_path}")
        return
    
    if not os.path.exists(women_html_path):
        print(f"Women HTML file not found: {women_html_path}")
        return
    
    # Load models data
    models_data = load_models_data(json_file_path)
    print(f"Loaded {len(models_data)} models from JSON")
    
    # Update men.html
    update_html_file(men_html_path, models_data, "men")
    
    # Update women.html
    update_html_file(women_html_path, models_data, "women")
    
    print("Model data update completed!")

if __name__ == "__main__":
    main()