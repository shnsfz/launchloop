export async function callDeepSeekChat({
  apiKey,
  baseUrl,
  model,
  messages,
  timeoutMs = 30000,
  fetchImpl = fetch
}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${trimTrailingSlash(baseUrl)}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: 'json_object' },
        thinking: { type: 'disabled' }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API returned HTTP ${response.status}`);
    }

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim() === '') {
      throw new Error('DeepSeek API response did not include message content');
    }

    return {
      content,
      usage: body.usage || null
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`DeepSeek API timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function trimTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
