import { NextRequest, NextResponse } from 'next/server';

export interface PricingConfig {
  solarPricePerKw: number;
  windPricePerKw: number;
  laborBasePrice: number;
  laborSolarPerKw: number;
  laborWindPerKw: number;
  hybridLaborDiscount: number; // e.g. 0.15 for 15% discount
  subsidySolar1Kw: number;
  subsidySolar2Kw: number;
  subsidySolar3KwPlus: number;
  inverterBasePrice: number;
  batteryPricePerKwh: number;
  pricingSource: 'fallback' | 'google_sheets';
  sheetIdUsed?: string;
}

const DEFAULT_PRICING: PricingConfig = {
  solarPricePerKw: 90000,      // ₹90,000 per kW (panels, mounting and dual hybrid-ready inverter included)
  windPricePerKw: 120000,      // ₹1,20,000 per kW (residential turbine, masts, hybrid charge controllers)
  laborBasePrice: 15000,       // ₹15,000 baseline logistic and electrical setup labor
  laborSolarPerKw: 5000,       // ₹5,000 additional installation cost per kW of Solar Panels
  laborWindPerKw: 8000,        // ₹8,000 additional installation cost per kW of Wind Turbines (height installations)
  hybridLaborDiscount: 0.15,   // 15% discount on labor for hybrid combined system installations
  subsidySolar1Kw: 30000,      // ₹30,000 for 1kW Solar
  subsidySolar2Kw: 60000,      // ₹60,000 for 2kW Solar
  subsidySolar3KwPlus: 78000,  // ₹78,000 cap for 3kW or higher Solar
  inverterBasePrice: 35000,    // Base inverter controller cost
  batteryPricePerKwh: 45000,   // Optional power backup battery pricing
  pricingSource: 'fallback',
};

// Simple CSV text parser that matches key parameters from public Google Sheet export
function parseGoogleSheetCSV(csvText: string, targetSheetId: string): PricingConfig {
  const config = { ...DEFAULT_PRICING, pricingSource: 'google_sheets' as const, sheetIdUsed: targetSheetId };
  
  try {
    // Split lines by newline and clean carriage returns
    const lines = csvText.split(/\r?\n/);
    
    for (const line of lines) {
      // Split by comma, respecting quotes if there are commas in values, but simple split is mostly enough
      const cols = line.split(',');
      if (cols.length >= 2) {
        const rawKey = cols[0].replace(/['"]+/g, '').trim().toLowerCase();
        const rawVal = cols[1].replace(/['"]+/g, '').trim();
        const numericVal = parseFloat(rawVal);
        
        if (!isNaN(numericVal)) {
          if (rawKey === 'solar_price_per_kw' || rawKey === 'solarpriceperkw') {
            config.solarPricePerKw = numericVal;
          } else if (rawKey === 'wind_price_per_kw' || rawKey === 'windpriceperkw') {
            config.windPricePerKw = numericVal;
          } else if (rawKey === 'labor_base_price' || rawKey === 'laborbaseprice') {
            config.laborBasePrice = numericVal;
          } else if (rawKey === 'labor_solar_per_kw' || rawKey === 'laborsolarperkw') {
            config.laborSolarPerKw = numericVal;
          } else if (rawKey === 'labor_wind_per_kw' || rawKey === 'laborwindperkw') {
            config.laborWindPerKw = numericVal;
          } else if (rawKey === 'hybrid_labor_discount' || rawKey === 'hybridlabordiscount') {
            config.hybridLaborDiscount = numericVal;
          } else if (rawKey === 'subsidy_solar_1kw' || rawKey === 'subsidysolar1kw') {
            config.subsidySolar1Kw = numericVal;
          } else if (rawKey === 'subsidy_solar_2kw' || rawKey === 'subsidysolar2kw') {
            config.subsidySolar2Kw = numericVal;
          } else if (rawKey === 'subsidy_solar_3kw_plus' || rawKey === 'subsidysolar3kwplus') {
            config.subsidySolar3KwPlus = numericVal;
          } else if (rawKey === 'inverter_base_price' || rawKey === 'inverterbaseprice') {
            config.inverterBasePrice = numericVal;
          } else if (rawKey === 'battery_price_per_kwh' || rawKey === 'batterypriceperkwh') {
            config.batteryPricePerKwh = numericVal;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing Google Sheets CSV parser fallback:', error);
  }
  
  return config;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Accept Sheets ID from search query parameter OR the env variables
  const sheetId = searchParams.get('sheetId') || process.env.PRICING_SHEET_ID;
  
  if (!sheetId) {
    return NextResponse.json(DEFAULT_PRICING);
  }
  
  try {
    // Construct standard published Google Sheets CSV output URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
    
    // Fetch with timeout logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    const response = await fetch(csvUrl, {
      signal: controller.signal,
      next: { revalidate: 60 } // Cache results for 1 minute to stay snappy
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Sheets response status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const pricing = parseGoogleSheetCSV(csvText, sheetId);
    
    return NextResponse.json(pricing);
  } catch (error: any) {
    console.error('Failed to fetch pricing from Google Sheets', error);
    // Return default pricing with a clear message indicating it has fallback status so frontend can display warning or guide
    return NextResponse.json({
      ...DEFAULT_PRICING,
      pricingSource: 'fallback',
      error: error.message || 'Network error fetching Google Sheet'
    });
  }
}
