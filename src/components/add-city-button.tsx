export type AddCityButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

// On iOS the Add button is in the header toolbar (see HomeHeader). Web has
// none: importing needs expo-file-system to store photos, which isn't
// available there.
export function AddCityButton(_props: AddCityButtonProps) {
  return null;
}
