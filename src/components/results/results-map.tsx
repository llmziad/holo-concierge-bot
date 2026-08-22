'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import { Property } from '@/types/property';

function priceShort(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(price >= 10_000_000 ? 0 : 1)}M`;
  return `${Math.round(price / 1000)}K`;
}

function pinIcon(label: string, active = false): L.DivIcon {
  return L.divIcon({
    className: 'price-pin',
    html: `<span style="
      display:inline-flex;align-items:center;white-space:nowrap;
      font-family:var(--font-geist-mono),monospace;font-size:12px;font-weight:600;
      padding:3px 8px;border-radius:9999px;
      background:${active ? 'oklch(0.45 0.078 190)' : 'oklch(0.986 0.007 88)'};
      color:${active ? 'oklch(0.985 0.006 88)' : 'oklch(0.245 0.014 68)'};
      border:1.5px solid oklch(0.45 0.078 190);
      box-shadow:0 2px 8px oklch(0.35 0.03 80 / 0.25);
    ">AED ${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [26, 14],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
    }
  }, [map, points]);
  return null;
}

export default function ResultsMap({ properties }: { properties: Property[] }) {
  const pins = useMemo(
    () =>
      properties
        .filter((p) => typeof p.location.lat === 'number' && typeof p.location.lng === 'number')
        .map((p) => ({ p, pos: [p.location.lat as number, p.location.lng as number] as [number, number] })),
    [properties]
  );

  const points = useMemo(() => pins.map((x) => x.pos), [pins]);
  const center: [number, number] = points[0] ?? [25.15, 55.23];

  return (
    <div className="h-[70vh] w-full rounded-2xl overflow-hidden border border-border">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full" style={{ background: 'var(--muted)' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds points={points} />
        {pins.map(({ p, pos }) => (
          <Marker key={p.id} position={pos} icon={pinIcon(priceShort(p.price))}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontFamily: 'var(--font-geist-mono),monospace', fontWeight: 600 }}>
                  AED {p.price.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, margin: '2px 0 6px' }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#6b6152' }}>
                  {p.bedrooms === 0 ? 'Studio' : `${p.bedrooms} BR`} · {p.area.toLocaleString()} sqft · {p.location.area}
                </div>
                <a
                  href={`/property/${p.id}`}
                  style={{ display: 'inline-block', marginTop: 8, color: 'oklch(0.45 0.078 190)', fontWeight: 600, fontSize: 13 }}
                >
                  View details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
