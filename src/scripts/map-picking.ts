/** Coordinates and radius are CSS pixels, after projecting the live SVG geometry. */
export interface ScreenPlace {
  href: string;
  x: number;
  y: number;
}

export function nearbyPlaces<T extends ScreenPlace>(
  places: readonly T[], x: number, y: number, radius = 26,
): T[] {
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius < 0) return [];
  const ranked = places
    .map((place, order) => ({ place, order, distance: Math.hypot(place.x - x, place.y - y) }))
    .filter(({ distance }) => Number.isFinite(distance) && distance <= radius)
    // URL order makes equal-distance results independent of SVG paint order or focus emphasis.
    .sort((a, b) => a.distance - b.distance || (a.place.href < b.place.href ? -1 : a.place.href > b.place.href ? 1 : 0) || a.order - b.order);
  const seen = new Set<string>();
  return ranked.filter(({ place }) => {
    if (seen.has(place.href)) return false;
    seen.add(place.href);
    return true;
  }).map(({ place }) => place);
}
