import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadKey, storeKey } from "@/lib/crypto/keystore";
import { decryptPage, restoreKeyFromPhrase } from "@/lib/crypto";
import { endpoints, pageUrl } from "@/lib/api/endpoints";
import type { PageSummary, PageDetail } from "@mihrab/shared";

interface Props {
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PagesModal({ onClose }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [strategyTexts, setStrategyTexts] = useState<string[]>([]);
  const [noKey, setNoKey] = useState(false);

  // Phrase recovery state
  const [showPhraseEntry, setShowPhraseEntry] = useState(false);
  const [phraseInput, setPhraseInput] = useState("");
  const [phraseError, setPhraseError] = useState<string | null>(null);

  const { data: pageList, isLoading } = useQuery<PageSummary[]>({
    queryKey: ["pages-list"],
    queryFn: async () => {
      const res = await fetch(endpoints.pages);
      if (!res.ok) throw new Error("Failed to load pages");
      return res.json() as Promise<PageSummary[]>;
    },
    staleTime: 1000 * 60,
  });

  const decrypt = useMutation({
    mutationFn: async (id: string) => {
      const key = await loadKey();
      if (!key) throw Object.assign(new Error("no_key"), { code: "no_key" });
      const res = await fetch(pageUrl(id));
      if (!res.ok) throw new Error("fetch_failed");
      const detail = (await res.json()) as PageDetail;
      const text = await decryptPage(detail.ciphertext, detail.iv, key);
      return { text, strategyTexts: detail.strategyTexts };
    },
    onSuccess: ({ text, strategyTexts: sts }) => {
      setDecryptedText(text);
      setStrategyTexts(sts);
      setNoKey(false);
      setShowPhraseEntry(false);
    },
    onError: (err: Error) => {
      setDecryptedText(null);
      setStrategyTexts([]);
      setNoKey((err as { code?: string }).code === "no_key");
    },
  });

  const restoreKey = useMutation({
    mutationFn: async (phrase: string) => {
      const words = phrase.trim().split(/\s+/);
      if (words.length !== 24) throw new Error("A recovery phrase is exactly 24 words.");
      const key = await restoreKeyFromPhrase(words);
      await storeKey(key);
    },
    onSuccess: () => {
      setPhraseError(null);
      setPhraseInput("");
      if (selectedId) decrypt.mutate(selectedId);
    },
    onError: (err: Error) => {
      setPhraseError(err.message || "Invalid recovery phrase. Check the words and try again.");
    },
  });

  function handleSelect(id: string) {
    setSelectedId(id);
    setDecryptedText(null);
    setStrategyTexts([]);
    setNoKey(false);
    setShowPhraseEntry(false);
    setPhraseInput("");
    setPhraseError(null);
    decrypt.mutate(id);
  }

  function handleBack() {
    setSelectedId(null);
    setDecryptedText(null);
    setStrategyTexts([]);
    setNoKey(false);
    setShowPhraseEntry(false);
    setPhraseInput("");
    setPhraseError(null);
    decrypt.reset();
    restoreKey.reset();
  }

  const selectedIndex = pageList?.findIndex((p) => p.id === selectedId) ?? -1;
  const selectedPage = selectedId ? pageList?.find((p) => p.id === selectedId) : null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="auth-card pages-modal modal-card">
        {/* Header */}
        <div className="pages-modal-header">
          {selectedId ? (
            <button type="button" className="link-quiet" onClick={handleBack}>
              ← back
            </button>
          ) : (
            <p className="pages-modal-title">your pages</p>
          )}
          <button type="button" className="link-quiet pages-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* List view */}
        {!selectedId && (
          <div className="pages-list">
            {isLoading && <p className="pages-empty">…</p>}
            {!isLoading && (!pageList || pageList.length === 0) && (
              <p className="pages-empty">No saved pages yet.</p>
            )}
            {pageList?.map((page, i) => (
              <button
                key={page.id}
                type="button"
                className="pages-list-item"
                onClick={() => handleSelect(page.id)}
              >
                <span className="pages-list-num">Page {i + 1}</span>
                <span className="pages-list-date">{formatDate(page.createdAt)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Reading view */}
        {selectedId && (
          <div className="pages-reading">
            {selectedPage && (
              <p className="pages-reading-meta">
                Page {selectedIndex + 1}
                <span className="pages-reading-date"> · {formatDate(selectedPage.createdAt)}</span>
              </p>
            )}

            {decrypt.isPending && <p className="pages-empty">decrypting…</p>}

            {/* No key — offer phrase entry */}
            {noKey && !showPhraseEntry && (
              <div className="pages-no-key">
                <p className="pages-empty">
                  Your key isn't on this device. Enter your recovery phrase to read these pages.
                </p>
                <button
                  type="button"
                  className="link-quiet"
                  onClick={() => setShowPhraseEntry(true)}
                >
                  enter recovery phrase →
                </button>
              </div>
            )}

            {/* Phrase entry form */}
            {noKey && showPhraseEntry && (
              <div className="pages-phrase-entry">
                <p className="pages-empty">
                  Paste or type your 24 words, separated by spaces.
                </p>
                <textarea
                  className="field-input pages-phrase-input"
                  value={phraseInput}
                  onChange={(e) => setPhraseInput(e.target.value)}
                  placeholder="word1 word2 word3 …"
                  rows={3}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="none"
                />
                {phraseError && (
                  <p className="form-error">{phraseError}</p>
                )}
                <button
                  type="button"
                  className="btn"
                  disabled={restoreKey.isPending || !phraseInput.trim()}
                  onClick={() => restoreKey.mutate(phraseInput)}
                >
                  {restoreKey.isPending ? "Restoring…" : "Restore key and read"}
                </button>
              </div>
            )}

            {decrypt.isError && !noKey && (
              <p className="pages-empty" style={{ color: "var(--color-danger)" }}>
                Could not decrypt this page.
              </p>
            )}

            {decryptedText !== null && (
              <>
                {strategyTexts.map((st, i) => (
                  <p key={i} className="pages-reading-strategy">{st}</p>
                ))}
                <div className="pages-reading-text">{decryptedText}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
