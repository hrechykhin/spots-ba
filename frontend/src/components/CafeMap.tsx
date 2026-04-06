import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import type { CafeMapPin } from '../types/cafe'

// Fix Leaflet default marker icons broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const AMBER_ICON = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Bratislava old town center
const BRATISLAVA_CENTER: [number, number] = [48.1486, 17.1077]

interface CafeMapProps {
  cafes: CafeMapPin[]
  singleMarker?: boolean
  zoom?: number
  height?: string
}

export function CafeMap({ cafes, singleMarker = false, zoom = 13, height = '100%' }: CafeMapProps) {
  const center: [number, number] = singleMarker && cafes.length === 1
    ? [cafes[0].latitude, cafes[0].longitude]
    : BRATISLAVA_CENTER

  return (
    <MapContainer
      center={center}
      zoom={singleMarker ? 15 : zoom}
      style={{ height, width: '100%' }}
      scrollWheelZoom={!singleMarker}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {cafes.map((cafe) => (
        <Marker key={cafe.id} position={[cafe.latitude, cafe.longitude]} icon={AMBER_ICON}>
          {!singleMarker && (
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">{cafe.name}</p>
                {cafe.google_rating && (
                  <p className="text-stone-600 mb-2">★ {cafe.google_rating.toFixed(1)}</p>
                )}
                <Link
                  to={`/cafe/${cafe.id}`}
                  className="text-amber-700 font-medium hover:underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  )
}
