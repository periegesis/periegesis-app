import { Alert, Platform } from "react-native";

/**
 * Asks the user to confirm a destructive action with "Delete" and "Cancel"
 * buttons. Resolves true only if they choose "Delete".
 */
export function confirmDelete(question: string): Promise<boolean> {
  // React Native's Alert does nothing on web, so use the browser's dialog.
  if (Platform.OS === "web") return Promise.resolve(window.confirm(question));

  return new Promise((resolve) => {
    Alert.alert(
      question,
      undefined,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Delete", style: "destructive", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
