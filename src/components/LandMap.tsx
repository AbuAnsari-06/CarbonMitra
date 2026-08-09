import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { PRESET_REGIONS } from '../data/presets';
import { PresetRegion, GeoPoint } from '../types';
import { MapPin, Layers, RefreshCw, CheckCircle2, Navigation, Info } from 'lucide-react';

interface LandMapProps {
  polygonCoords: GeoPoint[];
  setPolygonCoords: React.Dispatch<React.SetStateAction<GeoPoint[]>> | ((coords: GeoPoint[]) => void);
  areaHectares: number;
  selectedPreset: PresetRegion | null;
  setSelectedPreset: (preset: PresetRegion | null) => void;
  onSelectPreset?: (preset: PresetRegion) => void;
  showNdviOverlay?: boolean;
  ndviScore?: number;
}

export const LandMap: React.FC<LandMapProps> = ({
  polygonCoords,
  setPolygonCoords,
  areaHectares,
  selectedPreset,
  setSelectedPreset,
  onSelectPreset,
  showNdviOverlay = false,
  ndviScore = 0.72
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const ndviHeatmapLayerRef = useRef<L.Polygon | null>(null);

  const [mapMode, setMapMode] = useState<'satellite' | 'streets'>('satellite');
  const [isDrawing, setIsDrawing] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const defaultCenter: [number, number] = selectedPreset
      ? selectedPreset.center
      : [20.5937, 78.9629]; // Center of India

    const defaultZoom = selectedPreset ? 15 : 5;

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
    });

    // Satellite tile layer
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri World Imagery',
        maxZoom: 19
      }
    );

    satelliteLayer.addTo(map);
    mapRef.current = map;

    // Handle map click for drawing polygon pins
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newPoint: GeoPoint = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6))
      };

      (setPolygonCoords as React.Dispatch<React.SetStateAction<GeoPoint[]>>)((prev: GeoPoint[]) => [...prev, newPoint]);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when mode changes
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    if (mapMode === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      ).addTo(mapRef.current);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);
    }
  }, [mapMode]);

  // Synchronize Polygon Coordinates and Markers on Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
      polygonLayerRef.current = null;
    }

    if (ndviHeatmapLayerRef.current) {
      ndviHeatmapLayerRef.current.remove();
      ndviHeatmapLayerRef.current = null;
    }

    if (polygonCoords.length === 0) return;

    const latLngs: [number, number][] = polygonCoords.map(p => [p.lat, p.lng]);

    // Custom Icon for vertices
    const vertexIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div class="w-3.5 h-3.5 bg-emerald-400 border-2 border-zinc-950 rounded-full shadow-lg ring-2 ring-emerald-500/50"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    // Add markers for each polygon vertex
    polygonCoords.forEach((pt, idx) => {
      const marker = L.marker([pt.lat, pt.lng], { icon: vertexIcon }).addTo(mapRef.current!);
      marker.bindTooltip(`Vertex #${idx + 1}<br/>Lat: ${pt.lat}<br/>Lng: ${pt.lng}`, {
        className: 'bg-[#181a20] text-xs text-zinc-100 border border-zinc-700 px-2 py-1 rounded shadow-xl font-mono'
      });
      markersRef.current.push(marker);
    });

    // If 3 or more points, render polygon
    if (polygonCoords.length >= 3) {
      const poly = L.polygon(latLngs, {
        color: '#10b981',
        weight: 2.5,
        fillColor: '#059669',
        fillOpacity: showNdviOverlay ? 0.15 : 0.3,
        dashArray: isDrawing ? '6, 6' : undefined
      }).addTo(mapRef.current);

      polygonLayerRef.current = poly;

      // Render Sentinel-2 NDVI overlay gradient if enabled
      if (showNdviOverlay) {
        const fillColor = ndviScore > 0.75 ? '#10b981' : ndviScore > 0.60 ? '#84cc16' : '#f59e0b';
        
        const ndviLayer = L.polygon(latLngs, {
          color: fillColor,
          weight: 3,
          fillColor: fillColor,
          fillOpacity: 0.5
        }).addTo(mapRef.current);

        ndviLayer.bindPopup(`
          <div class="p-2 font-sans">
            <h4 class="font-bold text-xs text-emerald-400 flex items-center gap-1 font-display">
              🛰️ Sentinel-2 NDVI Index
            </h4>
            <p class="text-xs text-zinc-300 mt-1 font-mono">Mean Biomass: <strong>${ndviScore}</strong></p>
            <p class="text-[11px] text-zinc-400">Status: High Chlorophyll Density</p>
          </div>
        `);

        ndviHeatmapLayerRef.current = ndviLayer;
      }

      mapRef.current.fitBounds(poly.getBounds(), { padding: [35, 35] });
    } else if (polygonCoords.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, { maxZoom: 17, padding: [35, 35] });
    }
  }, [polygonCoords, showNdviOverlay, ndviScore, isDrawing]);

  // Load Preset Region
  const handleSelectPreset = (preset: PresetRegion) => {
    setSelectedPreset(preset);
    const coords: GeoPoint[] = preset.samplePolygon.map(([lat, lng]) => ({ lat, lng }));
    setPolygonCoords(coords);
    setIsDrawing(false);

    if (onSelectPreset) {
      onSelectPreset(preset);
    }

    if (mapRef.current) {
      mapRef.current.setView(preset.center, 15, { animate: true });
    }
  };

  // Reset/Clear boundary
  const handleClearMap = () => {
    setPolygonCoords([]);
    setSelectedPreset(null);
    setIsDrawing(true);
  };

  return (
    <div className="flex flex-col space-y-2.5">
      
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#181a20] p-2.5 rounded-xl border border-zinc-800/80 text-xs">
        
        {/* Map Drawing Status / Instruction */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono text-zinc-300 text-[11px]">
            {polygonCoords.length === 0
              ? 'Click satellite image to set GPS boundary pins'
              : `${polygonCoords.length} Boundary Pin(s) Set`}
          </span>
        </div>

        {/* Toggle Layer Mode & Clear */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#12141a] p-0.5 rounded-lg border border-zinc-800" role="group" aria-label="Map view mode switcher">
            <button
              type="button"
              aria-label="Switch map to satellite view"
              onClick={() => setMapMode('satellite')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all font-mono active:scale-95 ${
                mapMode === 'satellite' ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              aria-label="Switch map to streets view"
              onClick={() => setMapMode('streets')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all font-mono active:scale-95 ${
                mapMode === 'streets' ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Map
            </button>
          </div>

          <button
            type="button"
            aria-label="Reset polygon boundary coordinates"
            onClick={handleClearMap}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 rounded-lg text-xs font-mono transition-all border border-zinc-700/60"
            title="Reset polygon boundary"
          >
            <RefreshCw className="w-3 h-3 text-emerald-400" />
            <span>Reset</span>
          </button>
        </div>

      </div>

      {/* Map Container */}
      <div 
        tabIndex={0}
        aria-label="Interactive Leaflet farmland polygon drawing map canvas"
        className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-xl bg-[#12141a] focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Drawing Badge */}
        <div className="absolute top-3 left-3 z-20 bg-[#12141a]/90 backdrop-blur border border-zinc-700/80 px-3 py-1.5 rounded-lg shadow-lg text-[11px] font-mono text-zinc-200 flex items-center space-x-2">
          <Navigation className="w-3 h-3 text-emerald-400" />
          <span>
            {polygonCoords.length === 0
              ? 'Click satellite image to set GPS pins'
              : polygonCoords.length < 3
              ? `Add ${3 - polygonCoords.length} pin(s) to complete polygon`
              : 'GPS Boundary Polygon Active'}
          </span>
        </div>

        {/* Calculated Area Overlay */}
        {polygonCoords.length >= 3 && (
          <div className="absolute bottom-3 right-3 z-20 bg-[#12141a]/95 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl shadow-2xl backdrop-blur flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[9px] uppercase font-mono text-zinc-400">Calculated Land Area</p>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base font-bold font-display text-emerald-400">{areaHectares} Ha</span>
                <span className="text-[11px] text-zinc-400 font-mono">({(areaHectares * 2.47105).toFixed(2)} Acres)</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
