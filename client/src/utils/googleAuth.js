/**
 * Google Identity Services (GIS) Client Helper
 */

export const getGoogleClientId = () => {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "320069342827-35m503f7jmjdhnum8dsca5nr4adrbtfe.apps.googleusercontent.com"
  );
};

/**
 * Ensures Google Identity Services script is loaded.
 */
export const ensureGoogleScriptLoaded = (timeout = 6000) => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
      return resolve(window.google);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(window.google);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        // Fallback: If not in DOM, inject script dynamically
        if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (window.google?.accounts?.oauth2) resolve(window.google);
            else reject(new Error("Failed to initialize Google SDK."));
          };
          script.onerror = () => reject(new Error("Failed to load Google SDK script."));
          document.head.appendChild(script);
        } else {
          reject(new Error("Timed out waiting for Google Identity Services script."));
        }
      }
    }, 100);
  });
};

/**
 * Triggers Google OAuth popup using Google Identity Services (GIS) Token Model.
 * @param {Object} options
 * @param {(accessToken: string) => void} options.onSuccess
 * @param {(error: any) => void} options.onError
 * @param {() => void} [options.onCancel]
 */
export const triggerGoogleLogin = async ({ onSuccess, onError, onCancel }) => {
  try {
    const google = await ensureGoogleScriptLoaded();
    const clientId = getGoogleClientId();

    if (!clientId) {
      throw new Error("Google Client ID is not configured.");
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          if (
            tokenResponse.error === "popup_closed_by_user" ||
            tokenResponse.error_subtype === "popup_closed"
          ) {
            onCancel?.();
            return;
          }
          onError?.(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }

        if (!tokenResponse.access_token) {
          onError?.(new Error("No access token returned from Google."));
          return;
        }

        onSuccess?.(tokenResponse.access_token);
      },
      error_callback: (error) => {
        if (error?.type === "popup_closed") {
          onCancel?.();
        } else {
          onError?.(error);
        }
      }
    });

    client.requestAccessToken();
  } catch (error) {
    onError?.(error);
  }
};
