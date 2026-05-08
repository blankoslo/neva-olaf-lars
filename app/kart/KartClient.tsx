"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

const LeafletMap = dynamic(() => import("./_LeafletMap"), { ssr: false });

export function KartClient() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".topstrip");
    const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 40;
    if (mainRef.current) {
      mainRef.current.style.height = `calc(100dvh - ${headerH}px - 60px)`;
    }

    const shell = document.querySelector<HTMLElement>(".shell");
    const prevPad = shell?.style.paddingBottom ?? "";
    if (shell) shell.style.paddingBottom = "0";

    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      if (shell) shell.style.paddingBottom = prevPad;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <main ref={mainRef} style={{ height: "calc(100dvh - 100px)", overflow: "hidden" }}>
      <LeafletMap />
    </main>
  );
}
