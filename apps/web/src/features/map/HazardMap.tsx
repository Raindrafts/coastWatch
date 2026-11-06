import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Report, HazardType } from '@coastwatch/contracts';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface HazardMapProps {
  reports: Report[];
  selectedHazard?: HazardType | 'all';
}

export const HazardMap: React.FC<HazardMapProps> = ({ reports, selectedHazard = 'all' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validReports = reports.filter(
    (r) =>
      r.location &&
      typeof r.location.latitude === 'number' &&
      typeof r.location.longitude === 'number' &&
      (selectedHazard === 'all' || r.hazardType === selectedHazard)
  );

  const missingCount = reports.filter((r) => !r.location || typeof r.location.latitude !== 'number').length;

  if (!mounted) {
    return <div className="h-96 w-full bg-slate-100 animate-pulse rounded-xl" />;
  }

  // Default coordinate center (Bay of Bengal / South Asia coastal zone)
  const defaultCenter: [number, number] = [13.0827, 80.2707];

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[450px] w-full rounded-xl overflow-hidden shadow border border-slate-200">
        <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.location!.latitude, report.location!.longitude]}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-slate-800">{report.title}</div>
                  <div className="text-xs text-sky-700 font-medium capitalize mt-1">
                    {report.hazardType.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 line-clamp-2">{report.description}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Severity: {report.reportedSeverity}</span>
                    <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{report.publicId}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Displaying {validReports.length} reports with GPS verification.</span>
        {missingCount > 0 && (
          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {missingCount} report(s) without valid GPS coordinates excluded from map.
          </span>
        )}
      </div>
    </div>
  );
};
