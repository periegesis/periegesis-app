export type AddCityButtonProps = {
  onPress: () => void;
  disabled?: boolean;
};

// Importing needs expo-file-system to store photos, which isn't available on
// web, so there is no Add button there.
export function AddCityButton(_props: AddCityButtonProps) {
  return null;
}
