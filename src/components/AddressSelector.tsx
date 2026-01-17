"use client";

import { useEffect, useMemo, useState, useRef } from 'react';
import gisData from '@/constants/gis-v2.json';
import { District, GisData, Province, Ward } from '@/types';

interface AddressSelectorProps {
  selectedProvince: string;
  selectedDistrict: string;
  selectedWard: string;
  detailedAddress: string;
  onProvinceChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onWardChange: (value: string) => void;
  onDetailedAddressChange: (value: string) => void;
  errors?: {
    province?: string;
    district?: string;
    ward?: string;
    detailedAddress?: string;
  };
}

export default function AddressSelector({
  selectedProvince,
  selectedDistrict,
  selectedWard,
  detailedAddress,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onDetailedAddressChange,
  errors = {},
}: AddressSelectorProps) {
  const typedGisData = gisData as GisData;
  const [provinceInput, setProvinceInput] = useState('');
  const [districtInput, setDistrictInput] = useState('');
  const [wardInput, setWardInput] = useState('');
  
  // UI States
  const [activeField, setActiveField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- FILTER LOGIC ---
  const provincesList = useMemo(() => {
    const entries = Object.entries(typedGisData).map(([id, province]) => ({
      id, name: province.name_with_type || province.name,
    }));
    return provinceInput.trim() && provinceInput !== (typedGisData[selectedProvince]?.name_with_type || '')
      ? entries.filter(p => p.name.toLowerCase().includes(provinceInput.trim().toLowerCase()))
      : entries;
  }, [typedGisData, provinceInput, selectedProvince]);

  const districts = useMemo(() => selectedProvince && typedGisData[selectedProvince] ? typedGisData[selectedProvince]["quan-huyen"] : {}, [selectedProvince, typedGisData]);
  
  const sortedFilteredDistricts = useMemo(() => {
    const entries = Object.entries(districts).map(([id, district]) => ({ id, name: (district as District).name_with_type }));
    const currentName = selectedDistrict && districts[selectedDistrict] ? (districts[selectedDistrict] as District).name_with_type : '';
    return districtInput.trim() && districtInput !== currentName
      ? entries.filter(d => d.name.toLowerCase().includes(districtInput.trim().toLowerCase()))
      : entries;
  }, [districts, districtInput, selectedProvince, selectedDistrict]);

  const wards = useMemo(() => {
    if (!selectedProvince || !selectedDistrict) return {} as { [key: string]: Ward };
    return typedGisData[selectedProvince]?.["quan-huyen"]?.[selectedDistrict]?.["xa-phuong"] || {};
  }, [selectedProvince, selectedDistrict, typedGisData]);

  const sortedFilteredWards = useMemo(() => {
    const entries = Object.entries(wards).map(([id, ward]) => ({ id, name: (ward as Ward).name_with_type }));
    const currentName = selectedWard && wards[selectedWard] ? (wards[selectedWard] as Ward).name_with_type : '';
    return wardInput.trim() && wardInput !== currentName
      ? entries.filter(w => w.name.toLowerCase().includes(wardInput.trim().toLowerCase()))
      : entries;
  }, [wards, wardInput, selectedProvince, selectedDistrict, selectedWard]);


  // --- SYNC INPUTS ---
  useEffect(() => {
    if (selectedProvince && typedGisData[selectedProvince]) {
      setProvinceInput(typedGisData[selectedProvince].name_with_type);
    } else setProvinceInput('');
  }, [selectedProvince, typedGisData]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict && typedGisData[selectedProvince]?.["quan-huyen"]?.[selectedDistrict]) {
      setDistrictInput(typedGisData[selectedProvince]["quan-huyen"][selectedDistrict].name_with_type);
    } else setDistrictInput('');
  }, [selectedProvince, selectedDistrict, typedGisData]);

  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard && typedGisData[selectedProvince]?.["quan-huyen"]?.[selectedDistrict]?.["xa-phuong"]?.[selectedWard]) {
      setWardInput(typedGisData[selectedProvince]["quan-huyen"][selectedDistrict]["xa-phuong"][selectedWard].name_with_type);
    } else setWardInput('');
  }, [selectedProvince, selectedDistrict, selectedWard, typedGisData]);

  useEffect(() => { 
    const provinceData = typedGisData[selectedProvince];
    const districtExists = provinceData?.["quan-huyen"]?.[selectedDistrict];
    
    if (selectedProvince && selectedDistrict && !districtExists) {
        onDistrictChange('');
        onWardChange('');
    }
    
    if(!selectedProvince) { 
        onDistrictChange(''); 
        onWardChange(''); 
    } 
  }, [selectedProvince]);

  useEffect(() => { if(!selectedDistrict) { onWardChange(''); } }, [selectedDistrict]);


  // --- STYLES ---
  const inputWrapperClass = (hasError: boolean, isDisabled = false, isFocused = false) => `
    relative flex items-center w-full rounded-2xl border transition-all duration-300 z-10
    ${hasError 
      ? 'border-red-300 bg-red-50/50' 
      : isFocused 
        ? 'border-rose-400 bg-white ring-4 ring-rose-100' 
        : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300'
    }
    ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
  `;

  const dropdownBaseClass = "absolute top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 p-1 animate-in fade-in slide-in-from-top-2 duration-200";
  const itemClass = "block w-full px-4 py-3 text-left text-sm text-gray-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors font-medium";

  // CẬP NHẬT: Bỏ direction rtl, giữ truncate để xử lý trường hợp tên CỰC KỲ dài
  const inputFieldClass = "flex-1 w-full min-w-0 bg-transparent border-none px-3 py-3.5 text-gray-900 placeholder-gray-400 focus:ring-0 outline-none text-sm font-medium truncate text-left disabled:cursor-not-allowed";

  return (
    <div className="grid grid-cols-1 gap-4" ref={containerRef}>
      
      {/* Province */}
      <div className={`relative group ${activeField === 'province' ? 'z-50' : 'z-30'}`}>
        <div className={inputWrapperClass(!!errors.province, false, activeField === 'province')}>
          <div className="pl-4 text-gray-400 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
            </svg>
          </div>
          <input
            type="text"
            value={provinceInput}
            onChange={(e) => {
              setProvinceInput(e.target.value);
              setActiveField('province');
              if(!e.target.value) onProvinceChange('');
            }}
            onFocus={() => setActiveField('province')}
            placeholder="Tỉnh / Thành phố"
            className={inputFieldClass}
          />
          {activeField === 'province' && provincesList.length > 0 && (
            <div className={`${dropdownBaseClass} left-0 w-full`}>
              {provincesList.map((p) => (
                <button key={p.id} type="button" className={itemClass} onClick={() => { onProvinceChange(p.id); setActiveField(null); }}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.province && <p className="text-red-500 text-[11px] ml-4 mt-1 font-medium">{errors.province}</p>}
      </div>

      {/* CẬP NHẬT QUAN TRỌNG: grid-cols-1 trên mobile để hiện full tên */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* District */}
        <div className={`relative ${activeField === 'district' ? 'z-50' : 'z-20'}`}>
          <div className={inputWrapperClass(!!errors.district, !selectedProvince, activeField === 'district')}>
            <div className="pl-4 text-gray-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              type="text"
              value={districtInput}
              onChange={(e) => { setDistrictInput(e.target.value); setActiveField('district'); if(!e.target.value) onDistrictChange(''); }}
              onFocus={() => setActiveField('district')}
              disabled={!selectedProvince}
              placeholder="Quận / Huyện"
              className={inputFieldClass}
            />
             {activeField === 'district' && selectedProvince && sortedFilteredDistricts.length > 0 && (
              <div className={`${dropdownBaseClass} left-0 w-full`}>
                {sortedFilteredDistricts.map((d) => (
                  <button key={d.id} type="button" className={itemClass} onClick={() => { onDistrictChange(d.id); setActiveField(null); }}>
                    {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.district && <p className="text-red-500 text-[11px] ml-2 mt-1 font-medium">{errors.district}</p>}
        </div>

        {/* Ward */}
        <div className={`relative ${activeField === 'ward' ? 'z-50' : 'z-20'}`}>
          <div className={inputWrapperClass(!!errors.ward, !selectedDistrict, activeField === 'ward')}>
            <div className="pl-4 text-gray-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <input
              type="text"
              value={wardInput}
              onChange={(e) => { setWardInput(e.target.value); setActiveField('ward'); if(!e.target.value) onWardChange(''); }}
              onFocus={() => setActiveField('ward')}
              disabled={!selectedDistrict}
              placeholder="Phường / Xã"
              className={inputFieldClass}
            />
            {activeField === 'ward' && selectedDistrict && sortedFilteredWards.length > 0 && (
              <div className={`${dropdownBaseClass} left-0 w-full`}>
                {sortedFilteredWards.map((w) => (
                  <button key={w.id} type="button" className={itemClass} onClick={() => { onWardChange(w.id); setActiveField(null); }}>
                    {w.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.ward && <p className="text-red-500 text-[11px] ml-2 mt-1 font-medium">{errors.ward}</p>}
        </div>
      </div>

      {/* Detailed Address */}
      <div className={inputWrapperClass(!!errors.detailedAddress, false, activeField === 'detail')}>
        <div className="pl-4 text-gray-400 self-start mt-3.5 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <textarea
          value={detailedAddress}
          onChange={(e) => onDetailedAddressChange(e.target.value)}
          onFocus={() => setActiveField('detail')}
          onBlur={() => setActiveField(null)}
          placeholder="Số nhà, tên đường..."
          rows={2}
          className="w-full bg-transparent border-none px-3 py-3 text-gray-900 placeholder-gray-400 focus:ring-0 outline-none text-sm font-medium resize-none"
        />
      </div>
      {errors.detailedAddress && <p className="text-red-500 text-[11px] ml-4 -mt-2 font-medium">{errors.detailedAddress}</p>}
    </div>
  );
}