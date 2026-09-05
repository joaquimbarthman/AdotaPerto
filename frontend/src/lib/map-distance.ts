export type Coordinates = { lat: number; lng: number };

export function distanceInKm(a: Coordinates, b: Coordinates) {
  const earthRadius = 6371;
  const toRadians = (value: number) => value * Math.PI / 180;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function formatDistance(km?: number) {
  if (km == null) return "Distância indisponível";
  if (km < 1) return `${Math.max(50, Math.round(km * 1000 / 50) * 50)} m`;
  return `${km.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}
