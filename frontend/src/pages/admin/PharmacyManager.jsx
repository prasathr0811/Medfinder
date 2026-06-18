import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Building, Phone, Clock, FileText } from 'lucide-react';

// Reset leaflet default icon paths to unpkg CDN to avoid bundler asset path errors
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = defaultIcon;

const PharmacyManager = () => {
  const [searchVal, setSearchVal] = useState('');

  // Fetch pharmacies
  const { data: pharmacies = [], isLoading } = useQuery({
    queryKey: ['admin-pharmacies'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/admin/pharmacies');
      return data;
    }
  });

  const filteredPharmacies = pharmacies.filter((p) => {
    if (searchVal.trim()) {
      const term = searchVal.toLowerCase();
      return (
        p.pharmacyName.toLowerCase().includes(term) ||
        p.licenseNumber.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        (p.owner?.name || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Central fallback point for Map Center (Bangalore)
  const mapCenter = [12.9716, 77.5946];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pharmacy Listings Directory</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Verify registered healthcare retail storefronts and map coordinates compliance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Directory List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by store name, license, address..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => <div key={n} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : filteredPharmacies.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-10 text-center">No pharmacies match search criteria.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredPharmacies.map((pharm) => (
                <div
                  key={pharm._id}
                  className="glass-card p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-2 hover:border-indigo-500/40 transition-all text-xs"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{pharm.pharmacyName}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Owner: {pharm.owner?.name} ({pharm.owner?.email})</p>
                  </div>

                  <div className="space-y-1 text-slate-500">
                    <p className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> License: {pharm.licenseNumber}</p>
                    <p className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone: {pharm.phone}</p>
                    <p className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Hours: {pharm.workingHours}</p>
                    <p className="text-[10px] text-slate-400 truncate"><MapPin className="h-3 w-3 inline text-indigo-500 mr-0.5" /> {pharm.address}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Compliance Map locator (3 Columns) */}
        <div className="lg:col-span-3 h-[550px] relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          {isLoading ? (
            <div className="h-full w-full bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center text-slate-400 font-medium">
              Loading platform maps...
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Loop pharmacies and place markers */}
              {filteredPharmacies
                .filter((p) => p.coordinates && p.coordinates.coordinates && p.coordinates.coordinates.length === 2)
                .map((pharm) => {
                  const [lng, lat] = pharm.coordinates.coordinates;
                  return (
                    <Marker key={pharm._id} position={[lat, lng]}>
                      <Popup>
                        <div className="text-xs p-1 space-y-1.5 text-slate-800">
                          <h4 className="font-extrabold text-indigo-600 leading-snug">{pharm.pharmacyName}</h4>
                          <p className="font-medium text-[10px] text-slate-500 leading-normal">{pharm.address}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Phone: {pharm.phone}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">Hours: {pharm.workingHours}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          )}
        </div>

      </div>

    </div>
  );
};

export default PharmacyManager;
