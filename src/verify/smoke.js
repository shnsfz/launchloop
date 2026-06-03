export async function verifyRoutes(baseUrl, routes = [], options = {}) {
  const timeoutMs = options.timeoutMs ?? 5000;
  const uniqueRoutes = [...new Set(routes.length > 0 ? routes : ['/'])];
  const results = [];

  for (const route of uniqueRoutes) {
    const url = new URL(route, ensureTrailingSlash(baseUrl)).toString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
      });
      results.push({
        route,
        url,
        status: response.status,
        ok: response.status >= 200 && response.status < 400,
        note: response.status >= 200 && response.status < 400 ? 'reachable' : `unexpected status ${response.status}`
      });
    } catch (error) {
      results.push({
        route,
        url,
        status: null,
        ok: false,
        note: error.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : error.message
      });
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    ok: results.every((r) => r.ok),
    routes: results
  };
}

function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`;
}
