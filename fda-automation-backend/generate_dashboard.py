# --- generate_dashboard.py ---
import os
import json
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from collections import Counter
import re
import datetime
import nltk # Optional: for better text analysis
import numpy as np # Import numpy for np.select

# --- Configuration ---
REPORTS_DIR = './submitted_reports' # Assumes script is run from fda-automation-backend
OUTPUT_HTML_FILE = 'report_dashboard.html'
COMMON_WORDS_COUNT = 15 # Number of top words/products to show

# --- Optional: NLTK Setup ---
# Try to load stopwords, download if necessary
try:
    nltk_stopwords = set(nltk.corpus.stopwords.words('english'))
    # Add custom words to ignore if necessary
    nltk_stopwords.update(['product', 'use', 'used', 'using', 'problem', 'issue', 'report', 'fda', 'medwatch', 'patient', 'consumer', 'box', 'bottle', 'package', 'ok', 'yes', 'day', 'date', 'time', 'also', 'got', 'took', 'take', 'felt', 'feel', 'started', 'like', 'since', 'get'])
except LookupError:
    print("NLTK stopwords not found. Attempting download...")
    try:
        nltk.download('stopwords', quiet=True)
        nltk.download('punkt', quiet=True)
        nltk_stopwords = set(nltk.corpus.stopwords.words('english'))
        nltk_stopwords.update(['product', 'use', 'used', 'using', 'problem', 'issue', 'report', 'fda', 'medwatch', 'patient', 'consumer', 'box', 'bottle', 'package', 'ok', 'yes', 'day', 'date', 'time', 'also', 'got', 'took', 'take', 'felt', 'feel', 'started', 'like', 'since', 'get'])
        print("NLTK stopwords downloaded.")
    except Exception as e:
        print(f"Warning: Failed to download NLTK data ({e}). Keyword analysis might be less accurate.")
        nltk_stopwords = set() # Use empty set if download fails


# --- Data Loading ---
def load_reports(directory):
    """Loads all JSON report files from the specified directory."""
    all_data = []
    if not os.path.exists(directory):
        print(f"Error: Directory not found - {directory}")
        return None
    print(f"Loading reports from: {directory}")
    count = 0
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            filepath = os.path.join(directory, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Basic check for expected keys before appending
                    if 'problemDescription' in data and 'submittedAt' in data:
                         all_data.append(data)
                         count += 1
                    else:
                         print(f"Warning: Skipping file {filename} due to missing essential keys.")
            except json.JSONDecodeError:
                print(f"Warning: Could not decode JSON from file: {filename}")
            except Exception as e:
                print(f"Warning: Error reading file {filename}: {e}")
    print(f"Successfully loaded {count} valid reports.")
    return all_data


# --- Data Processing ---
def process_data(reports):
    """Converts loaded report data into a pandas DataFrame and cleans/formats it."""
    if not reports: return pd.DataFrame()

    df = pd.DataFrame(reports)
    print(f"Initial DataFrame shape: {df.shape}")
    print(f"Columns available: {df.columns.tolist()}") # Log available columns

    # --- Date Conversions ---
    # SubmittedAt (Assume always present and UTC)
    if 'submittedAt' in df.columns:
        df['submittedAt_dt'] = pd.to_datetime(df['submittedAt'], errors='coerce', utc=True) # Aware (UTC)
    else:
        print("Warning: 'submittedAt' column missing.")
        df['submittedAt_dt'] = pd.NaT # Assign NaT if column missing

    # Problem Date
    if 'problemDate' in df.columns:
        # Parse dates, initially naive
        df['problemDate_dt_naive'] = pd.to_datetime(df['problemDate'], format='%m/%d/%Y', errors='coerce')
        # Localize only if the naive column was successfully created and has non-NaT values
        if 'problemDate_dt_naive' in df.columns:
             # Localize to UTC, handling potential errors during localization
             df['problemDate_dt'] = df['problemDate_dt_naive'].dt.tz_localize('UTC', ambiguous='NaT', nonexistent='NaT')
        else:
             df['problemDate_dt'] = pd.NaT # Assign NaT if parsing failed
    else:
        print("Warning: 'problemDate' column missing.")
        df['problemDate_dt'] = pd.NaT # Assign NaT if column missing

    # Product Expiration Date
    if 'productExpirationDate' in df.columns:
        df['productExpirationDate_dt_naive'] = pd.to_datetime(df['productExpirationDate'], format='%m/%d/%Y', errors='coerce')
        if 'productExpirationDate_dt_naive' in df.columns:
            df['productExpirationDate_dt'] = df['productExpirationDate_dt_naive'].dt.tz_localize('UTC', ambiguous='NaT', nonexistent='NaT')
        else:
            df['productExpirationDate_dt'] = pd.NaT
    else:
        print("Warning: 'productExpirationDate' column missing.")
        df['productExpirationDate_dt'] = pd.NaT


    # --- Expiration Status ---
    now = pd.Timestamp.now(tz='UTC') # Aware (UTC)

    # Define conditions for expiration status calculation
    # Check if columns exist before using them
    if 'productExpirationDate_dt' in df.columns and 'problemDate_dt' in df.columns:
        conditions = [
            df['productExpirationDate_dt'].isnull(),
            # Ensure problemDate_dt is not NaT before comparison
            df['problemDate_dt'].notnull() & (df['productExpirationDate_dt'] < df['problemDate_dt']),
            df['productExpirationDate_dt'] < now
        ]
        choices = ['Unknown Expiration', 'Expired Before Problem', 'Expired']
        df['expirationStatus'] = np.select(conditions, choices, default='Valid')
        # Refine logic if problem date is missing but expiration is known
        df.loc[df['problemDate_dt'].isnull() & df['productExpirationDate_dt'].notnull() & (df['productExpirationDate_dt'] < now), 'expirationStatus'] = 'Expired'
    elif 'productExpirationDate_dt' in df.columns:
         # Handle case where only expiration date exists
         conditions = [
            df['productExpirationDate_dt'].isnull(),
            df['productExpirationDate_dt'] < now
         ]
         choices = ['Unknown Expiration', 'Expired']
         df['expirationStatus'] = np.select(conditions, choices, default='Valid')
    else:
        print("Warning: Cannot calculate expiration status due to missing date columns.")
        df['expirationStatus'] = 'Unknown' # Default if dates are missing


    # --- Clean Text Fields ---
    text_cols = ['problemDescription', 'patientKnownMedicalConditionsOrAllergies', 'productName', 'productPurchaseLocation', 'specifications']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].fillna('').astype(str).str.lower().str.strip()
        else:
            print(f"Warning: Column '{col}' not found in data.")
            df[col] = '' # Add empty column if missing

    # Fill missing categorical values
    df['reportIsAbout'] = df['reportIsAbout'].fillna('Unknown')
    df['patientSex'] = df['patientSex'].fillna('Unknown')

    print("Data processed. Final DataFrame shape:", df.shape)
    return df

# --- Text Analysis ---
def get_common_words(text_series, top_n=20):
    """Extracts common words from a pandas Series of text."""
    if text_series.empty or text_series.isnull().all():
        return Counter()

    # Combine all non-null text, convert to lowercase, and split into words
    all_text = ' '.join(text_series.dropna().astype(str).tolist())
    words = re.findall(r'\b\w+\b', all_text.lower()) # Find word sequences

    # Filter out stopwords and short words
    filtered_words = [word for word in words if word not in nltk_stopwords and len(word) > 2]

    return Counter(filtered_words).most_common(top_n)

# --- Visualization Functions ---
def plot_report_types_donut(df):
    if 'reportIsAbout' not in df.columns or df['reportIsAbout'].isnull().all(): return None
    counts = df['reportIsAbout'].value_counts().reset_index()
    counts.columns = ['type', 'count']
    fig = px.pie(counts, names='type', values='count',
                 title='Reports by Product Category', hole=0.4,
                 color_discrete_sequence=px.colors.qualitative.Pastel)
    fig.update_traces(textposition='inside', textinfo='percent+label', pull=[0.05] * len(counts))
    fig.update_layout(legend_title_text='Category')
    return fig

def plot_patient_gender_donut(df):
    if 'patientSex' not in df.columns or df['patientSex'].isnull().all(): return None
    counts = df['patientSex'].value_counts().reset_index()
    counts.columns = ['gender', 'count']
    fig = px.pie(counts, names='gender', values='count',
                 title='Reports by Patient Gender', hole=0.4,
                 color_discrete_sequence=px.colors.qualitative.Safe)
    fig.update_traces(textposition='inside', textinfo='percent+label', pull=[0.05] * len(counts))
    fig.update_layout(legend_title_text='Gender')
    return fig

def plot_common_products_bar(df, top_n=COMMON_WORDS_COUNT):
    if 'productName' not in df.columns or df['productName'].isnull().all(): return None
    valid_products = df[~df['productName'].isin(['unknown', '', 'n/a'])]
    if valid_products.empty: return None
    counts = valid_products['productName'].value_counts().nlargest(top_n).reset_index()
    counts.columns = ['product', 'count']
    fig = px.bar(counts.sort_values('count'), x='count', y='product', orientation='h',
                 title=f'Top {top_n} Reported Products',
                 labels={'product': 'Product Name', 'count': 'Number of Reports'},
                 text='count', color='count', color_continuous_scale=px.colors.sequential.Viridis)
    fig.update_traces(textposition='outside')
    fig.update_layout(yaxis={'categoryorder':'total ascending'}, margin=dict(l=150)) # Add left margin for long labels
    return fig

def plot_expiration_status_bar(df):
    if 'expirationStatus' not in df.columns or df['expirationStatus'].isnull().all(): return None
    counts = df['expirationStatus'].value_counts().reset_index()
    counts.columns = ['status', 'count']
    fig = px.bar(counts, x='status', y='count',
                 title='Product Expiration Status at Time of Problem',
                 labels={'status': 'Expiration Status', 'count': 'Number of Reports'},
                 color='status', color_discrete_sequence=px.colors.qualitative.Set1,
                 text='count')
    fig.update_traces(textposition='outside')
    fig.update_layout(xaxis_title="Status", yaxis_title="Number of Reports")
    return fig

def plot_common_keywords_bar(word_counts, title, color_scale=px.colors.sequential.Blues):
    if not word_counts: return None
    df_words = pd.DataFrame(word_counts, columns=['word', 'count'])
    fig = px.bar(df_words.sort_values('count'), x='count', y='word', orientation='h',
                 title=title, text='count', color='count',
                 color_continuous_scale=color_scale)
    fig.update_traces(textposition='outside')
    fig.update_layout(yaxis={'categoryorder':'total ascending'},
                      xaxis_title="Frequency", yaxis_title="Keyword", margin=dict(l=120)) # Add left margin
    return fig


# --- HTML Generation (Updated CSS) ---
def generate_html_dashboard(figs, common_products_df, common_problem_words, common_condition_words):
    """Generates a single HTML file containing all plots and tables."""
    plot_divs = {name: fig.to_html(full_html=False, include_plotlyjs='cdn')
                 for name, fig in figs.items() if fig}

    # Start HTML with updated styling
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Data Dashboard</title>
        <script src='https://cdn.plot.ly/plotly-latest.min.js'></script>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; background-color: #eef1f5; color: #333; display: flex; flex-direction: column; min-height: 100vh; }
            header { background-color: #024B6D; color: white; padding: 15px 30px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { margin: 0; font-weight: 300; font-size: 2em; }
            main { flex: 1; padding: 25px; }
            section { margin-bottom: 30px; } /* Add space between sections */
            .dashboard-grid {
                display: grid;
                /* Adjust minmax for better flexibility, e.g., 400px */
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 25px;
                margin-top: 20px; /* Keep space below h2 */
            }
            .chart-container {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.08);
                transition: transform 0.2s ease-in-out;
                /* Allow container to determine height based on content */
                min-height: 400px; /* Set a minimum height */
                display: flex; /* Use flexbox to help center content */
                justify-content: center;
                align-items: center;
                overflow: hidden; /* Prevent content overflow */
            }
            .chart-container:hover { transform: translateY(-5px); }
            h2 { color: #024B6D; border-bottom: 2px solid #024B6D; padding-bottom: 8px; margin-top: 0; margin-bottom: 20px; font-weight: 400; font-size: 1.5em; }
            /* Ensure Plotly divs are responsive within their container */
            .plotly-graph-div {
                 width: 100% !important;
                 /* height: 100% !important; */ /* REMOVED fixed height */
                 min-height: 380px; /* Ensure chart has some minimum height */
            }
            footer { background-color: #d6dfe8; color: #555; text-align: center; padding: 10px; font-size: 0.8em; margin-top: auto; }
             @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; } } /* Stack charts on smaller screens */
             @media (max-width: 480px) { .dashboard-grid { grid-template-columns: 1fr; minmax(300px, 1fr); } .chart-container { padding: 10px; } h1 { font-size: 1.5em; } h2 { font-size: 1.2em; } } /* Adjust for very small screens */
        </style>
    </head>
    <body>
        <header><h1>Report Data Insights Dashboard</h1></header>
        <main>
    """

    # Add Plots Sections
    html_content += "<section><h2>Overview</h2><div class='dashboard-grid'>"
    if 'types' in plot_divs: html_content += f"<div class='chart-container'>{plot_divs['types']}</div>"
    if 'gender' in plot_divs: html_content += f"<div class='chart-container'>{plot_divs['gender']}</div>"
    html_content += "</div></section>"

    html_content += "<section><h2>Product Details</h2><div class='dashboard-grid'>"
    if 'products' in plot_divs: html_content += f"<div class='chart-container'>{plot_divs['products']}</div>"
    if 'expiration' in plot_divs: html_content += f"<div class='chart-container'>{plot_divs['expiration']}</div>"
    html_content += "</div></section>"

    html_content += "<section><h2>Common Keywords</h2><div class='dashboard-grid'>"
    if 'problem_keywords' in plot_divs: html_content += f"<div class='chart-container'>{plot_divs['problem_keywords']}</div>"
    if 'condition_keywords' in plot_divs: html_content += f"<div class='chart-container'>{plot_divs['condition_keywords']}</div>"
    html_content += "</div></section>"

    # End HTML
    html_content += f"""
        </main>
        <footer>Generated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</footer>
    </body>
    </html>
    """

    # Write to file
    try:
        with open(OUTPUT_HTML_FILE, 'w', encoding='utf-8') as f: f.write(html_content)
        print(f"\nDashboard successfully generated: {OUTPUT_HTML_FILE}")
    except Exception as e: print(f"\nError writing HTML file: {e}")


# --- Main Execution ---
if __name__ == "__main__":
    report_data = load_reports(REPORTS_DIR)
    if report_data:
        df_reports = process_data(report_data)
        if not df_reports.empty:
            # --- Generate Data ---
            common_products_df = None
            if 'productName' in df_reports.columns:
                 common_products_df = df_reports[~df_reports['productName'].isin(['unknown', '', 'n/a'])]['productName'].value_counts().nlargest(COMMON_WORDS_COUNT).reset_index()
                 common_products_df.columns = ['Product', 'Count']

            common_problem_words = get_common_words(df_reports['problemDescription'], COMMON_WORDS_COUNT) if 'problemDescription' in df_reports.columns else []
            common_condition_words = get_common_words(df_reports['patientKnownMedicalConditionsOrAllergies'], COMMON_WORDS_COUNT) if 'patientKnownMedicalConditionsOrAllergies' in df_reports.columns else []

            # --- Create Figures ---
            figures = {
                'types': plot_report_types_donut(df_reports),
                'gender': plot_patient_gender_donut(df_reports),
                'products': plot_common_products_bar(df_reports, COMMON_WORDS_COUNT),
                'expiration': plot_expiration_status_bar(df_reports),
                'problem_keywords': plot_common_keywords_bar(common_problem_words, f'Top Keywords in Problem Descriptions', px.colors.sequential.Reds),
                'condition_keywords': plot_common_keywords_bar(common_condition_words, f'Top Keywords in Conditions/Allergies', px.colors.sequential.Greens)
            }
            # --- Generate HTML ---
            generate_html_dashboard(figures, common_products_df, common_problem_words, common_condition_words)
        else: print("No valid data available to generate dashboard.")
    else: print("Failed to load report data.")

