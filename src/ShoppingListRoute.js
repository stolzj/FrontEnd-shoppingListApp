import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { shoppingListsApi } from "./api/shoppingLists";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const USERS = [
  { id: 1, name: "Alena" },
  { id: 2, name: "Petr" },
  { id: 3, name: "Katka" }
];

function getOwnerName(list, fallback = "—") {
  return list.members.find((m) => m.id === list.ownerId)?.name || fallback;
}

function ShoppingListRoute() {
  const { t } = useTranslation();
  const [lists, setLists] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [newName, setNewName] = useState("");

  // simulace přihlášeného uživatele
  const [currentUserId, setCurrentUserId] = useState(1); // default: Alena
  const isVisitor = currentUserId == null;

  const filteredLists = useMemo(() => {
    const safe = Array.isArray(lists) ? lists : [];
    return safe.filter((list) => {
      if (filter === "active") return !list.archived;
      if (filter === "archived") return list.archived;
      return true;
    });
  }, [lists, filter]);

  const stats = useMemo(() => {
    const safe = Array.isArray(lists) ? lists : [];
    const activeCount = safe.filter((l) => !l.archived).length;
    const archivedCount = safe.filter((l) => l.archived).length;
    const itemsTotal = safe.reduce((sum, l) => sum + (l.items?.length || 0), 0);
    const itemsOpen = safe.reduce(
      (sum, l) => sum + (l.items || []).filter((i) => !i.done).length,
      0
    );

    const perList = safe
      .map((l) => ({
        name: l.name,
        open: (l.items || []).filter((i) => !i.done).length,
        done: (l.items || []).filter((i) => i.done).length
      }))
      .sort((a, b) => b.open - a.open)
      .slice(0, 8);

    return {
      totalCount: safe.length,
      activeCount,
      archivedCount,
      itemsTotal,
      itemsOpen,
      perList
    };
  }, [lists]);

  async function loadLists() {
    setStatus("loading");
    setError(null);

    try {
      const data = await shoppingListsApi.list();
      setLists(Array.isArray(data) ? data : []);
      setStatus("ready");
    } catch (e) {
      console.error("Failed to load shopping lists:", e);
      setError(e);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadLists();
  }, []);

  const handleCreate = async () => {
    if (isVisitor) return;

    const name = newName.trim();
    if (!name) return;

    const ownerId = currentUserId || 1;
    const ownerUser = USERS.find((u) => u.id === ownerId);

    try {
      const created = await shoppingListsApi.create({
        name,
        archived: false,
        ownerId,
        members: [
          {
            id: ownerId,
            name: ownerUser ? ownerUser.name : "Uživatel"
          }
        ],
        items: []
      });
      setLists((prev) => [...(Array.isArray(prev) ? prev : []), created]);
      setNewName("");
    } catch (e) {
      alert(e.message || t("createListFailed"));
    }
  };

  const canDeleteList = (list) =>
    currentUserId != null && list.ownerId === currentUserId;

  const handleDelete = async (id) => {
    const safeLists = Array.isArray(lists) ? lists : [];
    const list = safeLists.find((l) => l.id === id);
    if (!list) return;

    if (!canDeleteList(list)) {
      alert(t("deleteOnlyOwner"));
      return;
    }

    if (!window.confirm(t("confirmDeleteList"))) return;

    try {
      await shoppingListsApi.remove(id);
      setLists((prev) =>
        (Array.isArray(prev) ? prev : []).filter((l) => l.id !== id)
      );
    } catch (e) {
      alert(e.message || t("deleteListFailed"));
    }
  };

  const handleToggleArchive = async (id) => {
    const list = (Array.isArray(lists) ? lists : []).find((l) => l.id === id);
    if (!list) return;
    const next = { ...list, archived: !list.archived };

    setLists((prev) =>
      (Array.isArray(prev) ? prev : []).map((l) => (l.id === id ? next : l))
    );

    try {
      await shoppingListsApi.update(id, { archived: next.archived });
    } catch (e) {
      setLists((prev) =>
        (Array.isArray(prev) ? prev : []).map((l) => (l.id === id ? list : l))
      );
      alert(e.message || t("archiveToggleFailed"));
    }
  };

  const handleChangeUser = (event) => {
    const value = event.target.value;
    if (value === "") {
      setCurrentUserId(null);
    } else {
      setCurrentUserId(Number(value));
    }
  };

  return (
    <div>
      <h1 className="h1">{t("overviewTitle")}</h1>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("stats")}</div>
            <div className="row" style={{ gap: 16 }}>
              <span>
                <strong>{t("listsTotal")}:</strong> {stats.totalCount}
              </span>
              <span>
                <strong>{t("listsActive")}:</strong> {stats.activeCount}
              </span>
              <span>
                <strong>{t("listsArchived")}:</strong> {stats.archivedCount}
              </span>
              <span>
                <strong>{t("itemsOpen")}:</strong> {stats.itemsOpen}
              </span>
              <span>
                <strong>{t("itemsTotal")}:</strong> {stats.itemsTotal}
              </span>
            </div>
          </div>
        </div>

        {status === "ready" && stats.perList.length > 0 && (
          <div style={{ width: "100%", height: 240, marginTop: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.perList}
                margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
              >
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="open" name={t("open")} fill="var(--open)" />
                <Bar dataKey="done" name={t("done")} fill="var(--done)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="subtle" style={{ marginTop: 6 }}>
              {t("itemsOpen")} / {t("done")} (Top 8)
            </div>
          </div>
        )}
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 10px" }}>{t("signedInSim")}</h2>
        <div className="row" style={{ marginBottom: 12 }}>
          <label className="field">
            <span className="field__label">{t("currentUser")}</span>
            <select
              className="input"
              value={currentUserId ?? ""}
              onChange={handleChangeUser}
            >
              <option value="">{t("visitor")}</option>
              {USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 style={{ margin: "0 0 10px" }}>{t("filter")}</h2>
        <div className="row" style={{ marginBottom: 12 }}>
          <button
            className="btn"
            onClick={() => setFilter("all")}
            disabled={filter === "all"}
          >
            {t("all")}
          </button>
          <button
            className="btn"
            onClick={() => setFilter("active")}
            disabled={filter === "active"}
          >
            {t("active")}
          </button>
          <button
            className="btn"
            onClick={() => setFilter("archived")}
            disabled={filter === "archived"}
          >
            {t("archived")}
          </button>
        </div>

        <h2 style={{ margin: "0 0 10px" }}>{t("newList")}</h2>
        <div>
          <div className="row">
            <input
              className="input"
              style={{ flex: 1 }}
              placeholder={t("newListPlaceholder")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isVisitor}
            />
            <button
              className="btn btn--primary"
              onClick={handleCreate}
              disabled={isVisitor}
            >
              {t("create")}
            </button>
          </div>
          {isVisitor && (
            <div className="subtle" style={{ marginTop: 6 }}>
              {t("visitorCantCreateList")}
            </div>
          )}
        </div>
      </section>

      {status === "loading" && (
        <p style={{ textAlign: "center" }}>{t("loadingLists")}</p>
      )}

      {status === "error" && (
        <div className="card">
          <p style={{ color: "var(--danger)", marginTop: 0 }}>
            {error?.message ? `${error.message}` : ""}
          </p>
          <button className="btn" onClick={loadLists}>
            {t("retry")}
          </button>
        </div>
      )}

      {status === "ready" && (
        <section className="grid">
          {filteredLists.length === 0 ? (
            <p>{t("noLists")}</p>
          ) : (
            filteredLists.map((list) => (
              <article
                key={list.id}
                className={`card ${list.archived ? "card--muted" : ""}`}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: 10,
                    textDecoration: list.archived ? "line-through" : "none"
                  }}
                >
                  {list.name}
                </h3>

                <div style={{ marginBottom: 10 }}>
                  <div>
                    <strong>{t("owner")}:</strong> {getOwnerName(list)}
                  </div>
                  <div>
                    <strong>{t("membersCount")}:</strong> {list.members.length}
                  </div>
                  <div>
                    <strong>{t("status")}:</strong>{" "}
                    {list.archived ? t("statusArchived") : t("statusActive")}
                  </div>
                </div>

                <div className="row" style={{ justifyContent: "space-between" }}>
                  <Link to={`/shopping-list/${list.id}`}>
                    <button className="btn">{t("detail")}</button>
                  </Link>

                  <button
                    className="btn"
                    onClick={() => handleToggleArchive(list.id)}
                  >
                    {list.archived ? t("restore") : t("archive")}
                  </button>

                  <button
                    className="btn btn--danger"
                    onClick={() => handleDelete(list.id)}
                    disabled={!canDeleteList(list)}
                    title={!canDeleteList(list) ? t("deleteOnlyOwner") : undefined}
                  >
                    {t("delete")}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default ShoppingListRoute;