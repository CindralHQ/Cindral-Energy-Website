"use client";

import React, { useState, useMemo } from 'react';
import { 
  CATALOG_APPLIANCES, 
  CATALOG_SOLAR_PANELS, 
  CATALOG_WIND_TURBINES, 
  CATALOG_INVERTERS, 
  CATALOG_BATTERIES,
  Appliance 
} from '@/lib/catalog';
import { 
  Plus, Trash2, Zap, AlertTriangle, CheckCircle, 
  BatteryCharging, Wind, Sun, Edit2, Info, ChevronDown, 
  Download, X
} from 'lucide-react';

type LoadItem = {
  id: string;
  appliance: Appliance;
  quantity: number;
  runHours: number;
};

export function LoadAnalyzer() {
  const [loadItems, setLoadItems] = useState<LoadItem[]>([]);
  
  // Appliance input state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [runHours, setRunHours] = useState<number>(4);
  
  const [wantsSubsidy, setWantsSubsidy] = useState<boolean>(true);
  const [systemTypePreference, setSystemTypePreference] = useState<'solar' | 'wind' | 'hybrid'>('solar');

  // Manual Overrides
  const [overridePanelId, setOverridePanelId] = useState<string>('');
  const [overrideInverterId, setOverrideInverterId] = useState<string>('');
  const [overrideBatteryId, setOverrideBatteryId] = useState<string>('');
  const [overrideBatteryQty, setOverrideBatteryQty] = useState<number | null>(null);
  const [overrideTurbineId, setOverrideTurbineId] = useState<string>('');

  // Quotation Form
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState({ name: '', phone: '', address: '' });
  
  const saveOrAddAppliance = () => {
    if (!selectedApplianceId) return;
    const appliance = CATALOG_APPLIANCES.find(a => a.id === selectedApplianceId);
    if (!appliance) return;
    
    if (editingItemId) {
      setLoadItems(prev => prev.map(item => item.id === editingItemId ? {
        ...item, appliance, quantity, runHours
      } : item));
      setEditingItemId(null);
    } else {
      setLoadItems(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          appliance,
          quantity,
          runHours
        }
      ]);
    }
    
    // Reset inputs
    setSelectedApplianceId('');
    setQuantity(1);
    setRunHours(4);
  };

  const startEditAppliance = (item: LoadItem) => {
    setEditingItemId(item.id);
    setSelectedApplianceId(item.appliance.id);
    setQuantity(item.quantity);
    setRunHours(item.runHours);
  };
  
  const removeLoadItem = (id: string) => {
    setLoadItems(prev => prev.filter(item => item.id !== id));
  };
  
  // 2. Sizing Estimator Logic
  const totalDailyWh = loadItems.reduce((acc, item) => acc + (item.quantity * item.appliance.wattage * item.runHours), 0);
  const totalConnectedLoadW = loadItems.reduce((acc, item) => acc + (item.quantity * item.appliance.wattage), 0);
  const totalConnectedLoadKw = totalConnectedLoadW / 1000;
  
  const targetSolarKw = totalDailyWh / 4000;
  const targetWindKw = totalDailyWh / 6000;

  // Recommendations Generation
  const recommendation = useMemo(() => {
    if (totalDailyWh === 0) return null;

    const effectiveTargetKw = systemTypePreference === 'solar' ? targetSolarKw : (systemTypePreference === 'wind' ? targetWindKw : Math.max(targetSolarKw * 0.6, targetWindKw * 0.4));
    let systemClass = effectiveTargetKw <= 2.5 ? 24 : 48; // 24V or 48V

    // Step 1: Select Panel
    let actualPanel = CATALOG_SOLAR_PANELS[0];
    if (overridePanelId) {
      actualPanel = CATALOG_SOLAR_PANELS.find(p => p.id === overridePanelId) || actualPanel;
    } else {
      let selectedPanel = CATALOG_SOLAR_PANELS.find(p => p.voltage === systemClass);
      if (wantsSubsidy) {
        selectedPanel = CATALOG_SOLAR_PANELS.find(p => p.isDcr && p.voltage === 24);
      }
      actualPanel = (wantsSubsidy ? CATALOG_SOLAR_PANELS.find(p => p.name === "590W Mono perc BIF HC 24V DCR") : selectedPanel) || CATALOG_SOLAR_PANELS[0];
    }
    
    // Step 2: Select Inverter
    let selectedInverter = CATALOG_INVERTERS[0];
    if (overrideInverterId) {
      selectedInverter = CATALOG_INVERTERS.find(i => i.id === overrideInverterId) || selectedInverter;
      systemClass = selectedInverter.voltage; // Force architecture to match inverter
    } else {
      selectedInverter = CATALOG_INVERTERS.filter(i => i.voltage === systemClass)
                                          .sort((a,b) => Math.abs(a.capacityKw - effectiveTargetKw) - Math.abs(b.capacityKw - effectiveTargetKw))[0];
    }
    
    // Step 3: Select Battery
    let selectedBattery = CATALOG_BATTERIES[0];
    if (overrideBatteryId) {
      selectedBattery = CATALOG_BATTERIES.find(b => b.id === overrideBatteryId) || selectedBattery;
    } else {
      if (systemClass === 24) {
        selectedBattery = CATALOG_BATTERIES.find(b => b.voltage === 25.6 || b.voltage === 12.8 || b.voltage === 12) || CATALOG_BATTERIES[0];
      } else {
        selectedBattery = CATALOG_BATTERIES.find(b => b.voltage === 51.2) || CATALOG_BATTERIES[0];
      }
    }

    // Step 4: Turbines
    let selectedTurbine = null;
    if (overrideTurbineId) {
        selectedTurbine = CATALOG_WIND_TURBINES.find(t => t.id === overrideTurbineId) || null;
    } else {
        selectedTurbine = CATALOG_WIND_TURBINES.filter(t => t.voltage === systemClass)
                                                 .sort((a,b) => Math.abs(a.capacityKw - effectiveTargetKw) - Math.abs(b.capacityKw - effectiveTargetKw))[0] || null;
    }

    // Calculate quantities
    let panelQty = 0;
    if (systemTypePreference !== 'wind') {
      const panelCapacityKw = actualPanel.capacityW / 1000;
      const hybridSolarShare = systemTypePreference === 'hybrid' ? 0.6 : 1;
      panelQty = Math.ceil((targetSolarKw * hybridSolarShare) / panelCapacityKw);
      
      if (systemClass === 48 && actualPanel.voltage === 24) {
        if (panelQty % 2 !== 0) panelQty += 1;
      }
    }

    let turbineQty = 0;
    if (systemTypePreference !== 'solar' && selectedTurbine) {
       const hybridWindShare = systemTypePreference === 'hybrid' ? 0.6 : 1;
       turbineQty = Math.ceil((targetWindKw * hybridWindShare) / selectedTurbine.capacityKw);
    }
    
    // Costs
    const panelBaseCost = panelQty * actualPanel.price;
    const turbineBaseCost = turbineQty > 0 && selectedTurbine ? turbineQty * selectedTurbine.price : 0;
    const inverterCost = selectedInverter.price;
    
    const backupWhRequired = totalConnectedLoadW * 4; 
    let batteryQtyCalc = Math.ceil(backupWhRequired / (selectedBattery.capacityKwh * 1000));
    if (systemClass === 48 && selectedBattery.voltage === 12) batteryQtyCalc = Math.max(batteryQtyCalc, 4);
    if (systemClass === 48 && selectedBattery.voltage === 25.6) batteryQtyCalc = Math.max(batteryQtyCalc, 2);
    if (systemClass === 24 && selectedBattery.voltage === 12) batteryQtyCalc = Math.max(batteryQtyCalc, 2);
    
    const batteryQty = overrideBatteryQty !== null ? overrideBatteryQty : Math.max(batteryQtyCalc, 1);
    const batteryBaseCost = batteryQty * selectedBattery.price;

    const totalSolarCapacityW = panelQty * actualPanel.capacityW;
    const structureCost = totalSolarCapacityW * 15;
    const installationCost = totalSolarCapacityW * 15 + (turbineQty * 15000);
    
    const baseEquipmentTotal = panelBaseCost + turbineBaseCost + inverterCost + batteryBaseCost;
    const gstRateEquipment = 0.05; 
    const gstEquipmentCost = (baseEquipmentTotal) * gstRateEquipment;
    const totalTaxCost = gstEquipmentCost;

    const grandTotal = baseEquipmentTotal + structureCost + installationCost + totalTaxCost;

    let compStatus = "Compatible";
    if (actualPanel.voltage === 24 && systemClass === 48 && panelQty % 2 !== 0) {
       compStatus = "Error: Voltage Mismatch. Requires even number of 24V panels for 48V arch.";
    }

    return {
      systemClass,
      actualPanel,
      panelQty,
      selectedTurbine,
      turbineQty,
      selectedInverter,
      selectedBattery,
      batteryQty,
      costs: {
        panelBaseCost,
        turbineBaseCost,
        inverterCost,
        batteryBaseCost,
        structureCost,
        installationCost,
        baseEquipmentTotal,
        gstCost: totalTaxCost,
        grandTotal
      },
      compStatus
    };
  }, [totalDailyWh, totalConnectedLoadW, targetSolarKw, targetWindKw, wantsSubsidy, systemTypePreference, overridePanelId, overrideInverterId, overrideBatteryId, overrideTurbineId, overrideBatteryQty]);

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Quotation requested for ${quoteDetails.name}. Our system will generate the PDF and contact you shortly!`);
    setShowQuoteForm(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-green-mid/15 shadow-sm p-6 sm:p-8 text-left space-y-6 max-w-4xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-brand-green-light/10 w-96 h-96 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
      
      <div className="relative z-10">
        <h3 className="text-xl sm:text-2xl font-black text-brand-charcoal tracking-tight flex items-center gap-2 mb-2">
          <Zap className="h-6 w-6 text-[#008744]" />
         Load Analyzer & Quotation
        </h3>
        <p className="text-xs sm:text-sm text-brand-charcoal/60 mb-6 max-w-2xl">
          Add your daily appliances to calculate total energy needs. We automatically fetch standard components and generate a 100% compatible system architecture based on core rules.
        </p>

        <div className="bg-[#F8FAF7] border border-brand-green-mid/10 p-5 rounded-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-5">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60 block mb-1.5 ml-1">Appliance Type</label>
              <select 
                className="w-full bg-white border border-brand-green-mid/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-green-dark"
                value={selectedApplianceId}
                onChange={(e) => setSelectedApplianceId(e.target.value)}
              >
                <option value="">Select an appliance...</option>
                {CATALOG_APPLIANCES.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.wattage}W)</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60 block mb-1.5 ml-1">Quantity</label>
              <input 
                type="number" min="1" 
                className="w-full bg-white border border-brand-green-mid/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-green-dark"
                value={quantity} onChange={e => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-brand-charcoal/60 block mb-1.5 ml-1">Daily Hrs</label>
              <input 
                type="number" min="1" max="24"
                className="w-full bg-white border border-brand-green-mid/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-green-dark"
                value={runHours} onChange={e => setRunHours(Number(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <button 
                onClick={saveOrAddAppliance}
                disabled={!selectedApplianceId}
                className="w-full bg-brand-charcoal hover:bg-black text-white rounded-xl px-3 py-2.5 text-sm font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
              >
                {editingItemId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />} 
                {editingItemId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {loadItems.length > 0 && (
          <div className="space-y-4 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#008744]">Load Inventory ({loadItems.length} Items)</h4>
            <div className="bg-white border border-brand-green-mid/10 rounded-2xl overflow-hidden divide-y divide-brand-green-mid/10">
              {loadItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 sm:px-5 sm:py-3.5 hover:bg-brand-green-light/5 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-brand-charcoal">{item.appliance.name}</span>
                    <span className="text-[10px] text-brand-charcoal/50">{item.appliance.wattage}W × {item.quantity} units, {item.runHours} hrs/day</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="hidden sm:inline font-mono text-sm font-bold text-brand-charcoal/80">{(item.appliance.wattage * item.quantity * item.runHours).toLocaleString()} Wh</span>
                    <button onClick={() => startEditAppliance(item)} className="text-blue-400 hover:text-blue-600 p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeLoadItem(item.id)} className="text-red-400 hover:text-red-500 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-brand-charcoal/5 p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t-2 border-brand-charcoal/10">
                <span className="font-black text-brand-charcoal">Total Estimated Requirements</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm bg-white px-2 py-1 rounded shadow-sm border border-brand-charcoal/10"><strong className="text-[#008744]">{totalConnectedLoadKw.toFixed(2)} kW</strong> Load</span>
                  <span className="font-mono text-xs sm:text-sm bg-white px-2 py-1 rounded shadow-sm border border-brand-charcoal/10"><strong className="text-[#008744]">{totalDailyWh.toLocaleString()} Wh</strong> Daily Yield</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {recommendation && (
          <div className="mt-8 border-t border-brand-green-mid/15 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h4 className="text-lg font-black uppercase tracking-tight text-brand-charcoal flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#008744]" />
                Recommended Architecture
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex bg-white border border-brand-green-mid/20 rounded-xl p-1 shadow-inner">
                  <button onClick={() => setSystemTypePreference('solar')} className={`py-1.5 px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${systemTypePreference === 'solar' ? 'bg-[#008744] text-white shadow-md' : 'text-brand-charcoal/60 hover:bg-brand-green-light/10'}`}>Solar Setup</button>
                  <button onClick={() => setSystemTypePreference('wind')} className={`py-1.5 px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${systemTypePreference === 'wind' ? 'bg-[#008744] text-white shadow-md' : 'text-brand-charcoal/60 hover:bg-brand-green-light/10'}`}>Wind Setup</button>
                  <button onClick={() => setSystemTypePreference('hybrid')} className={`py-1.5 px-3 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${systemTypePreference === 'hybrid' ? 'bg-[#008744] text-white shadow-md' : 'text-brand-charcoal/60 hover:bg-brand-green-light/10'}`}>Hybrid Setup</button>
                </div>
                
              </div>
            </div>

            <div className="bg-[#121814] text-white p-5 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(43,182,47,0.05)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-wrap gap-2 justify-between mb-6">
                <div className="flex gap-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 px-2 py-1 rounded border border-white/10">
                    Class: <span className="text-brand-green-light font-bold">{recommendation.systemClass}V</span>
                  </span>
                  <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded border ${recommendation.compStatus.includes('Error') ? 'bg-red-900/40 border-red-500/50 text-red-200' : 'bg-brand-green-dark/40 border-[#008744]/50'}`}>
                    {recommendation.compStatus.includes('Error') ? 'Volt Mismatch' : 'Compatible'}
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input type="checkbox" checked={wantsSubsidy} onChange={e => {setWantsSubsidy(e.target.checked); if(e.target.checked) setOverridePanelId('');}} className="accent-[#008744]" />
                  <span>MNRE Lock</span>
                </label>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                {/* Panel Selection */}
                {recommendation.panelQty > 0 && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-brand-green-light" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-white/80">Solar Panels</h5>
                      </div>
                      <span className="font-mono text-sm font-bold">₹{recommendation.costs.panelBaseCost.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CATALOG_SOLAR_PANELS.map(p => {
                        const isSelected = (overridePanelId || recommendation.actualPanel.id) === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setOverridePanelId(p.id);
                              if (wantsSubsidy) setWantsSubsidy(false);
                            }}
                            className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-[#008744]/20 border-[#008744] text-[#5CE02A] shadow-[0_0_15px_rgba(0,135,68,0.2)]'
                                : 'bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:border-white/30'
                            }`}
                          >
                            <span className={`font-bold text-[11px] sm:text-xs leading-tight ${isSelected ? 'text-white' : ''}`}>{p.name}</span>
                            <span className="text-[10px] opacity-80 mt-1.5 font-mono">₹{p.price.toLocaleString()}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-3 bg-[#008744]/20 border border-[#008744]/30 rounded-xl p-3">
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold tracking-wider text-[#5CE02A]/80">System Capacity</span>
                         <span className="text-sm font-black text-white mt-0.5">{recommendation.panelQty} Modules = {(recommendation.panelQty * recommendation.actualPanel.capacityW / 1000).toFixed(2)} kW Total</span>
                      </div>
                      {recommendation.actualPanel.details && (
                        <div className="group relative cursor-pointer ml-4">
                          <Info className="h-5 w-5 text-[#5CE02A]/60 hover:text-[#5CE02A] transition-colors" />
                          <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block w-56 bg-white text-black text-xs p-3 rounded-lg shadow-xl z-50">
                            <div className="font-bold mb-1 border-b pb-1">Specifications</div>
                            {recommendation.actualPanel.details}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Turbines Selection */}
                {recommendation.turbineQty > 0 && recommendation.selectedTurbine && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-blue-300" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-white/80">Wind Turbines</h5>
                      </div>
                      <span className="font-mono text-sm font-bold">₹{recommendation.costs.turbineBaseCost.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CATALOG_WIND_TURBINES.map(t => {
                        const isSelected = (overrideTurbineId || recommendation.selectedTurbine?.id) === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setOverrideTurbineId(t.id)}
                            className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                : 'bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:border-white/30'
                            }`}
                          >
                            <span className={`font-bold text-[11px] sm:text-xs leading-tight ${isSelected ? 'text-white' : ''}`}>{t.name}</span>
                            <div className="flex justify-between items-center mt-1.5 font-mono">
                              <span className="text-[10px] opacity-80">{t.voltage}V</span>
                              <span className="text-[10px] opacity-80">₹{t.price.toLocaleString()}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-3 bg-blue-500/20 border border-blue-500/30 rounded-xl p-3">
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300/80">Wind Output Capacity</span>
                         <span className="text-sm font-black text-white mt-0.5">{recommendation.turbineQty} Turbines = {recommendation.selectedTurbine.capacityKw * recommendation.turbineQty} kW Total</span>
                      </div>
                      {recommendation.selectedTurbine.details && (
                        <div className="group relative cursor-pointer ml-4">
                          <Info className="h-5 w-5 text-blue-300/60 hover:text-blue-300 transition-colors" />
                          <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block w-56 bg-white text-black text-xs p-3 rounded-lg shadow-xl z-50">
                            <div className="font-bold mb-1 border-b pb-1">Specifications</div>
                            {recommendation.selectedTurbine.details}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Inverter Selection */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-300" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-white/80">Inverter Core</h5>
                    </div>
                    <span className="font-mono text-sm font-bold">₹{recommendation.costs.inverterCost.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATALOG_INVERTERS.map(inv => {
                      const isSelected = (overrideInverterId || recommendation.selectedInverter.id) === inv.id;
                      return (
                        <button
                          key={inv.id}
                          onClick={() => setOverrideInverterId(inv.id)}
                          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                              : 'bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:border-white/30'
                          }`}
                        >
                          <span className={`font-bold text-[11px] sm:text-xs leading-tight ${isSelected ? 'text-white' : ''}`}>{inv.name}</span>
                          <div className="flex justify-between items-center mt-1.5 font-mono">
                            <span className="text-[10px] opacity-80">{inv.voltage}V</span>
                            <span className="text-[10px] opacity-80">₹{inv.price.toLocaleString()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-3 bg-purple-500/20 border border-purple-500/30 rounded-xl p-3">
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300/80">System Architecture</span>
                       <span className="text-sm font-black text-white mt-0.5">{recommendation.selectedInverter.capacityKw}kW • {recommendation.selectedInverter.voltage}V Config</span>
                    </div>
                    {recommendation.selectedInverter.details && (
                      <div className="group relative cursor-pointer ml-4">
                        <Info className="h-5 w-5 text-purple-300/60 hover:text-purple-300 transition-colors" />
                        <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block w-56 bg-white text-black text-xs p-3 rounded-lg shadow-xl z-50">
                          <div className="font-bold mb-1 border-b pb-1">Specifications</div>
                          {recommendation.selectedInverter.details}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Battery Selection */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <BatteryCharging className="h-4 w-4 text-orange-300" />
                      <h5 className="text-xs font-bold uppercase tracking-wider text-white/80">Storage Backup</h5>
                    </div>
                    <span className="font-mono text-sm font-bold">₹{recommendation.costs.batteryBaseCost.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATALOG_BATTERIES.map(bat => {
                      const isSelected = (overrideBatteryId || recommendation.selectedBattery.id) === bat.id;
                      return (
                        <button
                          key={bat.id}
                          onClick={() => setOverrideBatteryId(bat.id)}
                          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-orange-600/20 border-orange-500 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                              : 'bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:border-white/30'
                          }`}
                        >
                          <span className={`font-bold text-[11px] sm:text-xs leading-tight ${isSelected ? 'text-white' : ''}`}>{bat.name}</span>
                          <div className="flex justify-between items-center mt-1.5 font-mono">
                            <span className="text-[10px] opacity-80">{bat.voltage}V</span>
                            <span className="text-[10px] opacity-80">₹{bat.price.toLocaleString()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-3 bg-black/20 rounded-xl p-2 px-4 border border-white/10">
                    <span className="text-xs font-bold text-white/80">Total Units</span>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setOverrideBatteryQty(Math.max(0, recommendation.batteryQty - 1))}
                        className="bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors font-mono"
                      >-</button>
                      <span className="font-mono text-base font-bold w-4 text-center">{recommendation.batteryQty}</span>
                      <button 
                        onClick={() => setOverrideBatteryQty(recommendation.batteryQty + 1)}
                        className="bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors font-mono"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 bg-orange-500/20 border border-orange-500/30 rounded-xl p-3">
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase font-bold tracking-wider text-orange-300/80">Total Storage Backup</span>
                       <span className="text-sm font-black text-white mt-0.5">{recommendation.batteryQty} Cells = {(recommendation.batteryQty * recommendation.selectedBattery.capacityKwh).toFixed(2)} kWh Reserve</span>
                    </div>
                    {recommendation.selectedBattery.details && (
                      <div className="group relative cursor-pointer ml-4">
                        <Info className="h-5 w-5 text-orange-300/60 hover:text-orange-300 transition-colors" />
                        <div className="absolute right-0 bottom-full mb-3 hidden group-hover:block w-56 bg-white text-black text-xs p-3 rounded-lg shadow-xl z-50">
                          <div className="font-bold mb-1 border-b pb-1">Specifications</div>
                          {recommendation.selectedBattery.details}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* EPC Costs */}
                <div className="flex items-center justify-between pt-2 px-2">
                  <span className="text-[11px] text-white/60">Structure Cost</span>
                  <span className="font-mono text-[11px] text-white/80">₹{recommendation.costs.structureCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] text-white/60">Installation Cost</span>
                  <span className="font-mono text-[11px] text-white/80">₹{recommendation.costs.installationCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="text-[11px] text-white/60">GST Taxes (5% Configured Bundle)</span>
                  <span className="font-mono text-[11px] text-white/80">₹{recommendation.costs.gstCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-[#008744]/30 flex flex-col sm:flex-row justify-between sm:items-end gap-4 relative z-10">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Gross Capital Expenditure</span>
                  <h5 className="text-2xl sm:text-3xl font-black text-white mt-1">₹{recommendation.costs.grandTotal.toLocaleString()}</h5>
                  {wantsSubsidy && recommendation.actualPanel.isDcr && recommendation.panelQty > 0 && (
                     <div className="mt-1 text-left">
                       <span className="text-[9px] uppercase font-bold text-brand-green-light block">Estimated MNRE Grant Eligibility</span>
                       <span className="font-mono text-sm font-black text-brand-green-light">-₹{Math.min(78000, recommendation.panelQty * recommendation.actualPanel.capacityW / 1000 * 30000).toLocaleString()} limit approx</span>
                     </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowQuoteForm(true)}
                  disabled={recommendation.compStatus.includes('Error')}
                  className="bg-white hover:bg-brand-offwhite text-[#008744] font-black uppercase tracking-widest text-[10px] sm:text-xs px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl"
                >
                  <Download className="h-4 w-4" /> Download Quotation
                </button>
              </div>
            </div>
            
          </div>
        )}
      </div>

      {/* Quote Form Modal overlay */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowQuoteForm(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-black text-brand-charcoal mb-1">Generate Quotation</h3>
            <p className="text-xs text-brand-charcoal/60 mb-6">Enter your details to generate an official PDF quotation for this exact configuration.</p>
            
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Full Name</label>
                <input 
                  type="text" required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008744]"
                  value={quoteDetails.name} onChange={e => setQuoteDetails({...quoteDetails, name: e.target.value})}
                  placeholder="Rahul Sharma"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Phone Number</label>
                <input 
                  type="tel" required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008744]"
                  value={quoteDetails.phone} onChange={e => setQuoteDetails({...quoteDetails, phone: e.target.value})}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Installation Address</label>
                <textarea 
                  required rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#008744] resize-none"
                  value={quoteDetails.address} onChange={e => setQuoteDetails({...quoteDetails, address: e.target.value})}
                  placeholder="House No, Street, City, State"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#008744] hover:bg-[#007038] text-white font-bold rounded-xl py-3 mt-2 shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
