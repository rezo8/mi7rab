import { useState } from "react";

interface Props {
  phrase: string[];
  onConfirm: () => void;
  onDismiss: () => void;
  isBusy: boolean;
}

export function KeyRevealModal({ phrase, onConfirm, onDismiss, isBusy }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  const copyPhrase = () => {
    void navigator.clipboard.writeText(phrase.join(" "));
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="key-modal-title">
      <div className="auth-card modal-card">
        <h2 className="auth-title" id="key-modal-title">
          Before we save
        </h2>

        <p className="key-modal-body">
          Your words are yours alone. Everything is encrypted in your browser — the server
          receives only sealed ciphertext. No one can read your pages but you.
        </p>

        <p className="key-modal-body">
          This is your recovery phrase. Write it down somewhere safe.{" "}
          <strong>It will not be shown again.</strong> If you lose it and lose this device,
          your pages will live in a locked box, drifting away from your memory.
        </p>

        <div className="key-phrase-grid" aria-label="Recovery phrase — 24 words">
          {phrase.map((word, i) => (
            <span key={i} className="key-phrase-word">
              <span className="key-phrase-num">{i + 1}</span>
              {word}
            </span>
          ))}
        </div>

        <button type="button" className="link-quiet key-copy-btn" onClick={copyPhrase}>
          copy to clipboard
        </button>

        <label className="key-ack">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            disabled={isBusy}
          />
          <span>I've written this down somewhere safe</span>
        </label>

        <button
          type="button"
          className="btn"
          disabled={!acknowledged || isBusy}
          onClick={onConfirm}
        >
          {isBusy ? "Encrypting…" : "Encrypt and save"}
        </button>

        <button type="button" className="link-quiet" onClick={onDismiss} disabled={isBusy}>
          cancel
        </button>
      </div>
    </div>
  );
}
