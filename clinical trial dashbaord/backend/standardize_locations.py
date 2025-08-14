import pandas as pd
import json
import re
from typing import Dict, List

def standardize_country_name(country: str) -> str:
    """
    Standardize country names to handle variations like 'United States' vs 'USA'
    """
    if pd.isna(country) or country == 'Unknown':
        return 'Unknown'
    
    country_lower = str(country).lower().strip()
    
    # Country name mappings
    country_mappings = {
        'united states': 'United States',
        'usa': 'United States',
        'us': 'United States',
        'united states of america': 'United States',
        'united kingdom': 'United Kingdom',
        'uk': 'United Kingdom',
        'great britain': 'United Kingdom',
        'england': 'United Kingdom',
        'korea, republic of': 'South Korea',
        'korea': 'South Korea',
        'republic of korea': 'South Korea',
        'taiwan, province of china': 'Taiwan',
        'taiwan': 'Taiwan',
        'russian federation': 'Russia',
        'russia': 'Russia',
        'czech republic': 'Czech Republic',
        'czechia': 'Czech Republic',
        'netherlands': 'Netherlands',
        'holland': 'Netherlands',
        'switzerland': 'Switzerland',
        'sweden': 'Sweden',
        'norway': 'Norway',
        'denmark': 'Denmark',
        'finland': 'Finland',
        'australia': 'Australia',
        'japan': 'Japan',
        'china': 'China',
        'india': 'India',
        'brazil': 'Brazil',
        'mexico': 'Mexico',
        'argentina': 'Argentina',
        'south africa': 'South Africa',
        'poland': 'Poland',
        'austria': 'Austria',
        'belgium': 'Belgium',
        'portugal': 'Portugal',
        'greece': 'Greece',
        'hungary': 'Hungary',
        'romania': 'Romania',
        'bulgaria': 'Bulgaria',
        'croatia': 'Croatia',
        'slovenia': 'Slovenia',
        'slovakia': 'Slovakia',
        'estonia': 'Estonia',
        'latvia': 'Latvia',
        'lithuania': 'Lithuania',
        'canada': 'Canada',
        'germany': 'Germany',
        'france': 'France',
        'italy': 'Italy',
        'spain': 'Spain'
    }
    
    return country_mappings.get(country_lower, country)

def parse_location_json(location_str: str) -> Dict:
    """
    Parse location JSON and extract standardized country
    """
    if pd.isna(location_str) or location_str == 'Unknown':
        return {'country': 'Unknown'}
    
    try:
        # Handle multiple locations separated by |
        if '|' in location_str:
            locations = location_str.split('|')
            countries = []
            for loc in locations:
                try:
                    loc_data = json.loads(loc.strip())
                    country = loc_data.get('country', 'Unknown')
                    countries.append(standardize_country_name(country))
                except:
                    continue
            # Return the most common country, or first if all unique
            if countries:
                return {'country': max(set(countries), key=countries.count)}
            else:
                return {'country': 'Unknown'}
        else:
            # Single location
            loc_data = json.loads(location_str.strip())
            country = loc_data.get('country', 'Unknown')
            return {'country': standardize_country_name(country)}
    except:
        return {'country': 'Unknown'}

def standardize_locations_in_csv(input_file: str, output_file: str):
    """
    Standardize location names in the CSV file
    """
    print(f"Loading data from {input_file}...")
    df = pd.read_csv(input_file)
    
    print(f"Original data shape: {df.shape}")
    print(f"Processing {len(df)} rows...")
    
    # Parse locations and extract standardized countries
    print("Parsing location JSON and standardizing country names...")
    location_data = df['locations'].apply(parse_location_json)
    
    # Add standardized country column
    df['country'] = location_data.apply(lambda x: x.get('country', 'Unknown'))
    
    # Show before/after comparison
    print("\nCountry name standardization results:")
    print("Unique countries found:", df['country'].nunique())
    print("\nTop 10 countries:")
    print(df['country'].value_counts().head(10))
    
    # Save standardized data
    print(f"\nSaving standardized data to {output_file}...")
    df.to_csv(output_file, index=False)
    print("✅ Location standardization complete!")
    
    return df

if __name__ == "__main__":
    input_file = "../data/interventional_trials_with_scores.csv"
    output_file = "../data/interventional_trials_with_scores_standardized.csv"
    
    # Standardize locations
    df = standardize_locations_in_csv(input_file, output_file)
    
    # Show sample of standardized data
    print("\nSample of standardized data:")
    print(df[['nctId', 'locations', 'country']].head())
