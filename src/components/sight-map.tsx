export type SightMapProps = {
  name: string;
  latitude: number;
  longitude: number;
};

// An embedded map needs a Google Maps API key on Android and has no web
// implementation, so only iOS (Apple Maps) shows one. Elsewhere the sight
// screen relies on the "Open in Maps" button.
export function SightMap(_props: SightMapProps) {
  return null;
}
