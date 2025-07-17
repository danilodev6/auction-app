"use client";

import { useEffect } from "react";

export default function FacebookBrowserHandler() {
  useEffect(() => {
    // Direct client-side detection of Facebook browser
    const userAgent = navigator.userAgent || "";
    const isFacebookBrowser =
      userAgent.includes("FBAN") ||
      userAgent.includes("FBAV") ||
      userAgent.includes("Instagram");

    console.log("User Agent:", userAgent); // For debugging
    console.log("Is Facebook Browser:", isFacebookBrowser); // For debugging

    if (isFacebookBrowser) {
      const currentUrl = window.location.href;
      const domain = currentUrl.replace(/https?:\/\//, "");

      console.log("Attempting redirect for:", domain); // For debugging

      // Try to open in Chrome for Android
      window.location.href = `intent://${domain}#Intent;scheme=https;package=com.android.chrome;end;`;

      // Show fallback message after a delay
      setTimeout(() => {
        const shouldShowAlert = confirm(
          // 'For the best experience, please open this link in your browser app.\n\nTap the three dots (...) menu and select "Open in Browser".\n\nClick OK to try again.',
          'Para una mejor experiencia, abre el link en tu navegador Chrome.\n\nPresiona "OK" y luego "CONTINUAR".',
        );

        if (shouldShowAlert) {
          // Try Samsung Browser as fallback
          window.location.href = `intent://${domain}#Intent;scheme=https;package=com.sec.android.app.sbrowser;end;`;
        }
      }, 1500);
    }
  }, []);

  return null;
}
