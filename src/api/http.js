export async function httpJson(path, { method = "GET", body, headers } = {}) {
  const finalHeaders = {
    ...(headers || {}),
  };

  if (body != null) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(path, {
    method,
    headers: finalHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
