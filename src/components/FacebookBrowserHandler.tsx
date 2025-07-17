"use client";

import { useEffect } from "react";

export default function FacebookBrowserHandler() {
  useEffect(() => {
    // Check if the server detected Facebook browser
    const isFacebookBrowser = document.querySelector(
      'meta[name="facebook-browser"]',
    );

    if (isFacebookBrowser) {
      const currentUrl = window.location.href;
      const domain = currentUrl.replace(/https?:\/\//, "");

      // Try to open in Chrome for Android
      window.location.href = `intent://${domain}#Intent;scheme=https;package=com.android.chrome;end;`;

      // Show fallback message after a delay
      setTimeout(() => {
        const shouldShowAlert = confirm(
          'For the best experience, please open this link in your browser app.\n\nTap the three dots (...) menu and select "Open in Browser".\n\nClick OK to try again.',
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
