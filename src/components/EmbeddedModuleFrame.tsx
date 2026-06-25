"use client";

import { useEffect, useState } from "react";

type EmbeddedModuleFrameProps = {
  title: string;
  src: string;
  height?: string;
  autoResize?: boolean;
};

const MIN_AUTO_RESIZE_HEIGHT = 720;
const MAX_AUTO_RESIZE_HEIGHT = 12000;
const RESIZE_MESSAGE_TYPE = "LUMENS_PORTAL_IFRAME_HEIGHT";

const isTrustedEmbedOrigin = (origin: string) => {
  if (!origin) return false;

  try {
    const hostname = new URL(origin).hostname;

    return (
      hostname === "script.google.com" ||
      hostname.endsWith(".googleusercontent.com") ||
      hostname === "docs.google.com"
    );
  } catch {
    return false;
  }
};

export default function EmbeddedModuleFrame({
  title,
  src,
  height = "calc(100vh - 64px)",
  autoResize = false,
}: EmbeddedModuleFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [frameHeight, setFrameHeight] = useState(height);

  useEffect(() => {
    setIsLoading(true);
    setIsSlowLoading(false);
    setFrameHeight(height);

    const slowLoadingTimer = window.setTimeout(() => {
      setIsSlowLoading(true);
    }, 8000);

    return () => {
      window.clearTimeout(slowLoadingTimer);
    };
  }, [src, height]);

  useEffect(() => {
    if (!autoResize) return;

    const handleMessage = (event: MessageEvent) => {
      if (!isTrustedEmbedOrigin(event.origin)) return;

      const data = event.data;
      if (!data || data.type !== RESIZE_MESSAGE_TYPE) return;

      const nextHeight = Math.ceil(Number(data.height));
      if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;

      const safeHeight = Math.min(
        Math.max(nextHeight, MIN_AUTO_RESIZE_HEIGHT),
        MAX_AUTO_RESIZE_HEIGHT
      );

      setFrameHeight(`${safeHeight}px`);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [autoResize]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h1 className="text-lg font-semibold text-slate-900">
              Loading module...
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This module may take a few seconds to load...
            </p>

            {isSlowLoading && (
              <>
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700">
                  Still loading. If the page stays blank, open it in a new tab to
                  check Google sign-in, Apps Script permission, or browser iframe
                  restrictions.
                </div>

                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Open in New Tab
                </a>
              </>
            )}
          </div>
        </div>
      )}

      <iframe
        src={src}
        title={title}
        className="block w-full border-0 bg-white"
        style={{ height: frameHeight }}
        scrolling={autoResize ? "no" : "auto"}
        allowFullScreen
        loading="eager"
        onLoad={() => {
          setIsLoading(false);
          setIsSlowLoading(false);
        }}
      />
    </div>
  );
}
