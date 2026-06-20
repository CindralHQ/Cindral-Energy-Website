export type Appliance = { id: string; name: string; wattage: number };
export type SolarPanel = { id: string; name: string; capacityW: number; voltage: number; isDcr: boolean; price: number; mrp: number; details?: string };
export type WindTurbine = { id: string; name: string; capacityKw: number; voltage: number; phase: string; price: number; mrp: number; details?: string };
export type Inverter = { id: string; name: string; series: string; capacityKw: number; voltage: number; price: number; mrp: number; details?: string };
export type Battery = { id: string; name: string; type: string; voltage: number; capacityKwh: number; price: number; mrp: number; details?: string };

export const CATALOG_APPLIANCES: Appliance[] = [
  { id: 'app1', name: 'LED Bulb', wattage: 12 },
  { id: 'app2', name: 'Tube Light', wattage: 40 },
  { id: 'app3', name: 'Ceiling Fan', wattage: 75 },
  { id: 'app4', name: 'Refrigerator (250L)', wattage: 150 },
  { id: 'app5', name: 'Television (55")', wattage: 120 },
  { id: 'app6', name: 'Air Conditioner (1.5 Ton)', wattage: 1500 },
  { id: 'app7', name: 'Washing Machine', wattage: 500 },
  { id: 'app8', name: 'Water Pump (1 HP)', wattage: 750 },
  { id: 'app9', name: 'Microwave Oven', wattage: 1200 },
  { id: 'app10', name: 'Desktop Computer', wattage: 250 },
  { id: 'app11', name: 'Laptop Charger', wattage: 65 }
];

export const CATALOG_SOLAR_PANELS: SolarPanel[] = [
  { id: 'sp1', name: '590W Mono perc BIF HC 24V DCR', capacityW: 590, voltage: 24, isDcr: true, price: 16500, mrp: 21000, details: 'Size: 2278x1134x35mm | Weight: 28kg | 25-Year Warranty. Govt Subsidy Approved.' },
  { id: 'sp2', name: '550W Mono perc HC 24V', capacityW: 550, voltage: 24, isDcr: false, price: 14000, mrp: 18000, details: 'Size: 2278x1134x35mm | Weight: 27kg | Excellent low-light performance.' },
  { id: 'sp3', name: '400W Mono perc 24V', capacityW: 400, voltage: 24, isDcr: false, price: 10000, mrp: 13000, details: 'Size: 1722x1134x30mm | Weight: 21.5kg | Multi-busbar technology.' },
  { id: 'sp4', name: '500W Mono perc 48V', capacityW: 500, voltage: 48, isDcr: false, price: 13500, mrp: 17500, details: 'Size: 2094x1038x35mm | Weight: 23.5kg | Heavy duty commercial grade.' }
];

export const CATALOG_WIND_TURBINES: WindTurbine[] = [
  { id: 'wt1', name: 'Light Wind Turbine 1kW', capacityKw: 1, voltage: 24, phase: '1-Phase', price: 45000, mrp: 60000, details: 'Blade Diameter: 1.5m | Weight: 45kg | Starts at 2.5m/s wind speed.' },
  { id: 'wt2', name: 'Residential Wind 3kW', capacityKw: 3, voltage: 48, phase: '1-Phase', price: 120000, mrp: 160000, details: 'Blade Diameter: 3.2m | Weight: 120kg | Nominal speed: 10m/s.' },
  { id: 'wt3', name: 'Dual System Wind 5kW', capacityKw: 5, voltage: 48, phase: '3-Phase', price: 180000, mrp: 240000, details: 'Blade Diameter: 4.5m | Weight: 250kg | Commercial Grade heavy duty shaft.' }
];

export const CATALOG_INVERTERS: Inverter[] = [
  { id: 'inv1', name: 'Cindral 8G 2.5KW', series: '8G', capacityKw: 2.5, voltage: 24, price: 25000, mrp: 35000, details: 'Pure Sine Wave | WiFi Monitoring | Dimensions: 350x295x115mm' },
  { id: 'inv2', name: 'Cindral 9G 4KW', series: '9G', capacityKw: 4, voltage: 24, price: 38000, mrp: 48000, details: 'Hybrid Capabilities | IP65 | Dimensions: 420x350x145mm' },
  { id: 'inv3', name: 'Cindral 8G 5KW', series: '8G', capacityKw: 5, voltage: 48, price: 45000, mrp: 58000, details: '100A MPPT Charger built-in | Weight: 14kg' },
  { id: 'inv4', name: 'Cindral 9G 8KW', series: '9G', capacityKw: 8, voltage: 48, price: 68000, mrp: 85000, details: 'Transformerless | High Efficiency | Weight: 22kg' },
  { id: 'inv5', name: 'Cindral 9G 11KW', series: '9G', capacityKw: 11, voltage: 48, price: 85000, mrp: 105000, details: 'Three Phase | Smart IoT display | Dimensions: 550x450x200mm' }
];

export const CATALOG_BATTERIES: Battery[] = [
  { id: 'bat1', name: 'Lead Acid 12V 150Ah', type: 'Lead Acid', voltage: 12, capacityKwh: 1.8, price: 12000, mrp: 16000, details: 'Tall Tubular | 60 Months Warranty | Weight: 55kg' },
  { id: 'bat2', name: 'Lithium LFP 12.8V 100Ah', type: 'Lithium', voltage: 12.8, capacityKwh: 1.28, price: 22000, mrp: 30000, details: 'Prismatic Cells | 3500 Cycles @ 80% DoD | BMS Integrated' },
  { id: 'bat3', name: 'Lithium LFP 25.6V 100Ah', type: 'Lithium', voltage: 25.6, capacityKwh: 2.56, price: 42000, mrp: 55000, details: 'Rack mountable | Active Cell Balancing | 10 Year Life' },
  { id: 'bat4', name: 'Lithium LFP 51.2V 100Ah', type: 'Lithium', voltage: 51.2, capacityKwh: 5.12, price: 82000, mrp: 110000, details: 'Server Rack Battery | 8000 Cycles | Integrated CAN/RS485' }
];
