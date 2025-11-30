// src/ShoppingListDetailRoute.js
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Data pro jednotlivé seznamy podle ID
const SHOPPING_LISTS_BY_ID = {
  1: {
    id: 1,
    name: "Víkendový nákup",
    ownerId: 1,
    members: [
      { id: 1, name: "Alena" }, // vlastník
      { id: 2, name: "Petr" },
      { id: 3, name: "Katka" },
    ],
    items: [
      { id: 1, name: "Mléko 2×", done: false },
      { id: 2, name: "Chléb", done: true },
      { id: 3, name: "Máslo", done: false },
    ],
  },
  2: {
    id: 2,
    name: "Dovolená hory",
    ownerId: 2,
    members: [
      { id: 2, name: "Petr" }, // vlastník
      { id: 1, name: "Alena" },
    ],
    items: [
      { id: 1, name: "Pivo", done: false },
      { id: 2, name: "Špekáčky", done: false },
    ],
  },
  3: {
    id: 3,
    name: "Firemní párty",
    ownerId: 3,
    members: [
      { id: 3, name: "Katka" }, // vlastník
      { id: 2, name: "Petr" },
      { id: 1, name: "Alena" },
    ],
    items: [
      { id: 1, name: "Chlebíčky", done: true },
      { id: 2, name: "Pití", done: true },
    ],
  },
};

function ShoppingListDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listId = Number(id);

  const initialList = SHOPPING_LISTS_BY_ID[listId] || null;
  const listFound = !!initialList;

  // fallback – kdyby bylo ID mimo rozsah, aby hooky měly vždy nějaká data
  const fallbackList = SHOPPING_LISTS_BY_ID[1];

  // HOOKY – volají se vždy, nikdy ne podmíněně
  const [shoppingList, setShoppingList] = useState(
    initialList || fallbackList
  );
  const [currentUserId, setCurrentUserId] = useState(2); // simulace uživatele Petr
  const [listNameDraft, setListNameDraft] = useState(
    (initialList || fallbackList).name
  );
  const [newMemberName, setNewMemberName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [itemFilter, setItemFilter] = useState("open"); // "open" | "all"

  const currentUser = shoppingList.members.find(
    (m) => m.id === currentUserId
  );
  const isOwner = shoppingList.ownerId === currentUserId;
  const isVisitor = !currentUser && !isOwner;

  const filteredItems = useMemo(() => {
    if (itemFilter === "open") {
      return shoppingList.items.filter((item) => !item.done);
    }
    return shoppingList.items;
  }, [shoppingList.items, itemFilter]);

  const totalItems = shoppingList.items.length;
  const openItems = shoppingList.items.filter((i) => !i.done).length;

  // změna názvu (vlastník)
  const handleSaveName = () => {
    if (!isOwner) return;
    const trimmed = listNameDraft.trim();
    if (!trimmed) return;
    setShoppingList((prev) => ({ ...prev, name: trimmed }));
  };

  // vlastník přidává členy
  const handleAddMember = () => {
    if (!isOwner) return;
    const trimmed = newMemberName.trim();
    if (!trimmed) return;

    const nextId =
      (shoppingList.members.reduce((max, m) => Math.max(max, m.id), 0) || 0) +
      1;

    setShoppingList((prev) => ({
      ...prev,
      members: [...prev.members, { id: nextId, name: trimmed }],
    }));
    setNewMemberName("");
  };

  // vlastník odebírá člena
  const handleRemoveMember = (memberId) => {
    if (!isOwner) return;

    if (memberId === shoppingList.ownerId) {
      alert("Vlastníka nelze odstranit 🙂");
      return;
    }

    setShoppingList((prev) => {
      const updatedMembers = prev.members.filter((m) => m.id !== memberId);

      if (memberId === currentUserId) {
        setCurrentUserId(null);
      }

      return {
        ...prev,
        members: updatedMembers,
      };
    });
  };

  // "odejít" ze seznamu
  const handleLeaveList = () => {
    if (!currentUser || isOwner) return;
    setShoppingList((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== currentUserId),
    }));
    setCurrentUserId(null);
  };

  // přidání položky
  const handleAddItem = () => {
    if (isVisitor) return;

    const trimmed = newItemName.trim();
    if (!trimmed) return;

    const nextId =
      (shoppingList.items.reduce((max, i) => Math.max(max, i.id), 0) || 0) + 1;

    setShoppingList((prev) => ({
      ...prev,
      items: [...prev.items, { id: nextId, name: trimmed, done: false }],
    }));
    setNewItemName("");
  };

  // odebrání položky
  const handleRemoveItem = (itemId) => {
    if (isVisitor) return;

    setShoppingList((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  // toggle done
  const handleToggleItemDone = (itemId) => {
    if (isVisitor) return;

    setShoppingList((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId ? { ...i, done: !i.done } : i
      ),
    }));
  };

  const handleChangeFilter = (event) => {
    setItemFilter(event.target.value);
  };

  const handleChangeUser = (event) => {
    const value = event.target.value;
    if (value === "") {
      setCurrentUserId(null);
    } else {
      setCurrentUserId(Number(value));
    }
  };

  // ──────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────

  // Když ID neexistuje, zobrazíme jednoduchou hlášku:
  if (!listFound) {
    return (
      <div style={cardStyle}>
        <h2>Seznam nenalezen</h2>
        <p>Pro dané ID neexistuje žádný nákupní seznam.</p>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <section
        style={{
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #eee",
        }}
      >
        <h3>Simulace přihlášeného uživatele</h3>
        <label>
          Simulovaný uživatel:{" "}
          <select
            value={currentUserId ?? ""}
            onChange={handleChangeUser}
            style={{ padding: "4px 8px" }}
          >
            <option value="">Neregistrovaný návštěvník</option>
            {shoppingList.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.id === shoppingList.ownerId ? " (vlastník)" : ""}
              </option>
            ))}
          </select>
        </label>
      </section>

      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: 20,
          padding: "6px 12px",
          background: "#eee",
          border: "1px solid #ccc",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
      Zpět na přehled
      </button>

      <section style={{ marginBottom: "24px" }}>
        <h2>Detail nákupního seznamu</h2>

        <label style={{ display: "block", marginBottom: 8 }}>
          Název seznamu:
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={listNameDraft}
            onChange={(e) => setListNameDraft(e.target.value)}
            disabled={!isOwner}
            style={{ flex: 1, padding: "6px 8px" }}
          />
          <button onClick={handleSaveName} disabled={!isOwner}>
            Uložit
          </button>
        </div>
        {!isOwner && (
          <small style={{ color: "#888" }}>
            Název může měnit pouze vlastník seznamu.
          </small>
        )}

        <div style={{ marginTop: 16 }}>
          <strong>Vlastník:</strong>{" "}
          {shoppingList.members.find((m) => m.id === shoppingList.ownerId)
            ?.name || "Neznámý"}
        </div>
        <div>
          <strong>Aktuální uživatel:</strong>{" "}
          {currentUser ? currentUser.name : "Neregistrovaný návštěvník"}
        </div>
        {isVisitor && (
          <small style={{ color: "#888" }}>
            Jako návštěvník můžeš seznam jen prohlížet a filtrovat položky.
          </small>
        )}
        <div style={{ marginTop: 8 }}>
          <strong>Položky:</strong> {openItems} nevyřešených / {totalItems} celkem
        </div>
      </section>

      <section style={sectionStyle}>
        <h3>Členové seznamu</h3>

        <ul style={{ paddingLeft: 20 }}>
          {shoppingList.members.map((member) => (
            <li
              key={member.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span>
                {member.name}
                {member.id === shoppingList.ownerId && (
                  <span style={{ color: "#888" }}> (vlastník)</span>
                )}
                {member.id === currentUserId && (
                  <span style={{ color: "#0070f3" }}> (ty)</span>
                )}
              </span>

              {isOwner && member.id !== shoppingList.ownerId && (
                <button onClick={() => handleRemoveMember(member.id)}>
                  Odebrat
                </button>
              )}
            </li>
          ))}
        </ul>

        {isOwner && (
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Jméno nového člena"
              style={{ flex: 1, padding: "6px 8px" }}
            />
            <button onClick={handleAddMember}>Přidat člena</button>
          </div>
        )}

        {currentUser && !isOwner && (
          <button
            onClick={handleLeaveList}
            style={{ marginTop: 12, background: "#ffe0e0" }}
          >
            Odejít z nákupního seznamu
          </button>
        )}
      </section>

      <section style={sectionStyle}>
        <h3>Položky nákupního seznamu</h3>

        <div style={{ marginBottom: 12 }}>
          <label>
            Zobrazit:{" "}
            <select value={itemFilter} onChange={handleChangeFilter}>
              <option value="open">jen nevyřešené</option>
              <option value="all">všechny (včetně vyřešených)</option>
            </select>
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <p>Žádné položky k zobrazení.</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {filteredItems.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <label style={{ cursor: isVisitor ? "default" : "pointer" }}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      disabled={isVisitor}
                      onChange={() => handleToggleItemDone(item.id)}
                      style={{ marginRight: 8 }}
                    />
                    <span
                      style={{
                        textDecoration: item.done ? "line-through" : "none",
                        color: item.done ? "#888" : "inherit",
                      }}
                    >
                      {item.name}
                    </span>
                  </label>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isVisitor}
                >
                  Smazat
                </button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={
              isVisitor ? "Návštěvník nemůže přidávat položky" : "Název nové položky"
            }
            style={{ flex: 1, padding: "6px 8px" }}
            disabled={isVisitor}
          />
          <button onClick={handleAddItem} disabled={isVisitor}>
            Přidat položku
          </button>
        </div>
      </section>
    </div>
  );
}

const cardStyle = {
  maxWidth: 800,
  margin: "0 auto",
  background: "#fff",
  padding: 24,
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const sectionStyle = {
  marginBottom: 24,
  paddingTop: 12,
  borderTop: "1px solid #eee",
};

export default ShoppingListDetailRoute;
