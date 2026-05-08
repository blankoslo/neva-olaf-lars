"use client";

import { useState } from "react";

export default function InviteButton({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select text from a hidden input
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-ember"
      style={{ width: "100%" }}
    >
      {copied ? "✓ LENKE KOPIERT" : "INVITER NOEN"}
    </button>
  );
}
