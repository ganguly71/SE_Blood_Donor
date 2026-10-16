import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  Phone, 
  Clock, 
  AlertTriangle, 
  Heart, 
  Building2, 
  Calendar, 
  Maximize2, 
  Crosshair, 
  Sliders, 
  Compass, 
  Share2,
  CheckCircle2,
  Ambulance,
  Sparkles,
  RefreshCw,
  Globe
} from 'lucide-react';
import { calculateDistance } from '../utils/geo';

export default function BloodMap({
  requests = [],
  donors = [],
  bloodBanks = [],
  camps = [],
  cities = [],
  onSelectDonor,
  onRequestBlood,
  onPickLocation,
  isPickerMode = false,
  pickerLocation = null,
  initialCity = 'Kolkata & Serampore',
  showNotification
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Map Filter States
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [filterBloodGroup, setFilterBloodGroup] = useState('ALL');
  const [radiusKm, setRadiusKm] = useState(35); // 0 means 'All / Nationwide'
  const [layers, setLayers] = useState({
    requests: true,
    donors: true,
    bloodBanks: true,
    camps: true
  });
  const [userLocation, setUserLocation] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [selectedRouteTarget, setSelectedRouteTarget] = useState(null);
  const [mapStyle, setMapStyle] = useState('osm'); // 'osm', 'carto_light', 'carto_dark'

  // Current center coordinates based on city or user location
  const currentCityObj = cities.find(c => c.name.toLowerCase() === selectedCity.toLowerCase()) || cities[0] || {
    name: 'Kolkata & Serampore',
    lat: 22.7500,
    lng: 88.3440
  };

  const centerLat = userLocation?.lat || currentCityObj.lat;
  const centerLng = userLocation?.lng || currentCityObj.lng;

  // Function to invalidate Leaflet size reliably
  const triggerMapInvalidate = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 12,
        zoomControl: false,
        trackResize: true
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layers
      const tileLayers = {
        osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }),
        carto_light: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap & CARTO',
          maxZoom: 19
        }),
        carto_dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap & CARTO',
          maxZoom: 19
        })
      };

      tileLayers[mapStyle]?.addTo(map);
      mapInstanceRef.current = map;
      mapInstanceRef.current._tileLayers = tileLayers;

      // Group layer for markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Picker mode click handler
      map.on('click', (e) => {
        if (isPickerMode && onPickLocation) {
          onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    }

    // Call invalidateSize progressively as layout settles
    const timers = [
      setTimeout(() => triggerMapInvalidate(), 50),
      setTimeout(() => triggerMapInvalidate(), 200),
      setTimeout(() => triggerMapInvalidate(), 500),
      setTimeout(() => triggerMapInvalidate(), 1000)
    ];

    // ResizeObserver on the container
    let resizeObserver = null;
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        triggerMapInvalidate();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleResize = () => triggerMapInvalidate();
    window.addEventListener('resize', handleResize);

    return () => {
      timers.forEach(t => clearTimeout(t));
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  // Update Tile Layer if style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const layersMap = map._tileLayers;
    if (!layersMap) return;

    Object.values(layersMap).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    layersMap[mapStyle]?.addTo(map);
    triggerMapInvalidate();
  }, [mapStyle]);

  // Center update when selected city changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const city = cities.find(c => c.name.toLowerCase() === selectedCity.toLowerCase());
    if (city) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], 12, {
        duration: 1.2
      });
      setTimeout(() => triggerMapInvalidate(), 400);
    }
  }, [selectedCity, cities]);

  // Handle Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 13, { duration: 1.2 });
          setTimeout(() => triggerMapInvalidate(), 300);
        }
        if (showNotification) {
          showNotification("GPS coordinates locked! Map re-centered on your location.");
        }
      },
      (err) => {
        console.warn("Geolocation denied or unavailable:", err.message);
        if (showNotification) {
          showNotification("Location permission denied. Defaulting to selected regional center.");
        }
      },
      { timeout: 10000 }
    );
  };

  // Render Markers and Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // 1. Draw Radius Circle if enabled (radiusKm > 0)
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radiusKm > 0) {
      const radiusMeters = radiusKm * 1000;
      const circle = L.circle([centerLat, centerLng], {
        radius: radiusMeters,
        color: '#ef4444',
        weight: 1.5,
        opacity: 0.65,
        fillColor: '#ef4444',
        fillOpacity: 0.05,
        dashArray: '6, 8'
      }).addTo(mapInstanceRef.current);
      radiusCircleRef.current = circle;
    }

    // 2. User Location or City Pin Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([centerLat, centerLng], { icon: userIcon })
      .bindPopup(`
        <div class="p-3 text-xs">
          <div class="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-blue-600"></span>
            ${userLocation ? 'Your Identified Location' : `${currentCityObj.name} Regional Focal Point`}
          </div>
          <p class="text-slate-500 mt-1">Radius Search Anchor (${radiusKm > 0 ? `${radiusKm} km scope` : 'Nationwide View'})</p>
        </div>
      `)
      .addTo(markersLayer);

    // 3. Render Emergency Requests (Red Pulsing)
    if (layers.requests) {
      requests.forEach((req) => {
        if (!req.lat || !req.lng) return;
        if (filterBloodGroup !== 'ALL' && req.bloodGroup !== filterBloodGroup) return;

        const dist = calculateDistance(centerLat, centerLng, req.lat, req.lng);
        if (radiusKm > 0 && dist > radiusKm) return;

        const isCritical = req.urgency === 'CRITICAL';
        const reqIcon = L.divIcon({
          className: 'req-marker',
          html: `
            <div class="pulse-marker-wrapper cursor-pointer">
              <div class="pulse-marker-ring critical"></div>
              <div class="pin-icon-badge w-10 h-10 rounded-2xl ${
                isCritical ? 'bg-gradient-to-tr from-rose-700 to-red-500' : 'bg-rose-600'
              } text-white flex flex-col items-center justify-center border-2 border-white font-black text-xs shadow-lg">
                <span>${req.bloodGroup}</span>
                <span class="text-[9px] font-normal -mt-0.5">${req.units}U</span>
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const marker = L.marker([req.lat, req.lng], { icon: reqIcon }).addTo(markersLayer);
        marker.on('click', () => {
          setActiveItem({ ...req, type: 'request', distance: dist });
          drawRoute(centerLat, centerLng, req.lat, req.lng);
        });
      });
    }

    // 4. Render Available Donors (Green / Slate)
    if (layers.donors) {
      donors.forEach((donor) => {
        if (!donor.lat || !donor.lng) return;
        if (filterBloodGroup !== 'ALL' && donor.bloodGroup !== filterBloodGroup) return;

        const dist = calculateDistance(centerLat, centerLng, donor.lat, donor.lng);
        if (radiusKm > 0 && dist > radiusKm) return;

        const isAvailable = donor.isAvailableNow && donor.eligible;
        const donorIcon = L.divIcon({
          className: 'donor-marker',
          html: `
            <div class="pulse-marker-wrapper cursor-pointer">
              ${isAvailable ? '<div class="pulse-marker-ring donor"></div>' : ''}
              <div class="pin-icon-badge w-9 h-9 rounded-full ${
                isAvailable ? 'bg-emerald-600' : 'bg-slate-700'
              } text-white flex items-center justify-center border-2 border-white font-bold text-xs shadow-md">
                ${donor.bloodGroup}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([donor.lat, donor.lng], { icon: donorIcon }).addTo(markersLayer);
        marker.on('click', () => {
          setActiveItem({ ...donor, type: 'donor', distance: dist });
          drawRoute(centerLat, centerLng, donor.lat, donor.lng);
        });
      });
    }

    // 5. Render Blood Banks & Hospitals (Blue)
    if (layers.bloodBanks) {
      bloodBanks.forEach((bank) => {
        if (!bank.lat || !bank.lng) return;

        const dist = calculateDistance(centerLat, centerLng, bank.lat, bank.lng);
        if (radiusKm > 0 && dist > radiusKm) return;

        const bankIcon = L.divIcon({
          className: 'bank-marker',
          html: `
            <div class="pulse-marker-wrapper cursor-pointer">
              <div class="pulse-marker-ring bank"></div>
              <div class="pin-icon-badge w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center border-2 border-white shadow-lg">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19z"/></svg>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([bank.lat, bank.lng], { icon: bankIcon }).addTo(markersLayer);
        marker.on('click', () => {
          setActiveItem({ ...bank, type: 'bank', distance: dist });
          drawRoute(centerLat, centerLng, bank.lat, bank.lng);
        });
      });
    }

    // 6. Render Donation Camps (Purple)
    if (layers.camps) {
      camps.forEach((camp) => {
        if (!camp.lat || !camp.lng) return;

        const dist = calculateDistance(centerLat, centerLng, camp.lat, camp.lng);
        if (radiusKm > 0 && dist > radiusKm) return;

        const campIcon = L.divIcon({
          className: 'camp-marker',
          html: `
            <div class="pulse-marker-wrapper cursor-pointer">
              <div class="pulse-marker-ring camp"></div>
              <div class="pin-icon-badge w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-fuchsia-600 text-white flex items-center justify-center border-2 border-white shadow-lg">
                <svg class="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([camp.lat, camp.lng], { icon: campIcon }).addTo(markersLayer);
        marker.on('click', () => {
          setActiveItem({ ...camp, type: 'camp', distance: dist });
          drawRoute(centerLat, centerLng, camp.lat, camp.lng);
        });
      });
    }

    // 7. Render Picker Mode Pin if active
    if (isPickerMode && pickerLocation) {
      const pickIcon = L.divIcon({
        className: 'picker-marker',
        html: `
          <div class="relative flex items-center justify-center animate-bounce">
            <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center border-4 border-white shadow-2xl">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      L.marker([pickerLocation.lat, pickerLocation.lng], { icon: pickIcon })
        .bindPopup("Selected Requisition / Donor Drop Point")
        .addTo(markersLayer)
        .openPopup();
    }
  }, [
    requests,
    donors,
    bloodBanks,
    camps,
    layers,
    filterBloodGroup,
    radiusKm,
    centerLat,
    centerLng,
    isPickerMode,
    pickerLocation
  ]);

  // Helper to draw simulated transit route polyline
  const drawRoute = (fromLat, fromLng, toLat, toLng) => {
    if (!mapInstanceRef.current) return;
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    const midLat = (fromLat + toLat) / 2 + (Math.random() * 0.008 - 0.004);
    const midLng = (fromLng + toLng) / 2 + (Math.random() * 0.008 - 0.004);

    const latlngs = [
      [fromLat, fromLng],
      [midLat, midLng],
      [toLat, toLng]
    ];

    const polyline = L.polyline(latlngs, {
      color: '#dc2626',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(mapInstanceRef.current);

    routePolylineRef.current = polyline;
    setSelectedRouteTarget({ toLat, toLng });

    mapInstanceRef.current.fitBounds(polyline.getBounds(), {
      padding: [60, 60],
      maxZoom: 14
    });
  };

  // Clear active route
  const clearRoute = () => {
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    setSelectedRouteTarget(null);
  };

  // Nearby Items Counts in current radius (or all if radiusKm === 0)
  const nearbyCounts = {
    requests: requests.filter(r => r.lat && (radiusKm === 0 || calculateDistance(centerLat, centerLng, r.lat, r.lng) <= radiusKm)).length,
    donors: donors.filter(d => d.lat && d.isAvailableNow && (radiusKm === 0 || calculateDistance(centerLat, centerLng, d.lat, d.lng) <= radiusKm)).length,
    banks: bloodBanks.filter(b => b.lat && (radiusKm === 0 || calculateDistance(centerLat, centerLng, b.lat, b.lng) <= radiusKm)).length,
    camps: camps.filter(c => c.lat && (radiusKm === 0 || calculateDistance(centerLat, centerLng, c.lat, c.lng) <= radiusKm)).length
  };

  const totalNearby = nearbyCounts.requests + nearbyCounts.donors + nearbyCounts.banks + nearbyCounts.camps;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xl bg-white flex flex-col lg:flex-row h-[780px]">
      {/* Left Sidebar Controls & Live Feed */}
      <div className="w-full lg:w-96 bg-slate-900 text-white flex flex-col z-20 shadow-xl overflow-hidden flex-shrink-0">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-950">
                <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  Live Geo-Radar
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </h2>
                <p className="text-[11px] text-slate-400">Real-time Proximity Engine</p>
              </div>
            </div>

            <button
              onClick={handleLocateMe}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-semibold"
              title="Pinpoint Current GPS Location"
            >
              <Crosshair className="w-4 h-4 text-rose-400" />
              <span>GPS</span>
            </button>
          </div>

          {/* City Quick Selector */}
          <div className="mt-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Regional Focal Hub
            </label>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    setSelectedCity(city.name);
                    setUserLocation(null);
                    clearRoute();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedCity.toLowerCase() === city.name.toLowerCase() && !userLocation
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-800 space-y-3.5 bg-slate-900/90 text-xs">
          {/* Blood Group Filter */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 font-medium">Filter by Blood Group:</span>
              <span className="text-rose-400 font-bold">{filterBloodGroup}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {['ALL', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                <button
                  key={bg}
                  onClick={() => setFilterBloodGroup(bg)}
                  className={`py-1 rounded text-center font-bold text-[11px] transition ${
                    filterBloodGroup === bg
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Radius Range Slider & Unlimited Toggle */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Distance Scope:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                  {radiusKm > 0 ? `${radiusKm} km radius` : 'Nationwide / All'}
                </span>
                <button
                  onClick={() => setRadiusKm(radiusKm === 0 ? 35 : 0)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${
                    radiusKm === 0 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle nationwide view"
                >
                  {radiusKm === 0 ? 'Scoped' : 'All'}
                </button>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={radiusKm === 0 ? 100 : radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>5 km</span>
              <span>35 km</span>
              <span>70 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Layer Toggles */}
          <div>
            <span className="text-slate-400 font-medium block mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Map Resources:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={layers.requests}
                  onChange={(e) => setLayers({ ...layers, requests: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-rose-300 font-semibold flex items-center gap-1">
                  🔴 Requests ({nearbyCounts.requests})
                </span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={layers.donors}
                  onChange={(e) => setLayers({ ...layers, donors: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  🟢 Donors ({nearbyCounts.donors})
                </span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={layers.bloodBanks}
                  onChange={(e) => setLayers({ ...layers, bloodBanks: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-blue-300 font-semibold flex items-center gap-1">
                  🏥 Banks ({nearbyCounts.banks})
                </span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-lg cursor-pointer hover:bg-slate-800 transition">
                <input
                  type="checkbox"
                  checked={layers.camps}
                  onChange={(e) => setLayers({ ...layers, camps: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-purple-300 font-semibold flex items-center gap-1">
                  ⛺ Camps ({nearbyCounts.camps})
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Active Feed / Selected Pin Drawer */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeItem ? (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex justify-between items-start">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  activeItem.type === 'request' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  activeItem.type === 'donor' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  activeItem.type === 'bank' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {activeItem.type === 'request' ? `🚨 ${activeItem.urgency} REQUEST` :
                   activeItem.type === 'donor' ? '💚 ACTIVE DONOR' :
                   activeItem.type === 'bank' ? '🏥 BLOOD BANK & LAB' : '⛺ DONATION DRIVE'}
                </span>

                <button
                  onClick={() => {
                    setActiveItem(null);
                    clearRoute();
                  }}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {/* Title & Blood Group */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {activeItem.bloodGroup || (activeItem.type === 'bank' ? '🏥' : '⛺')}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-snug">
                    {activeItem.patientName || activeItem.name || activeItem.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeItem.hospital || activeItem.area || activeItem.location} • {activeItem.city}
                  </p>
                </div>
              </div>

              {/* Distance & Transit Time */}
              {activeItem.distance !== null && (
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DISTANCE</span>
                    <span className="text-amber-400 font-bold">{activeItem.distance} km away</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">EST. RESPONSE TIME</span>
                    <span className="text-emerald-400 font-bold">
                      ~{Math.max(4, Math.round((activeItem.distance / 35) * 60))} mins
                    </span>
                  </div>
                </div>
              )}

              {/* Details notes or stock info */}
              {activeItem.type === 'request' && (
                <div className="space-y-1 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl">
                  <p><span className="text-slate-400">Units Needed:</span> <strong className="text-white">{activeItem.units} Units</strong></p>
                  <p><span className="text-slate-400">Timeline:</span> {activeItem.dateNeeded}</p>
                  {activeItem.notes && <p className="text-[11px] text-slate-400 italic">"{activeItem.notes}"</p>}
                </div>
              )}

              {activeItem.type === 'donor' && (
                <div className="space-y-1 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl">
                  <p><span className="text-slate-400">Profile:</span> {activeItem.age} yrs • {activeItem.gender}</p>
                  <p><span className="text-slate-400">Last Donation:</span> {activeItem.lastDonated}</p>
                  <p><span className="text-slate-400">Badge:</span> <span className="text-amber-300 font-bold">{activeItem.badge}</span></p>
                </div>
              )}

              {activeItem.type === 'bank' && (
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl">
                  <p className="font-semibold text-slate-200">Live Inventory Snapshot:</p>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px]">
                    {Object.entries(activeItem.inventory || {}).map(([grp, cnt]) => (
                      <div key={grp} className={`p-1 rounded ${cnt <= 2 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-200'}`}>
                        <span className="font-bold">{grp}:</span> {cnt}U
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-1 flex gap-2">
                {(activeItem.contactNumber || activeItem.phone) && (
                  <a
                    href={`tel:${activeItem.contactNumber || activeItem.phone}`}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call {activeItem.type === 'request' ? 'Attendant' : 'Direct'}
                  </a>
                )}

                {activeItem.type === 'request' && onRequestBlood && (
                  <button
                    onClick={() => onRequestBlood(activeItem)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Pledge Blood
                  </button>
                )}

                {activeItem.type === 'donor' && onSelectDonor && (
                  <button
                    onClick={() => onSelectDonor(activeItem)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 px-2 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-300">Click any map marker</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Click any emergency distress pin, verified donor, or blood bank on the map to calculate distance, travel time, and launch direct hospital coordination.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative flex-1 h-full w-full bg-slate-200 min-h-[500px]">
        {/* Leaflet Mount Container: using absolute inset-0 guarantees complete 100% fill */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />

        {/* Map Top Floating Overlay Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Radius Active:
            </span>
            <span className="text-slate-600 font-medium">
              {radiusKm > 0 ? (
                <>Within <strong className="text-rose-600 font-bold">{radiusKm} km</strong> of {userLocation ? 'Your Location' : selectedCity}</>
              ) : (
                <strong className="text-rose-600 font-bold">Showing All Nationwide Resources</strong>
              )}
            </span>
          </div>

          {/* Map Controls */}
          <div className="pointer-events-auto flex items-center space-x-2">
            <button
              onClick={() => {
                triggerMapInvalidate();
                if (showNotification) showNotification("Map tile view refreshed!");
              }}
              className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200/80 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition"
              title="Refresh / Align Map Tiles"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Map Tile Style Switcher */}
            <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200/80 flex space-x-1 text-[11px] font-semibold text-slate-700">
              <button
                onClick={() => setMapStyle('osm')}
                className={`px-2.5 py-1 rounded-lg transition ${mapStyle === 'osm' ? 'bg-rose-600 text-white' : 'hover:bg-slate-100'}`}
              >
                Standard
              </button>
              <button
                onClick={() => setMapStyle('carto_light')}
                className={`px-2.5 py-1 rounded-lg transition ${mapStyle === 'carto_light' ? 'bg-rose-600 text-white' : 'hover:bg-slate-100'}`}
              >
                Positron Clean
              </button>
              <button
                onClick={() => setMapStyle('carto_dark')}
                className={`px-2.5 py-1 rounded-lg transition ${mapStyle === 'carto_dark' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
              >
                Dark Radar
              </button>
            </div>
          </div>
        </div>

        {/* Notice when 0 items found in chosen radius */}
        {totalNearby === 0 && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>No resources match within {radiusKm} km.</span>
            <button
              onClick={() => setRadiusKm(0)}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg font-bold text-[11px] transition"
            >
              Show All Nationwide
            </button>
            <button
              onClick={() => setRadiusKm(Math.min(100, (radiusKm || 30) + 30))}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg font-bold text-[11px] transition"
            >
              Expand to {(radiusKm || 30) + 30} km
            </button>
          </div>
        )}

        {/* Picker Mode Instruction Banner */}
        {isPickerMode && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 bg-rose-600 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold text-xs flex items-center space-x-2 border-2 border-white animate-bounce">
            <Crosshair className="w-4 h-4" />
            <span>Click anywhere on the map to drop hospital / donor location pin</span>
          </div>
        )}

        {/* Legend Ribbon at bottom right */}
        <div className="hidden sm:flex absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-700 items-center space-x-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            Critical Request
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            Ready Donor
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            Blood Bank
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
            Donation Camp
          </span>
        </div>
      </div>
    </div>
  );
}
