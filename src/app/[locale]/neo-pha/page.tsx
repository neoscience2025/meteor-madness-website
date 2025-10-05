"use client";

import { useEffect } from "react";

export default function NeoPhaPage() {
  useEffect(() => {
    window.location.href = "https://nolaskote.github.io/simulatio_next";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p>You are being redirected to the NEO-PHA simulation.</p>
        <p className="mt-2">
          If you are not redirected automatically,{" "}
          <a 
            href="https://nolaskote.github.io/simulatio_next"
            className="text-blue-600 underline"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
}
