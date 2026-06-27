import { useCallback, useState } from "react";
import { api } from "@/lib/api/client";
import { encryptPage, generateWritingKey } from "@/lib/crypto";
import { loadKey, storeKey } from "@/lib/crypto/keystore";
import type { SavePageBody, SavedPage } from "@mihrab/shared";

interface UseRitualOptions {
  onSaved: () => void;
  hasEnteredBefore: boolean;
}

export function useRitual({ onSaved, hasEnteredBefore }: UseRitualOptions) {
  const [pendingKey, setPendingKey] = useState<CryptoKey | null>(null);
  const [pendingPhrase, setPendingPhrase] = useState<string[] | null>(null);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [pendingStrategyIds, setPendingStrategyIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyMissing, setKeyMissing] = useState(false);

  const doEncryptAndSave = useCallback(async (text: string, key: CryptoKey, strategyIds: number[] = []) => {
    const { ciphertext, iv } = await encryptPage(text, key);
    await api.post<SavedPage>("/api/pages", { ciphertext, iv, strategyIds } satisfies SavePageBody);
    onSaved();
  }, [onSaved]);

  /** Start the save flow. Shows key reveal modal on first use. */
  const save = useCallback(async (text: string, strategyIds: number[] = []) => {
    setIsSaving(true);
    setError(null);
    setKeyMissing(false);

    try {
      const key = await loadKey();

      if (key == null) {
        if (hasEnteredBefore) {
          // Returning user on a new device — key is missing, don't generate a new one.
          // Old pages would become permanently unreadable if we used a different key.
          setKeyMissing(true);
          return;
        }
        // First-time user: generate a new key and show the reveal modal.
        const { phrase, key: newKey } = await generateWritingKey();
        setPendingKey(newKey);
        setPendingPhrase(phrase);
        setPendingText(text);
        setPendingStrategyIds(strategyIds);
        return;
      }
      setKeyMissing(false);

      await doEncryptAndSave(text, key, strategyIds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  }, [doEncryptAndSave]);

  /** Called when the user confirms they've saved their recovery phrase. */
  const confirmKeyAndSave = useCallback(async () => {
    if (pendingKey == null || pendingText == null) return;
    setIsSaving(true);
    setError(null);

    try {
      await storeKey(pendingKey);
      await doEncryptAndSave(pendingText, pendingKey, pendingStrategyIds);
      setPendingKey(null);
      setPendingPhrase(null);
      setPendingText(null);
      setPendingStrategyIds([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  }, [pendingKey, pendingText, pendingStrategyIds, doEncryptAndSave]);

  const dismissKeyModal = useCallback(() => {
    setPendingKey(null);
    setPendingPhrase(null);
    setPendingText(null);
    setPendingStrategyIds([]);
  }, []);

  return {
    save,
    confirmKeyAndSave,
    dismissKeyModal,
    showKeyModal: pendingKey != null && pendingPhrase != null,
    pendingPhrase,
    isSaving,
    error,
    keyMissing,
  };
}
