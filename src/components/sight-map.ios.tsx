import { AppleMaps } from "expo-maps";

import type { SightMapProps } from "./sight-map";

export function SightMap({ name, latitude, longitude }: SightMapProps) {
  const coordinates = { latitude, longitude };
  return (
    <AppleMaps.View
      style={{ height: 220, borderRadius: 16, borderCurve: "continuous", overflow: "hidden" }}
      cameraPosition={{ coordinates, zoom: 15 }}
      markers={[{ id: "sight", title: name, coordinates }]}
      uiSettings={{ myLocationButtonEnabled: false, togglePitchEnabled: false }}
    />
  );
}
