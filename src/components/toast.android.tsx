import { ToastAndroid } from "react-native";

/** Briefly shows a message over the current screen. */
export function showToast(message: string) {
  ToastAndroid.show(message, ToastAndroid.LONG);
}

/** Android uses the system toast, so there's nothing to render. */
export function ToastHost() {
  return null;
}
