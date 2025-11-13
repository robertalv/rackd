/**
 * Cloudflare Turnstile client component for web
 * 
 * Provides bot protection for forms using Cloudflare Turnstile.
 * For React Native, use the hook-based approach instead.
 */

"use client";

import { useEffect, useRef, useState } from "react";

export interface TurnstileOptions {
  siteKey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  language?: string;
  tabindex?: number;
  retry?: "auto" | "never";
  retryInterval?: number;
  refreshExpired?: "auto" | "manual" | "never";
  appearance?: "always" | "execute" | "interaction-only";
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
}

// Cloudflare Turnstile global type declaration
declare global {
  // eslint-disable-next-line no-var
  var turnstile: {
    render: (
      element: HTMLElement | string,
      options: TurnstileOptions & { callback?: (token: string) => void }
    ) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
    getResponse: (widgetId: string) => string | undefined;
  } | undefined;
}

/**
 * React hook for Cloudflare Turnstile
 * 
 * @example
 * ```tsx
 * const { token, reset, isLoading } = useTurnstile({
 *   siteKey: "your-site-key",
 *   onSuccess: (token) => console.log("Verified:", token),
 * });
 * 
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <div ref={containerRef} />
 *     <button disabled={!token}>Submit</button>
 *   </form>
 * );
 * ```
 */
export function useTurnstile(options: TurnstileOptions) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Turnstile script if not already loaded
    // Check if we're in a browser environment
    if (typeof globalThis === "undefined") return;
    const doc = (globalThis as { document?: Document }).document;
    if (!doc) return;

    const scriptId = "cf-turnstile-script";
    let script = doc.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = doc.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      const head = doc.head || doc.getElementsByTagName("head")[0];
      head.appendChild(script);
    }

    const handleLoad = () => {
      const turnstile = (globalThis as any).turnstile;
      if (!turnstile || !containerRef.current) return;

      setIsLoading(false);

      try {
        const id = turnstile.render(containerRef.current, {
          sitekey: options.siteKey,
          theme: options.theme,
          size: options.size,
          language: options.language,
          tabindex: options.tabindex,
          retry: options.retry,
          "retry-interval": options.retryInterval,
          "refresh-expired": options.refreshExpired,
          appearance: options.appearance,
          callback: (token: string) => {
            setToken(token);
            setError(null);
            options.onSuccess?.(token);
          },
          "error-callback": () => {
            const error = "Turnstile verification failed";
            setError(error);
            setToken(null);
            options.onError?.(error);
          },
          "expired-callback": () => {
            setToken(null);
            options.onExpire?.();
          },
        });

        widgetIdRef.current = id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize Turnstile");
        setIsLoading(false);
      }
    };

    const turnstile = (globalThis as any).turnstile;
    if (turnstile) {
      handleLoad();
    } else {
      script.onload = handleLoad;
    }

    return () => {
      const turnstile = (globalThis as any).turnstile;
      if (widgetIdRef.current && turnstile) {
        try {
          turnstile.remove(widgetIdRef.current);
        } catch (err) {
          console.error("Failed to remove Turnstile widget:", err);
        }
      }
    };
  }, [options.siteKey]); // Only re-run if siteKey changes

  const reset = () => {
    const turnstile = (globalThis as any).turnstile;
    if (widgetIdRef.current && turnstile) {
      try {
        turnstile.reset(widgetIdRef.current);
        setToken(null);
        setError(null);
      } catch (err) {
        console.error("Failed to reset Turnstile widget:", err);
      }
    }
  };

  const getResponse = (): string | undefined => {
    const turnstile = (globalThis as any).turnstile;
    if (widgetIdRef.current && turnstile) {
      return turnstile.getResponse(widgetIdRef.current);
    }
    return undefined;
  };

  return {
    token,
    isLoading,
    error,
    containerRef,
    reset,
    getResponse,
  };
}

/**
 * Turnstile widget component for React
 * 
 * @example
 * ```tsx
 * <TurnstileWidget
 *   siteKey="your-site-key"
 *   onSuccess={(token) => setFormToken(token)}
 *   theme="auto"
 * />
 * ```
 */
export function TurnstileWidget({
  siteKey,
  theme = "auto",
  size = "normal",
  onSuccess,
  onError,
  onExpire,
  className,
  ...props
}: TurnstileOptions & { className?: string }) {
  const { containerRef, isLoading, error } = useTurnstile({
    siteKey,
    theme,
    size,
    onSuccess,
    onError,
    onExpire,
  });

  if (isLoading) {
    return (
      <div className={className} {...props}>
        <div style={{ minHeight: size === "compact" ? "65px" : "65px" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} {...props}>
        <div style={{ color: "red" }}>Error: {error}</div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} {...props} />;
}

