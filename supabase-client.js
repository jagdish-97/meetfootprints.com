(function () {
  const config = window.FOOTPRINTS_SUPABASE_CONFIG || {};
  const hasRuntime = Boolean(window.supabase && typeof window.supabase.createClient === "function");
  const hasCredentials = Boolean(config.url && config.anonKey)
    && !String(config.url).includes("YOUR_PROJECT_ID")
    && !String(config.anonKey).includes("YOUR_SUPABASE_ANON_KEY");

  const client = hasRuntime && hasCredentials
    ? window.supabase.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
    : null;

  function getRedirectUrl(path) {
    const targetPath = path || config.redirectPath || "therapist-portal.html";
    return new URL(targetPath, window.location.href).toString();
  }

  async function ensureSession() {
    if (!client) {
      return { data: { session: null }, error: null };
    }

    if (window.location.hash.includes("access_token") || window.location.search.includes("code=")) {
      const exchangeResult = await client.auth.exchangeCodeForSession().catch(() => null);
      if (exchangeResult && !exchangeResult.error) {
        window.history.replaceState({}, "", window.location.pathname + window.location.search.replace(/([?&])code=[^&]+&?/, "$1").replace(/[?&]$/, ""));
        return exchangeResult;
      }
    }

    return client.auth.getSession();
  }

  window.footprintsSupabase = {
    client,
    config,
    isEnabled: Boolean(client),
    getRedirectUrl,
    ensureSession
  };
})();
