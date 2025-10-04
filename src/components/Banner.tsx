"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Banner() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = (e?.data ?? {}) as any;
      if ((data.type === "GO_STORY" || data.action === "go") && data.route) {
        const locale = pathname.split("/")[1];
        router.push(`/${locale}${data.route}`);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [router, pathname]);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        // 👇 mismo fondo que earth.html
        background: "radial-gradient(circle at top, #0b0f29 0%, #000 100%)",
      }}
    >
      <iframe
        src="/earth.html"
        title="Earth 3D"
        style={{
          width: "80%",
          height: "100%",
          border: 0,
          zIndex: 1,
          background: "transparent", // por si el UA pinta algo
        }}
      />
    </section>
  );
}
