import React, { useState } from "react";
import { Link } from "react-router-dom";

const INITIAL_LISTS = [
  {
    id: 1,
    name: "Víkendový nákup",
    archived: false,
    ownerId: 1,
    members: [
      { id: 1, name: "Alena" },
      { id: 2, name: "Petr" },
      { id: 3, name: "Katka" },
    ],
    items: [],
  },
  {
    id: 2,
    name: "Dovolená hory",
    archived: false,
    ownerId: 2,
    members: [
      { id: 2, name: "Petr" },
      { id: 1, name: "Alena" },
    ],
    items: [],
  },
  {
    id: 3,
    name: "Firemní párty",
    archived: true,
    ownerId: 3,
    members: [
      { id: 3, name: "Katka" },
      { id: 2, name: "Petr" },
      { id: 1, name: "Alena" },
    ],
    items: [],
  },
];

const USERS = [
  { id: 1, name: "Alena" },
  { id: 2, name: "Petr" },
  { id: 3, name: "Katka" },
];

function getOwnerName(list) {
  return list.members.find((m) => m.id === list.ownerId)?.name || "Neznámý";
}

function ShoppingListRoute() {
  const [lists, setLists] = useState(Array.isArray(INITIAL_LISTS) ? INITIAL_LISTS : []);
  const [filter, setFilter] = useState("all");
  const [newName, setNewName] = useState("");

  // simulace přihlášeného uživatele
  const [currentUserId, setCurrentUserId] = useState(1); // default: Alena

  const filteredLists = (lists || []).filter((list) => {
    if (filter === "active") return !list.archived;
    if (filter === "archived") return list.archived;
    return true;
  });

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;

    const safeLists = Array.isArray(lists) ? lists : [];
    const nextId =
      (safeLists.reduce((max, l) => Math.max(max, l.id), 0) || 0) + 1;

    const ownerId = currentUserId || 1;
    const ownerUser = USERS.find((u) => u.id === ownerId);

    const newList = {
      id: nextId,
      name,
      archived: false,
      ownerId,
      members: [
        {
          id: ownerId,
          name: ownerUser ? ownerUser.name : "Uživatel",
        },
      ],
      items: [],
    };

    setLists((prev) => [...(Array.isArray(prev) ? prev : []), newList]);
    setNewName("");
  };

  const canDeleteList = (list) =>
    currentUserId != null && list.ownerId === currentUserId;

  const handleDelete = (id) => {
    const safeLists = Array.isArray(lists) ? lists : [];
    const list = safeLists.find((l) => l.id === id);
    if (!list) return;

    if (!canDeleteList(list)) {
      alert("Nákupní seznam může smazat pouze jeho vlastník.");
      return;
    }

    if (!window.confirm("Opravdu chcete tento nákupní seznam smazat?")) return;

    setLists((prev) =>
      (Array.isArray(prev) ? prev : []).filter((l) => l.id !== id)
    );
  };

  const handleToggleArchive = (id) => {
    setLists((prev) =>
      (Array.isArray(prev) ? prev : []).map((list) =>
        list.id === id ? { ...list, archived: !list.archived } : list
      )
    );
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
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>
        Přehled nákupních seznamů
      </h1>

      {/* Simulace uživtele */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto 24px",
          background: "#fff",
          padding: 16,
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h2>Simulace přihlášeného uživatele</h2>
        <div style={{ marginBottom: 16 }}>
          <label>
            Aktuální uživatel:{" "}
            <select
              value={currentUserId ?? ""}
              onChange={handleChangeUser}
              style={{ padding: "4px 8px" }}
            >
              <option value="">Neregistrovaný návštěvník</option>
              {USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2>Filtr</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setFilter("all")}
            disabled={filter === "all"}
          >
            Vše
          </button>
          <button
            onClick={() => setFilter("active")}
            disabled={filter === "active"}
          >
            Aktivní
          </button>
          <button
            onClick={() => setFilter("archived")}
            disabled={filter === "archived"}
          >
            Archivované
          </button>
        </div>

        <h2>Nový nákupní seznam</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, padding: "6px 8px" }}
            placeholder="Název nového seznamu"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button onClick={handleCreate}>Vytvořit</button>
        </div>
      </section>

      {/* Dlaždice */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {filteredLists.length === 0 ? (
          <p>Žádné seznamy k zobrazení.</p>
        ) : (
          filteredLists.map((list) => (
            <article
              key={list.id}
              style={{
                background: list.archived ? "#f0f0f0" : "#ffffff",
                borderRadius: 8,
                padding: 16,
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                border: list.archived ? "1px dashed #bbb" : "1px solid #ddd",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  textDecoration: list.archived ? "line-through" : "none",
                }}
              >
                {list.name}
              </h3>
              <p style={{ margin: "4px 0" }}>
                <strong>Vlastník:</strong> {getOwnerName(list)}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>Počet členů:</strong> {list.members.length}
              </p>
              <p style={{ margin: "4px 0 12px" }}>
                Stav:{" "}
                {list.archived ? "Archivovaný seznam" : "Aktivní seznam"}
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <Link to={`/shopping-list/${list.id}`}>
                  <button>Detail</button>
                </Link>

                <button onClick={() => handleToggleArchive(list.id)}>
                  {list.archived ? "Obnovit" : "Archivovat"}
                </button>

                <button
                  onClick={() => handleDelete(list.id)}
                  disabled={!canDeleteList(list)}
                  title={
                    !canDeleteList(list)
                      ? "Seznam může smazat pouze jeho vlastník."
                      : undefined
                  }
                  style={{ marginLeft: "auto" }}
                >
                  Smazat
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default ShoppingListRoute;
