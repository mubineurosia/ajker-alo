(function () {
  const config = window.AJKER_ALO_SUPABASE || {};
  window.ajkerAloBackendReady = Boolean(config.url && config.anonKey && window.supabase);
  window.ajkerAloSupabase = window.ajkerAloBackendReady
    ? window.supabase.createClient(config.url, config.anonKey)
    : null;
})();
