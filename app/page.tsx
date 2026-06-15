'use client';

import * as React from 'react';
import { 
  Sun, 
  Wind, 
  Zap, 
  TrendingDown, 
  ShieldCheck, 
  Users, 
  Wrench, 
  Sliders, 
  CheckCircle, 
  X, 
  Info, 
  FileText, 
  Lock, 
  Unlock, 
  Leaf, 
  QrCode, 
  Printer, 
  Phone, 
  Mail, 
  MapPin, 
  RefreshCw,
  Sparkles,
  ChevronRight,
  BatteryCharging
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { PricingConfig } from './api/pricing/route';
import { GrainyGradient } from '../components/GrainyGradient';

// Cindral Green Energy Premium Logo Component
function CindralLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-15 w-15 flex items-center justify-center">
        <Image
          src="/White.png"
          alt="Cindral Energy"
          fill
          referrerPolicy="no-referrer"
          className="object-contain"
        />
      </div>
      <div className="flex flex-col select-none">
        <span className={`font-sans font-black tracking-widest text-lg sm:text-xl leading-none ${light ? 'text-white' : 'text-brand-charcoal'}`}>
          CINDRAL
        </span>
        <span className="font-sans font-bold tracking-wider text-white text-[9px] sm:text-[10px] leading-tight">
          GREEN ENERGY
        </span>
      </div>
    </div>
  );
}

// Fixed Pre-Configured Packages from Flyer
interface SolarPackage {
  id: string;
  kw: number;
  name: string;
  subtitle: string;
  description: string;
  supports: string[];
  approxCostRange: string;
}

const SOLAR_PACKAGES: SolarPackage[] = [
  {
    id: 'pack-1kw',
    kw: 1,
    name: '1KW Basic Package',
    subtitle: 'BASIC PACKAGE',
    description: 'Perfect for small cabins, outhouses, and security quarters with low power loads.',
    supports: ['Lights', 'Fans', 'WiFi Router', 'CCTV Cameras', 'Small Appliances'],
    approxCostRange: '₹45K - ₹85K*',
  },
  {
    id: 'pack-3kw',
    kw: 3,
    name: '3KW Farmhouse Package',
    subtitle: 'FARMHOUSE PACKAGE',
    description: 'Ideal setup for typical weekend homes, farmhouses, and standard cottages.',
    supports: ['1 Air Conditioner', 'Lights & Fans', 'Refrigerator', 'Smart TV & WiFi', 'Small Water Pump'],
    approxCostRange: '₹1.5L - ₹2.1L*',
  },
  {
    id: 'pack-5kw',
    kw: 5,
    name: '5KW Premium Farmhouse',
    subtitle: 'MOST POPULAR PACKAGE',
    description: 'The sweet spot for active premium residences, farm villas, and luxury cottages.',
    supports: ['1-2 Air Conditioners', 'All Household Appliances', 'Water Pump', 'Kitchen Appliances', 'Outdoor Garden Lighting'],
    approxCostRange: '₹3.2L - ₹4.0L*',
  },
  {
    id: 'pack-8kw',
    kw: 8,
    name: '8KW Villa & Resort Package',
    subtitle: 'VILLA / RESORT PACKAGE',
    description: 'Configured for high-load luxury villas, small farm rentals, and light commercial resorts.',
    supports: ['Multiple AC Units', 'Heavy Duty Appliances', 'Water Pump (1-2 HP)', 'Light Pool Filtration Pump', 'High Continuous Loads'],
    approxCostRange: '₹6.0L - ₹7.2L*',
  },
  {
    id: 'pack-10kw',
    kw: 10,
    name: '10KW Commercial Package',
    subtitle: 'COMMERCIAL PACKAGE',
    description: 'Heavy duty energy harvesting for full boutique resorts, large villas, and agribusinesses.',
    supports: ['Multiple ACs & Geysers', 'Heavy Agriculture Machinery', 'Large Capacity Water Pumps', 'Commercial Kitchen & Refrigeration', 'Multi-zone High Consumption'],
    approxCostRange: '₹8.5L - ₹10.5L*',
  }
];

export default function Home() {
  // Config & spreadsheet sync state
  const [pricing, setPricing] = React.useState<PricingConfig>({
    solarPricePerKw: 90000,
    windPricePerKw: 120000,
    laborBasePrice: 15000,
    laborSolarPerKw: 5000,
    laborWindPerKw: 8000,
    hybridLaborDiscount: 0.15,
    subsidySolar1Kw: 30000,
    subsidySolar2Kw: 60000,
    subsidySolar3KwPlus: 78000,
    inverterBasePrice: 35000,
    batteryPricePerKwh: 45000,
    pricingSource: 'fallback',
  });
  
  const [sheetIdInput, setSheetIdInput] = React.useState('');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = React.useState(false);

  // Core Calculator customization state
  const [systemType, setSystemType] = React.useState<'solar' | 'wind' | 'hybrid'>('hybrid');
  const [solarKw, setSolarKw] = React.useState<number>(5);
  const [windKw, setWindKw] = React.useState<number>(3);
  const [optForSubsidy, setOptForSubsidy] = React.useState<boolean>(true);
  const [batteryKwh, setBatteryKwh] = React.useState<number>(0); // 0, 5, 10, 15 kWh options
  
  // Lead capture state
  const [leadName, setLeadName] = React.useState('');
  const [leadEmail, setLeadEmail] = React.useState('');
  const [leadPhone, setLeadPhone] = React.useState('');
  const [leadLocation, setLeadLocation] = React.useState('Karjat, Maharashtra');
  const [isSubmittingLead, setIsSubmittingLead] = React.useState(false);
  
  // UI helpers
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedQuote, setCopiedQuote] = React.useState(false);
  
  // Initialize quote ID during mount purely and lazily, eliminating the need for an effect state change
  const [quoteRefId] = React.useState(() => Math.floor(100000 + Math.random() * 900000));

  const showToast = React.useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const fetchPricing = React.useCallback(async (customSheetId?: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      let query = '';
      if (customSheetId) {
        query = `?sheetId=${encodeURIComponent(customSheetId)}`;
      }
      
      const res = await fetch(`/api/pricing${query}`);
      if (!res.ok) throw new Error('API server returned error');
      
      const data: PricingConfig = await res.json();
      setPricing(data);
      
      if (data.pricingSource === 'google_sheets') {
        showToast('Pricing database synchronized live with Google Sheets!', 'success');
        setSheetIdInput(data.sheetIdUsed || '');
        setShowSyncModal(false);
      } else if (customSheetId && data.pricingSource === 'fallback') {
        throw new Error('Google Sheet parsing failed or sheet is not published as CSV. Reverted to template pricing.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Error executing sync');
      showToast(err.message || 'Sheets synchronization failed.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  // Fetch initial pricing config on load asynchronously via event ticks to comply with strict state rules
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchPricing();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPricing]);

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetIdInput.trim()) {
      showToast('Please enter a valid Spreadsheet ID', 'error');
      return;
    }
    // Extract Spreadsheet ID from URL if they pasted a full URL
    let extractedId = sheetIdInput.trim();
    if (extractedId.includes('docs.google.com/spreadsheets')) {
      const match = extractedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        extractedId = match[1];
      }
    }
    fetchPricing(extractedId);
  };

  // Pre-configured flyer package helper selection
  const selectFlyerPackage = (pkg: SolarPackage) => {
    setSystemType('solar');
    setSolarKw(pkg.kw);
    setWindKw(0);
    setOptForSubsidy(true);
    showToast(`Loaded "${pkg.name}" specifications into custom calculator!`, 'success');
    
    // Smooth scroll to calculator id element
    const calcElement = document.getElementById('price-calculator');
    if (calcElement) {
      calcElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle lead submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail || !leadPhone) {
      showToast('Please complete all contact details.', 'error');
      return;
    }
    
    setIsSubmittingLead(true);
    try {
      const payload = {
        name: leadName,
        phone: leadPhone,
        email: leadEmail,
        location: leadLocation,
        systemType,
        solarKw: systemType === 'wind' ? 0 : solarKw,
        windKw: systemType === 'solar' ? 0 : windKw,
        batteryKwh,
        netCost: finalNetInvestment,
        quoteRef: `IND-${quoteRefId}`
      };

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to submit');
      
      // Clear form except location
      setLeadName('');
      setLeadEmail('');
      setLeadPhone('');
      showToast('Site visit requested! Our engineers will contact you shortly.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit request. Please email admin@cindral.org directly.', 'error');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Calculate pricing values based on current state & loaded configuration
  const calcSolarKw = systemType === 'wind' ? 0 : solarKw;
  const calcWindKw = systemType === 'solar' ? 0 : windKw;

  // Equipment Costs
  // Solar has slight scaling factor: less price for huge industrial kW arrays
  const solarScaleFactor = calcSolarKw >= 10 ? 0.92 : calcSolarKw >= 5 ? 0.96 : 1.0;
  const rawSolarEquipCost = calcSolarKw * pricing.solarPricePerKw * solarScaleFactor;
  const rawWindEquipCost = calcWindKw * pricing.windPricePerKw;
  const inverterBaseCost = (calcSolarKw > 0 || calcWindKw > 0) ? pricing.inverterBasePrice : 0;
  const batteryUpgradeCost = (systemType === 'solar' ? batteryKwh : 0) * pricing.batteryPricePerKwh;
  const totalEquipmentCost = rawSolarEquipCost + rawWindEquipCost + inverterBaseCost + batteryUpgradeCost;

  // Labor Costs
  const isHybrid = systemType === 'hybrid';
  const baseLabor = (calcSolarKw > 0 || calcWindKw > 0) ? pricing.laborBasePrice : 0;
  const solarLaborAdder = calcSolarKw * pricing.laborSolarPerKw;
  const windLaborAdder = calcWindKw * pricing.laborWindPerKw;
  const grossLaborCost = baseLabor + solarLaborAdder + windLaborAdder;
  
  // Apply 15% discount on combined labor for hybrid systems
  const laborDiscount = isHybrid ? (grossLaborCost * pricing.hybridLaborDiscount) : 0;
  const finalLaborCost = grossLaborCost - laborDiscount;

  // Project Subtotal before subsidy
  const rawTotalProjectCost = totalEquipmentCost + finalLaborCost;

  // Government Subsidy (Solar only PM Surya Ghar Yojana)
  let calculatedSubsidy = 0;
  if (optForSubsidy && (systemType === 'solar' || systemType === 'hybrid') && calcSolarKw > 0) {
    if (calcSolarKw === 1) {
      calculatedSubsidy = pricing.subsidySolar1Kw;
    } else if (calcSolarKw === 2) {
      calculatedSubsidy = pricing.subsidySolar2Kw;
    } else {
      // 3kW or higher receives maximum cap ₹78,000
      calculatedSubsidy = pricing.subsidySolar3KwPlus;
    }
  }

  const finalNetInvestment = Math.max(0, rawTotalProjectCost - calculatedSubsidy);

  // Savings / Payback / CO2 formulas
  const estimatedSolarMonthlySavings = calcSolarKw * 1150; // solar generates ~₹1,150 savings / kW / month
  const estimatedWindMonthlySavings = calcWindKw * 850;   // wind generates ~₹850 savings / kW / month
  const combinedMonthlySavings = estimatedSolarMonthlySavings + estimatedWindMonthlySavings;
  const yearlySavings = combinedMonthlySavings * 12;
  const paybackPeriodYears = yearlySavings > 0 ? (finalNetInvestment / yearlySavings) : 0;
  
  // CO2 metric tons offset per year (Solar: ~1.2 tons/kW/year, Wind: ~1.5 tons/kW/year)
  const yearlyCo2OffsetTons = (calcSolarKw * 1.25) + (calcWindKw * 1.55);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="cindral-app" className="min-h-screen relative flex flex-col font-sans select-text">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#2bb62f_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />
      
      {/* Ambient background glows */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-brand-green-light/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-10 w-[400px] h-[400px] bg-brand-green-mid/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 left-[20%] w-80 h-80 bg-brand-green-dark/15 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow">
        {/* Dynamic Micro Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${
                toast.type === 'success' 
                  ? 'bg-brand-slate text-brand-green-light border-brand-green-light/20' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {toast.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <Info className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section id="about-us" className="relative pb-16 pt-0 md:pb-24 lg:pb-32 overflow-hidden bg-brand-slate">
          {/* Background Gradient */}
          <div className="absolute inset-0 z-[1]">
            <GrainyGradient />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-slate/40"></div>
          </div>
          
          {/* Floating Action Header */}
          <header className="relative z-50 bg-transparent w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
              <CindralLogo light={true} />
              
              <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-white/95">
                <a href="#our-packages" className="hover:text-brand-green-light transition-colors drop-shadow-sm">Standard Packages</a>
                <a href="#price-calculator" className="hover:text-brand-green-light transition-colors drop-shadow-sm">Custom Sizing Quote</a>
                <a href="#subsidy-info" className="hover:text-brand-green-light transition-colors drop-shadow-sm">MNRE Subsidy Guide</a>
              </nav>

              <div className="flex items-center gap-3">
                <a
                  href="#price-calculator"
                  className="hidden lg:inline-flex items-center gap-1.5 px-6 py-3 text-xs font-black uppercase tracking-widest text-[#008744] bg-[#e6f4ea] hover:bg-white rounded-full shadow-lg shadow-black/20 transition-all cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Get Estimate</span>
                </a>
              </div>
            </div>
          </header>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 lg:pt-28">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8 flex flex-col gap-6 text-left">
                <span className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-green-light bg-brand-green-light/20 border border-brand-green-light/30 rounded-md backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-brand-green-light" />
                  Premium Clean Tech Specialists
                </span>
                
                <h1 className="font-sans font-black tracking-tight text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] text-balance">
                  Power Independence. <br />
                  <span className="text-brand-green-light drop-shadow-md">Sustainable Future.</span>
                </h1>

                <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed drop-shadow-sm">
                  Cindral Energy delivers reliable, highly efficient, and future-ready hybrid 
                  wind-and-solar solutions tailored for farmhouses, residential villas, countryside cottages, 
                  resorts, and off-grid estates.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="#price-calculator"
                    className="px-8 py-4 text-sm font-bold text-brand-charcoal bg-white hover:bg-brand-offwhite rounded-full shadow-lg shadow-white/10 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Instant Sizing Calculator</span>
                    <Sliders className="h-4 w-4 text-brand-green-dark" />
                  </a>
                  
                  <a
                    href="#our-packages"
                    className="px-8 py-4 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-md rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Explore Packages</span>
                  </a>
                </div>
              </div>

              {/* High Visual Cards grid replacing flyers look info */}
              <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: 'Lower Bills', desc: 'Slashes grid tariffs by up to 90%' },
                  { icon: BatteryCharging, label: 'Backup Power', desc: 'Seamless high-capacity storing' },
                  { icon: Leaf, label: 'Clean Energy', desc: '100% emission-free green harvest' },
                  { icon: ShieldCheck, label: 'Long Term', desc: '25-yr performance warranties' },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-brand-charcoal/40 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg flex flex-col text-left gap-2.5 hover:border-white/30 transition-all group"
                  >
                    <div className="h-10 w-10 shrink-0 bg-brand-green-light/20 rounded-xl flex items-center justify-center group-hover:bg-brand-green-light/40 transition-colors">
                      <item.icon className="h-5 w-5 text-brand-green-light" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-snug">{item.label}</h3>
                      <p className="text-[11px] text-white/60 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Packages Section on flyer (1KW, 3KW, 5KW, 8KW, 10KW) */}
        <section id="our-packages" className="py-16 bg-white border-y border-brand-green-mid/15 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-green-dark bg-brand-green-light/10 px-3 py-1 rounded-full mb-3">
                Residential Models
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight">
                Our Standard Solar Packages
              </h2>
              <p className="text-brand-charcoal/60 mt-3 text-sm sm:text-base leading-relaxed">
                Click a residential model below to push its configuration directly into the dynamic pricing 
                calculator and estimate customization upgrades.
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {SOLAR_PACKAGES.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`relative bg-brand-offwhite rounded-2xl border ${
                    pkg.kw === 5 
                      ? 'border-brand-green-mid shadow-lg shadow-brand-green-dark/5 ring-1 ring-brand-green-mid/35' 
                      : 'border-brand-green-mid/10 shadow-sm'
                  } p-6 flex flex-col justify-between hover:border-brand-green-mid/40 transition-all text-left overflow-hidden group`}
                >
                  {pkg.kw === 5 && (
                    <div className="absolute top-0 right-0 bg-brand-green-dark text-[9px] font-black tracking-widest text-[#F8FAF7] px-3.5 py-1 rounded-bl-xl uppercase">
                      Popular
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-brand-green-dark uppercase tracking-wide bg-brand-green-light/10 px-2 py-0.5 rounded">
                        {pkg.subtitle}
                      </span>
                      <h3 className="text-lg font-bold text-brand-charcoal mt-2 group-hover:text-brand-green-dark transition-colors">
                        {pkg.name}
                      </h3>
                    </div>

                    <div className="text-2xl font-black text-brand-green-dark tracking-tight">
                      {pkg.approxCostRange}
                      <span className="text-[10px] block font-medium text-brand-charcoal/50 mt-0.5">
                        Est. Net Expense
                      </span>
                    </div>

                    <p className="text-xs text-brand-charcoal/60 leading-relaxed min-h-[48px]">
                      {pkg.description}
                    </p>

                    <div className="border-t border-brand-green-mid/10 pt-4">
                      <span className="text-[10px] font-bold text-brand-charcoal/70 uppercase tracking-widest block mb-2">
                        Supports Load:
                      </span>
                      <ul className="space-y-1.5">
                        {pkg.supports.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-brand-charcoal/80">
                            <CheckCircle className="h-3.5 w-3.5 text-brand-green-mid shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-brand-green-mid/5">
                    <button
                      onClick={() => selectFlyerPackage(pkg)}
                      className={`w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center ${
                        pkg.kw === 5
                          ? 'bg-brand-green-dark hover:bg-brand-green-mid text-white'
                          : 'bg-white border border-brand-green-mid/20 hover:bg-brand-green-light/10 text-brand-charcoal'
                      }`}
                    >
                      Configure This
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Flyer Quality Badges */}
            <div className="mt-12 bg-brand-slate text-brand-offwhite p-6 sm:p-8 rounded-3xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6 border border-brand-green-mid/25 text-left relative overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-green-light/10 rounded-full blur-[80px]" />
              
              <div className="flex gap-4">
                <Sun className="h-6 w-6 text-brand-green-light shrink-0 mt-1" />
                <div>
                  <h4 className="font-extrabold text-white text-base">Government Subsidy Guaranteed*</h4>
                  <p className="text-xs text-brand-offwhite/70 mt-1 leading-relaxed">
                    National Portal registration and subsidy application paperwork handled 100% by Cindral, 
                    applying actual MNRE scheme discounts directly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Wrench className="h-6 w-6 text-brand-green-light shrink-0 mt-1" />
                <div>
                  <h4 className="font-extrabold text-white text-base">Expert Engineering & Labor</h4>
                  <p className="text-xs text-brand-offwhite/70 mt-1 leading-relaxed">
                    Licensed electrical and structural crews install durable wind micro-turbines, high-tensile hot-dip 
                    galvanized framing, and secure wiring.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <ShieldCheck className="h-6 w-6 text-brand-green-light shrink-0 mt-1" />
                <div>
                  <h4 className="font-extrabold text-white text-base">25-Year Performance Cover</h4>
                  <p className="text-xs text-brand-offwhite/70 mt-1 leading-relaxed">
                    Tier-1 solar panels and top-tier wind components backed by long warranty. Fully integrated dual hybrid status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Calculator Section */}
        <section id="price-calculator" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#008744] bg-[#5CE02A]/10 px-3 py-1 rounded inline-block">
                Price Estimator
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-charcoal tracking-tight mt-2.5">
                System Cost Calculator
              </h2>
              <p className="text-brand-charcoal/60 mt-2 text-sm">
                Fine-tune solar power sizes, wind harvesters, and storage backups. We fetch standard rules from our Sheets pricing database dynamically.
              </p>
              
              {pricing.pricingSource === 'google_sheets' ? (
                <div className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-brand-green-dark bg-brand-green-light/15 border border-brand-green-mid/20 px-3.5 py-1.5 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5 text-brand-green-mid" />
                  <span>Synchronized Live with custom Google Sheet database</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-brand-charcoal/50 bg-brand-charcoal/5 px-3.5 py-1.5 rounded-full">
                  <Info className="h-3.5 w-3.5 text-brand-green-mid" />
                  <span>Utilizing standard Cindral flyer pricing database (local fallback)</span>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Panel: Calculator Configurator */}
              <div className="lg:col-span-6 bg-white rounded-3xl border border-brand-green-mid/15 shadow-sm p-6 sm:p-8 text-left space-y-6">
                
                {/* 1. System Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/70 block mb-3">
                    Step 1: Choose Your Sustainable System Type
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: 'solar', label: 'Solar Only', icon: Sun },
                      { id: 'wind', label: 'Wind Only', icon: Wind },
                      { id: 'hybrid', label: 'Hybrid Duo', icon: Zap },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSystemType(t.id as any)}
                        className={`py-3 px-2 sm:px-4 rounded-2xl flex flex-col items-center justify-center gap-2 border font-bold text-xs select-none cursor-pointer transition-all ${
                          systemType === t.id
                            ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-md shadow-brand-charcoal/15'
                            : 'bg-brand-offwhite text-brand-charcoal border-brand-green-mid/10 hover:border-brand-green-mid/30'
                        }`}
                      >
                        <t.icon className={`h-5 w-5 ${
                          systemType === t.id ? 'text-brand-green-light' : 'text-brand-charcoal/60'
                        }`} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Solar Size Slider */}
                {(systemType === 'solar' || systemType === 'hybrid') && (
                  <div className="space-y-3 bg-brand-offwhite p-5 rounded-2xl border border-brand-green-mid/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/80 flex items-center gap-1.5">
                        <Sun className="h-4 w-4 text-brand-green-dark" />
                        Solar Array Size
                      </span>
                      <span className="text-sm font-black text-brand-green-dark bg-brand-green-light/25 px-2.5 py-0.5 rounded-full">
                        {solarKw} kW
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={solarKw}
                      onChange={(e) => setSolarKw(parseInt(e.target.value))}
                      className="w-full tracking-wide accent-brand-green-dark h-2 bg-brand-green-mid/15 rounded-lg cursor-pointer transition-all"
                    />
                    
                    <div className="flex justify-between text-[10px] font-mono text-brand-charcoal/50">
                      <span>1 kW (Cabin)</span>
                      <span>5 kW (Std Villa)</span>
                      <span>10 kW (Resort)</span>
                      <span>20 kW (Estates)</span>
                    </div>
                  </div>
                )}

                {/* 3. Wind Size Slider */}
                {(systemType === 'wind' || systemType === 'hybrid') && (
                  <div className="space-y-3 bg-brand-offwhite p-5 rounded-2xl border border-brand-green-mid/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/80 flex items-center gap-1.5">
                        <Wind className="h-4 w-4 text-brand-green-dark" />
                        Wind Turbine Sizing
                      </span>
                      <span className="text-sm font-black text-brand-green-dark bg-brand-green-light/25 px-2.5 py-0.5 rounded-full">
                        {windKw} kW
                      </span>
                    </div>
                    
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={windKw}
                      onChange={(e) => setWindKw(parseInt(e.target.value))}
                      className="w-full tracking-wide accent-brand-green-dark h-2 bg-brand-green-mid/15 rounded-lg cursor-pointer transition-all"
                    />
                    
                    <div className="flex justify-between text-[10px] font-mono text-brand-charcoal/50">
                      <span>1 kW (Light turbine)</span>
                      <span>3 kW (Residential Mast)</span>
                      <span>5 kW (Dual Turbine)</span>
                      <span>10 kW (Heavy Wind)</span>
                    </div>
                  </div>
                )}

                {/* 4. Subsidy Opt-In Toggle */}
                <div>
                  <div className="flex items-start justify-between bg-brand-offwhite p-5 rounded-2xl border border-brand-green-mid/5">
                    <div className="space-y-1 pr-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/80 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-brand-green-mid" />
                        MNRE Solar Government Subsidy
                      </span>
                      <p className="text-[11px] text-brand-charcoal/60 leading-relaxed">
                        Assess Solar System for Central Government Surajyas (PM-Surya Ghar). Wind generates no subsidy discounts.
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      disabled={systemType === 'wind'}
                      onClick={() => setOptForSubsidy(!optForSubsidy)}
                      className={`relative inline-flex lg:h-6 lg:w-11 h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        systemType === 'wind' 
                          ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                          : optForSubsidy ? 'bg-brand-green-dark' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          optForSubsidy && systemType !== 'wind' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {systemType === 'wind' && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 rounded-lg p-2.5 mt-2 font-medium">
                      ⚠️ National subsidies only apply to Residential Solar rooftop arrays. Dynamic hybrid installations obtain grants on their solar components only.
                    </p>
                  )}
                  {optForSubsidy && systemType !== 'wind' && (
                    <div className="p-3 bg-brand-green-light/5 rounded-xl border border-brand-green-mid/10 mt-2.5">
                      <div className="flex gap-2">
                        <Info className="h-3.5 w-3.5 text-brand-green-dark mt-0.5 shrink-0" />
                        <span className="text-[10px] text-brand-charcoal/70 leading-normal">
                          <strong>Surya Ghar Subsidy Calculation:</strong> Under current MNRE guidelines, 
                          1kW receives {formatCurrency(pricing.subsidySolar1Kw)}, 2kW receives {formatCurrency(pricing.subsidySolar2Kw)}, and arrays {'>'}= 3kW receive a flat capped maximum of {formatCurrency(pricing.subsidySolar3KwPlus)}.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Smart Battery Backup Upgrade options */}
                {systemType === 'solar' && (
                  <div className="space-y-3 bg-brand-offwhite p-5 rounded-2xl border border-brand-green-mid/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/80 flex items-center gap-1.5">
                        <BatteryCharging className="h-4 w-4 text-brand-green-dark" />
                        Add Battery Backup (Optional)
                      </span>
                      <span className="text-[11px] font-mono text-brand-charcoal/50">
                        Smart storage options
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { val: 0, label: 'None' },
                        { val: 2.5, label: '2.5 kWh' },
                        { val: 5, label: '5 kWh' },
                        { val: 10, label: '10 kWh' },
                        { val: 15, label: '15 kWh' }
                      ].map((b) => (
                        <button
                          key={b.val}
                          onClick={() => setBatteryKwh(b.val)}
                          className={`py-2 px-1 text-center rounded-xl font-bold text-[10px] sm:text-xs select-none cursor-pointer border ${
                            batteryKwh === b.val
                              ? 'bg-brand-charcoal text-white border-brand-charcoal'
                              : 'bg-white text-brand-charcoal/85 border-brand-green-mid/10 hover:border-brand-green-mid/30'
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-brand-charcoal/50 leading-normal">
                      Advanced custom deep-cycle LFP cells. Each module adds standard protection and modular scaling.
                    </p>
                  </div>
                )}

              </div>

              {/* Right Panel: Dynamic Quote Summary & Gated Form */}
              <div className="lg:col-span-6 bg-brand-slate text-brand-offwhite rounded-3xl border border-brand-green-mid/20 shadow-lg p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green-light/10 rounded-full blur-[60px] pointer-events-none" />
                
                {/* Panel Header */}
                <div className="flex items-center justify-between border-b border-brand-green-mid/15 pb-4">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-brand-green-light uppercase tracking-widest bg-brand-green-light/10 px-2 py-0.5 rounded">
                      Real-Time Estimates
                    </span>
                    <h3 className="text-base font-black text-white mt-1">
                      System Proposal Details
                    </h3>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-brand-offwhite/50 font-mono">System Configured</span>
                    <p className="text-xs font-bold text-brand-green-light capitalize">
                      {isHybrid ? 'Hybrid Combo' : systemType} Unit
                    </p>
                  </div>
                </div>

                {/* Main Headline Cost */}
                <div className="text-left space-y-1">
                  <span className="text-xs text-brand-offwhite/60">Estimated Net Investment (Excluding Taxes)</span>
                  <div className="flex items-baseline gap-2 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                    {formatCurrency(finalNetInvestment)}
                    {calculatedSubsidy > 0 && (
                      <span className="text-xs font-medium text-[#5CE02A] line-through decoration-[#EA4335] decoration-2">
                        {formatCurrency(rawTotalProjectCost)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-green-light animate-ping" />
                    <span className="text-[10px] font-mono text-brand-offwhite/50">
                      Calculated on: {calcSolarKw}kW Solar + {calcWindKw}kW Wind Sizing
                    </span>
                  </div>
                </div>

                {/* Subsidies, Labor, and Savings Indicators */}
                <div className="grid grid-cols-3 gap-3 border-y border-brand-green-mid/10 py-5 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-offwhite/50 uppercase block tracking-wider">Labor Cost</span>
                    <span className="text-sm font-bold text-white block">
                      {calcSolarKw === 0 && calcWindKw === 0 ? '₹0' : formatCurrency(finalLaborCost)}
                    </span>
                    {laborDiscount > 0 && (
                      <span className="text-[9px] text-brand-green-light font-medium block">
                        Included -15% Hybrid duo discount
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 border-x border-brand-green-mid/10 px-4">
                    <span className="text-[10px] text-brand-offwhite/50 uppercase block tracking-wider">Govt Grant</span>
                    <span className="text-sm font-bold text-brand-green-light block">
                      {calculatedSubsidy > 0 ? `-${formatCurrency(calculatedSubsidy)}` : '₹0'}
                    </span>
                    <span className="text-[9px] text-brand-offwhite/40 block leading-tight">
                      {calculatedSubsidy > 0 ? 'Applied Solar subsidy' : 'Not opted or ineligible'}
                    </span>
                  </div>

                  <div className="space-y-1 pl-1">
                    <span className="text-[10px] text-brand-offwhite/50 uppercase block tracking-wider">Est. Monthly Saving</span>
                    <span className="text-sm font-bold text-white block">
                      {formatCurrency(combinedMonthlySavings)}
                    </span>
                    <span className="text-[9px] text-brand-offwhite/40 block leading-tight">
                      Yielding {paybackPeriodYears > 0 ? `${paybackPeriodYears.toFixed(1)} yr payback` : '0 yr'}
                    </span>
                  </div>
                </div>

                {/* Environmental Impact Widget */}
                <div className="bg-[#121814] border border-brand-green-mid/20 rounded-xl p-4 flex items-center justify-between mt-2 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-green-light/10 rounded-lg">
                      <Leaf className="h-5 w-5 text-brand-green-light glow-filter" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">Annual Carbon Offset</span>
                      <span className="text-[10px] text-brand-offwhite/50 leading-none">Cindral sustainable impact</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-brand-green-light font-mono bg-brand-green-dark/20 px-3 py-1 rounded-lg border border-brand-green-light/10">
                    {yearlyCo2OffsetTons.toFixed(2)} Tons CO2 / Yr
                  </span>
                </div>

                {/* Unlocked Client Actions: print or schedule */}
                <div className="flex flex-col gap-3 mt-4">
                  <a
                    href="#request-site-visit"
                    className="w-full py-4 px-4 bg-brand-green-dark hover:bg-brand-green-mid text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all text-center"
                  >
                    <FileText className="h-4 w-4 text-brand-green-light" />
                    <span>Request Paid Survey & Formal Quotation</span>
                  </a>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Lead Capture Form Section */}
        <section id="request-site-visit" className="bg-[#F8FAF7] py-16 border-t border-brand-green-mid/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-3xl border border-brand-green-mid/20 relative shadow-2xl overflow-hidden text-center">
              <div className="absolute inset-0 bg-[radial-gradient(#2bb62f_0.5px,transparent_0.5px)] [background-size:12px_12px] opacity-[0.03] pointer-events-none" />
              
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-brand-green-light/10 border border-[#5CE02A]/20 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-brand-green-dark" />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-black text-brand-charcoal uppercase tracking-tight">
                  Request a Paid Site Survey & Quotation
                </h3>
                <p className="text-sm text-brand-charcoal/70 max-w-lg mx-auto">
                  Our Maharashtra-based engineers will conduct an onsite topographic 
                  and shadow-path analysis to audit roof suitability. Submit your details below to schedule a paid site survey and receive a firm, formal quotation.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit} className="w-full space-y-4 text-left relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-brand-charcoal/70 uppercase block tracking-widest mb-1.5">
                      First & Last Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Aditya Rao"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-brand-offwhite text-sm text-brand-charcoal placeholder-brand-charcoal/30 border border-brand-green-mid/20 rounded-xl px-4 py-3 focus:border-brand-green-dark outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-brand-charcoal/70 uppercase block tracking-widest mb-1.5">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full bg-brand-offwhite text-sm text-brand-charcoal placeholder-brand-charcoal/30 border border-brand-green-mid/20 rounded-xl px-4 py-3 focus:border-brand-green-dark outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-brand-charcoal/70 uppercase block tracking-widest mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full bg-brand-offwhite text-sm text-brand-charcoal placeholder-brand-charcoal/30 border border-brand-green-mid/20 rounded-xl px-4 py-3 focus:border-brand-green-dark outline-none transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-brand-charcoal/70 uppercase block tracking-widest mb-1.5">
                      Installation Location
                    </label>
                    <select
                      value={leadLocation}
                      onChange={(e) => setLeadLocation(e.target.value)}
                      className="w-full bg-brand-offwhite text-sm text-brand-charcoal border border-brand-green-mid/20 rounded-xl px-4 py-3 focus:border-brand-green-dark outline-none transition-all cursor-pointer"
                    >
                      <option value="Karjat, Maharashtra">Karjat, Maharashtra</option>
                      <option value="Murbad, Maharashtra">Murbad, Maharashtra</option>
                      <option value="Khopoli, Maharashtra">Neral, Maharashtra</option>
                      <option value="Khopoli, Maharashtra">Khopoli, Maharashtra</option>
                      <option value="Alibag, Maharashtra">Alibag, Maharashtra</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full py-4 px-4 bg-brand-green-dark hover:bg-brand-green-mid text-white font-extrabold uppercase tracking-widest text-sm rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2 transition-all text-center disabled:opacity-75 disabled:cursor-wait"
                >
                  <MapPin className={`h-4 w-4 text-brand-green-light ${isSubmittingLead ? 'animate-bounce' : ''}`} />
                  <span>{isSubmittingLead ? 'Requesting...' : 'Request Formal Site Visit & Quotation'}</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Subsidy Info & Rules Section (Flyer Data) */}
        <section id="subsidy-info" className="py-16 bg-[#F8FAF7] text-brand-charcoal border-t border-brand-green-mid/20 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(43,182,47,0.05)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-green-dark bg-brand-green-light/20 px-3 py-1 rounded inline-block mb-3">
                  Government Grants MNRE Scheme
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#008744] tracking-tight">
                  PM-Surya Ghar Muft Bijli Yojana
                </h3>
                <p className="text-brand-charcoal/80 mt-4 text-sm sm:text-base leading-relaxed">
                  The Indian Ministry of New and Renewable Energy (MNRE) provides generous subsidies up to 
                  <strong> ₹78,000 flat cap</strong> for residential solar setups. This program specifically 
                  targets empowering farmhouse clusters, private villas, and standalone properties.
                </p>

                <div className="space-y-4 mt-6">
                  {[
                    { title: '1 kW Installation Limit', value: '₹30,000 grant deducted upfront' },
                    { title: '2 kW Sizing Limit', value: '₹60,000 cumulative national subsidy' },
                    { title: '3 kW to 20 kW Array Capacity', value: '₹78,000 maximum capped grant' },
                  ].map((sub, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-brand-green-mid/20 pb-3">
                      <span className="text-sm font-semibold text-brand-charcoal">{sub.title}</span>
                      <span className="text-xs font-bold text-brand-green-dark font-mono bg-brand-green-light/20 px-2.5 py-1 rounded">
                        {sub.value}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-brand-charcoal/60 mt-4 leading-relaxed">
                  *Subsidies are managed through the National Portal of Rooftop Solar and directly applied onto original project invoices. 
                  Cindral handles full feasibility clearances, DISCOM grid metering, and registration.
                </p>
              </div>

              {/* Sizing Example Panel from Flyer */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-green-mid/20 relative shadow-xl">
                <div className="absolute top-4 right-4 bg-[#008744] text-[8px] font-mono tracking-widest text-[#e6f4ea] px-2 py-0.5 rounded">
                  FLYER SAMPLE SIZING
                </div>
                
                <h4 className="text-lg font-black text-[#008744] uppercase tracking-wider mb-2">
                  5KW System Cost Analysis Example
                </h4>
                <p className="text-xs text-brand-charcoal/70 mb-6 leading-relaxed">
                  Below is the transparent breakdown of our premium 5KW residential solar layout as specified on our official brochure guidelines:
                </p>

                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center bg-brand-offwhite p-3 rounded-xl border border-brand-green-mid/10">
                    <span className="text-brand-charcoal/70 text-left">Total 5kW Project Value</span>
                    <span className="text-sm font-bold text-brand-charcoal">₹4,50,000</span>
                  </div>

                  <div className="flex justify-between items-center bg-[#e6f4ea] p-3 rounded-xl border border-[#008744]/20">
                    <span className="text-[#008744] font-bold text-left">Government MNRE Grant</span>
                    <span className="text-sm font-bold text-[#008744]">-₹78,000</span>
                  </div>

                  <div className="flex justify-between items-center bg-brand-charcoal p-3 rounded-xl border border-brand-green-mid/20">
                    <span className="text-white font-black text-left">Net Capital Investment</span>
                    <span className="text-base font-black text-brand-green-light">₹3,72,000</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-brand-offwhite p-3 rounded-xl text-left border border-brand-green-mid/10">
                      <span className="text-[10px] text-brand-charcoal/60 block leading-tight">Monthly Savings</span>
                      <span className="text-xs font-bold text-brand-charcoal block mt-0.5">₹5,000 - ₹8,000</span>
                    </div>
                    <div className="bg-brand-offwhite p-3 rounded-xl text-left border border-brand-green-mid/10">
                      <span className="text-[10px] text-brand-charcoal/60 block leading-tight">Payback Target</span>
                      <span className="text-xs font-bold text-brand-charcoal block mt-0.5">5 to 7 Years</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Synchronizer Overlay Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSyncModal(false)}
              className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl border border-brand-green-mid/25 shadow-2xl p-6 sm:p-8 max-w-xl w-full z-10 relative overflow-hidden"
            >
              <button
                onClick={() => setShowSyncModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-brand-offwhite rounded-full text-brand-charcoal/50 hover:text-brand-charcoal transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-left space-y-4">
                <div className="flex items-center gap-2 border-b border-brand-green-mid/10 pb-3">
                  <div className="h-9 w-9 bg-brand-green-light/10 rounded-xl flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-brand-green-dark" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-brand-charcoal text-base">
                      Google Sheets Dynamic Pricing Sync
                    </h3>
                    <p className="text-xs text-brand-charcoal/50 leading-none mt-0.5">
                      Connect your live spreadsheet pricing matrix
                    </p>
                  </div>
                </div>

                <p className="text-xs text-brand-charcoal/70 leading-relaxed">
                  Provide custom parameter lists straight from a published Google Sheet to synchronize calculations. 
                  This enables solar sales managers to dynamically modify the company&apos;s baseline values instantly.
                </p>

                <div className="bg-brand-offwhite p-4 rounded-2xl border border-brand-green-mid/10 text-[11px] leading-relaxed text-brand-charcoal/75 space-y-1.5">
                  <span className="font-bold text-xs text-brand-green-dark block mb-1">Spreadsheet Layout Template Rules:</span>
                  <div>• Column A: <strong>Parameter Keys</strong> (e.g., <code>solar_price_per_kw</code>, <code>wind_price_per_kw</code>, <code>labor_base_price</code>, <code>inverter_base_price</code>)</div>
                  <div>• Column B: <strong>Numerical Values</strong> (e.g., <code>90000</code>, <code>120000</code>, <code>15000</code>, <code>35000</code>)</div>
                  <div>• Open Google Sheet click <strong>File &gt; Share &gt; Publish to Web</strong>, select <strong>CSV format</strong> and click publish. Paste that Sheet ID below.</div>
                </div>

                <form onSubmit={handleSyncSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-brand-charcoal/70 uppercase block tracking-widest mb-2">
                      Google Sheet ID or Spreadsheet Link
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1uK7X_g19b_pIsN994A_vWpxN2Z_C2..."
                      value={sheetIdInput}
                      onChange={(e) => setSheetIdInput(e.target.value)}
                      className="w-full bg-brand-offwhite text-xs text-brand-charcoal placeholder-brand-charcoal/30 border border-brand-green-mid/20 rounded-xl px-4 py-3 focus:border-brand-green-mid outline-none transition-all"
                    />
                  </div>

                  {syncError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-medium">
                      ⚠️ {syncError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPricing({
                          solarPricePerKw: 90000,
                          windPricePerKw: 120000,
                          laborBasePrice: 15000,
                          laborSolarPerKw: 5000,
                          laborWindPerKw: 8000,
                          hybridLaborDiscount: 0.15,
                          subsidySolar1Kw: 30000,
                          subsidySolar2Kw: 60000,
                          subsidySolar3KwPlus: 78000,
                          inverterBasePrice: 35000,
                          batteryPricePerKwh: 45000,
                          pricingSource: 'fallback'
                        });
                        setSheetIdInput('');
                        setSyncError(null);
                        showToast('Reverted parameters back to Cindral flyer defaults.', 'success');
                        setShowSyncModal(false);
                      }}
                      className="flex-1 py-3 bg-brand-offwhite hover:bg-[#F0F3EF] text-brand-charcoal font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                    >
                      Clear / Reset Defaults
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="flex-1 py-3 bg-brand-green-dark hover:bg-brand-green-mid text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Fetch & Sync Rates'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footnote details & Brand Contacts */}
      <footer className="bg-transparent text-brand-charcoal py-12 border-t border-brand-green-mid/10 mt-auto text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#5ce02a_0.4px,transparent_0.4px)] [background-size:16px_16px] opacity-[0.05] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="relative h-15 w-15 flex items-center justify-center">
                      <Image
                        src="/Green.png"
                        alt="Cindral Energy"
                        fill
                        referrerPolicy="no-referrer"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col select-none gap-0.5">
                      <span className="font-sans font-bold tracking-widest text-lg sm:text-xl leading-none text-brand-charcoal">
                        CINDRAL
                      </span>
                      <span className="font-sans font-semibold tracking-wider text-brand-charcoal text-[9px] sm:text-[10px] leading-tight">
                        GREEN ENERGY
                      </span>
                    </div>
              </div>
              <p className="text-xs text-brand-charcoal/70 max-w-sm leading-relaxed">
                Empowering farm owners, businesses, and houses with durable off-grid clean energy, 
                maximizing security, reliability, and economic wind-solar hybrid yields.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-[#008744]">
                Contact Office
              </h4>
              <ul className="space-y-2 text-xs text-brand-charcoal/80">
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#008744] shrink-0" />
                  <a href="tel:+917304070829" className="hover:text-brand-green-dark transition-colors">+91 73040 70829</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#008744] shrink-0" />
                  <a href="mailto:admin@cindral.org" className="hover:text-brand-green-dark transition-colors">admin@cindral.org</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#008744] shrink-0 mt-0.5" />
                  <span>Karjat, Maharashtra, India</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-brand-green-mid/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-brand-charcoal/60">
            <p>© {new Date().getFullYear()} Cindral Energy. All Rights Reserved.</p>
            <div className="flex gap-4">
              <span>*Prices are subject to final site-specific mechanical wind surveys and shadow mapping.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
