/** A web map URL that opens anywhere, used on web and as a fallback. */
export function webMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/** A URL that shows the coordinates in the platform's default maps app. */
export function nativeMapsUrl(
  name: string,
  latitude: number,
  longitude: number,
): string {
  const label = encodeURIComponent(name);
  switch (process.env.EXPO_OS) {
    case "ios":
      return `maps://?ll=${latitude},${longitude}&q=${label}`;
    case "android":
      return `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    default:
      return webMapsUrl(latitude, longitude);
  }
}

/** Formats coordinates as e.g. "37.97150° N, 23.72570° E". */
export function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(5)}° ${latitude >= 0 ? "N" : "S"}`;
  const lng = `${Math.abs(longitude).toFixed(5)}° ${longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lng}`;
}
