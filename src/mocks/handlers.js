import { http, HttpResponse, delay } from "msw";
import { db } from "./db";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const handlers = [
  http.get("/api/shopping-lists", async () => {
    await delay(250);
    return HttpResponse.json(db.list(), { headers: JSON_HEADERS });
  }),

  http.get("/api/shopping-lists/:id", async ({ params }) => {
    await delay(200);
    const item = db.get(params.id);
    if (!item) {
      return HttpResponse.json(
        { message: "Not found" },
        { status: 404, headers: JSON_HEADERS }
      );
    }
    return HttpResponse.json(item, { headers: JSON_HEADERS });
  }),

  http.post("/api/shopping-lists", async ({ request }) => {
    await delay(250);
    const body = await request.json().catch(() => ({}));
    const created = db.create(body);
    return HttpResponse.json(created, { status: 201, headers: JSON_HEADERS });
  }),

  http.put("/api/shopping-lists/:id", async ({ params, request }) => {
    await delay(250);
    const patch = await request.json().catch(() => ({}));
    const updated = db.update(params.id, patch);
    if (!updated) {
      return HttpResponse.json(
        { message: "Not found" },
        { status: 404, headers: JSON_HEADERS }
      );
    }
    return HttpResponse.json(updated, { headers: JSON_HEADERS });
  }),

  http.delete("/api/shopping-lists/:id", async ({ params }) => {
    await delay(200);
    const removed = db.remove(params.id);
    if (!removed) {
      return HttpResponse.json(
        { message: "Not found" },
        { status: 404, headers: JSON_HEADERS }
      );
    }
    return HttpResponse.json({ ok: true }, { headers: JSON_HEADERS });
  }),
];
