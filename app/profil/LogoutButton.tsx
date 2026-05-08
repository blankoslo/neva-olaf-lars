"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-ember"
      style={{ width: "100%", marginTop: 6 }}
    >
      Logg ut
    </button>
  );
}
