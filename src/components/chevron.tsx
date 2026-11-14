import { SymbolView } from "expo-symbols";

import { useColors } from "@/theme/colors";

/** A disclosure chevron; pointing down when `expanded`, right otherwise. */
export function Chevron({ expanded = false }: { expanded?: boolean }) {
  const colors = useColors();
  return (
    <SymbolView
      name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
      size={22}
      weight="semibold"
      tintColor={colors.secondaryLabel}
      style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
    />
  );
}
