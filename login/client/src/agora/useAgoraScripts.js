import { useEffect, useState } from "react";

const scripts = [
  {
    id: "agora-rtc-sdk",
    src: "https://download.agora.io/sdk/release/AgoraRTC_N-4.21.0.js",
  },
  {
    id: "agora-rtm-sdk",
    src: "https://download.agora.io/sdk/release/AgoraRTM_N-1.5.2.js",
  },
];

export function useAgoraScripts() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadScript = (descriptor) =>
      new Promise((resolve, reject) => {
        const existing = document.getElementById(descriptor.id);
        if (existing) {
          if (existing.getAttribute("data-loaded") === "true") {
            resolve();
          } else {
            existing.addEventListener("load", resolve, { once: true });
            existing.addEventListener("error", () => reject(new Error(`Failed to load ${descriptor.src}`)), { once: true });
          }
          return;
        }

        const tag = document.createElement("script");
        tag.id = descriptor.id;
        tag.src = descriptor.src;
        tag.async = true;
        tag.onload = () => {
          tag.setAttribute("data-loaded", "true");
          resolve();
        };
        tag.onerror = () => reject(new Error(`Failed to load ${descriptor.src}`));
        document.body.appendChild(tag);
      });

    (async () => {
      try {
        for (const script of scripts) {
          await loadScript(script);
        }
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}

export default useAgoraScripts;
