import { httpJson } from "./http";

const BASE = "/api/shopping-lists";

export const shoppingListsApi = {
  list() {
    return httpJson(BASE);
  },

  get(id) {
    return httpJson(`${BASE}/${id}`);
  },

  create(data) {
    return httpJson(BASE, { method: "POST", body: data });
  },

  update(id, data) {
    return httpJson(`${BASE}/${id}`, { method: "PUT", body: data });
  },

  remove(id) {
    return httpJson(`${BASE}/${id}`, { method: "DELETE" });
  },
};
