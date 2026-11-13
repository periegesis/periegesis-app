import * as DocumentPicker from "expo-document-picker";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

import { ImportError } from "@/import/errors";
import { importCity, type NameConflictChoice } from "@/import/import-city";

function confirmNameConflict(): Promise<NameConflictChoice> {
  return new Promise((resolve) => {
    Alert.alert(
      "City already exists",
      "Another file already exists for that city. Would you like to replace it, keep both files, or cancel?",
      [
        { text: "Replace", style: "destructive", onPress: () => resolve("replace") },
        { text: "Keep both", onPress: () => resolve("keepBoth") },
        { text: "Cancel", style: "cancel", onPress: () => resolve("cancel") },
      ],
      { cancelable: true, onDismiss: () => resolve("cancel") },
    );
  });
}

function notifyDuplicate(): Promise<void> {
  return new Promise((resolve) => {
    Alert.alert(
      "Duplicate file",
      "An identical version of this file already exists.",
      [{ text: "Cancel", style: "cancel", onPress: () => resolve() }],
      { cancelable: true, onDismiss: () => resolve() },
    );
  });
}

/** Lets the user pick a .json or .zip file and imports the city inside it. */
export function useCityImport(onImported: () => void) {
  const [importing, setImporting] = useState(false);
  const busy = useRef(false);

  const startImport = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/json",
          "application/zip",
          "application/x-zip-compressed",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      setImporting(true);
      const outcome = await importCity(result.assets[0], {
        confirmNameConflict,
        notifyDuplicate,
      });
      if (outcome === "imported") onImported();
    } catch (e) {
      const message =
        e instanceof ImportError
          ? e.message
          : "Something went wrong while reading this file.";
      if (!(e instanceof ImportError)) console.error(e);
      Alert.alert("Couldn't import file", message);
    } finally {
      busy.current = false;
      setImporting(false);
    }
  }, [onImported]);

  return { startImport, importing };
}
