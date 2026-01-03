import { INITIAL_LISTS } from "../shoppingData";

let lists = structuredClone(INITIAL_LISTS);

function nextId() {
  const max = lists.reduce((m, l) => Math.max(m, Number(l.id) || 0), 0);
  return max + 1;
}

export const db = {
  reset() {
    lists = structuredClone(INITIAL_LISTS);
  },

  list() {
    return lists.map((l) => ({
      id: l.id,
      name: l.name,
      archived: l.archived,
      ownerId: l.ownerId,
      members: l.members,
      items: l.items,
    }));
  },

  get(id) {
    return lists.find((l) => String(l.id) === String(id)) || null;
  },

  create(data) {
    const list = {
      id: nextId(),
      name: data?.name || "Nový seznam",
      archived: Boolean(data?.archived),
      ownerId: data?.ownerId ?? 1,
      members: Array.isArray(data?.members) ? data.members : [],
      items: Array.isArray(data?.items) ? data.items : [],
    };
    lists = [...lists, list];
    return list;
  },

  update(id, patch) {
    const idx = lists.findIndex((l) => String(l.id) === String(id));
    if (idx === -1) return null;
    const current = lists[idx];

    const updated = {
      ...current,
      ...patch,
      members: patch?.members ?? current.members,
      items: patch?.items ?? current.items,
    };
    lists = lists.map((l, i) => (i === idx ? updated : l));
    return updated;
  },

  remove(id) {
    const exists = lists.some((l) => String(l.id) === String(id));
    lists = lists.filter((l) => String(l.id) !== String(id));
    return exists;
  },
};
