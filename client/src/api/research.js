const API_URL = import.meta.env.VITE_API_URL

/**
 * Streams a research request from the server.
 * @param {string[]} companies
 * @param {string} provider  'tavily' | 'tinyfish'
 * @param {(msg: string) => void} onLog  called for each progress message
 * @returns {Promise<object[]>} rawData array when complete
 */
export async function fetchResearch(companies, provider = 'tavily', onLog) {
  const response = await fetch(`${API_URL}/api/research`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ companies, provider }),
  });

  if (!response.ok) {
    // Non-SSE error (e.g. 400/500 before headers were flushed)
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || 'Research request failed');
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by double newlines
    const parts = buffer.split('\n\n');
    buffer = parts.pop();             // keep any incomplete trailing chunk

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data: ')) continue;

      let payload;
      try { payload = JSON.parse(line.slice(6)); } catch { continue; }

      if (payload.type === 'log')      onLog(payload.message);
      else if (payload.type === 'complete') return payload.rawData;
      else if (payload.type === 'error')    throw new Error(payload.message);
    }
  }

  throw new Error('Stream ended without a completion event');
}
