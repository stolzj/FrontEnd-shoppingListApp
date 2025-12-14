import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shoppingListsApi } from "./api/shoppingLists";

function ShoppingListDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listId = Number(id);

  // HOOKY – volají se vždy, nikdy ne podmíněně
  const [status, setStatus] = useState("loading"); // loading | ready | error | notFound
  const [error, setError] = useState(null);
  const [shoppingList, setShoppingList] = useState({
    id: listId,
    name: "",
    ownerId: 1,
    members: [],
    items: [],
  });
  const [currentUserId, setCurrentUserId] = useState(2); // simulace uživatele Petr
  const [listNameDraft, setListNameDraft] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [itemFilter, setItemFilter] = useState("open"); // "open" | "all"

  async function loadDetail() {
    // když URL není validní číslo, nepouštěj request
    if (!Number.isFinite(listId)) {
      setStatus("notFound");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const data = await shoppingListsApi.get(listId);
      setShoppingList(data);
      setListNameDraft(data?.name || "");
      setStatus("ready");
    } catch (e) {
      if (e?.status === 404) {
        setStatus("notFound");
      } else {
        setError(e);
        setStatus("error");
      }
    }
  }

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const currentUser = shoppingList.members.find((m) => m.id === currentUserId);
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
    const prevName = shoppingList.name;
    setShoppingList((prev) => ({ ...prev, name: trimmed }));
    shoppingListsApi.update(listId, { name: trimmed }).catch((e) => {
      // rollback
      setShoppingList((prev) => ({ ...prev, name: prevName }));
      alert(e.message || "Nepodařilo se uložit název");
    });
  };

  // vlastník přidává členy
  const handleAddMember = () => {
    if (!isOwner) return;
    const trimmed = newMemberName.trim();
    if (!trimmed) return;

    const nextId =
      (shoppingList.members.reduce((max, m) => Math.max(max, m.id), 0) || 0) +
      1;

    const nextMembers = [...shoppingList.members, { id: nextId, name: trimmed }];
    setShoppingList((prev) => ({ ...prev, members: nextMembers }));
    shoppingListsApi.update(listId, { members: nextMembers }).catch((e) => {
      // rollback
      setShoppingList((prev) => ({ ...prev, members: shoppingList.members }));
      alert(e.message || "Nepodařilo se přidat člena");
    });
    setNewMemberName("");
  };

  // vlastník odebírá člena
  const handleRemoveMember = (memberId) => {
    if (!isOwner) return;

    if (memberId === shoppingList.ownerId) {
      alert("Vlastníka nelze odstranit 🙂");
      return;
    }

    const prevMembers = shoppingList.members;
    const updatedMembers = prevMembers.filter((m) => m.id !== memberId);
    setShoppingList((prev) => ({ ...prev, members: updatedMembers }));
    if (memberId === currentUserId) setCurrentUserId(null);

    shoppingListsApi.update(listId, { members: updatedMembers }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, members: prevMembers }));
      alert(e.message || "Nepodařilo se odebrat člena");
    });
  };

  // "odejít" ze seznamu
  const handleLeaveList = () => {
    if (!currentUser || isOwner) return;
    const prevMembers = shoppingList.members;
    const updatedMembers = prevMembers.filter((m) => m.id !== currentUserId);
    setShoppingList((prev) => ({ ...prev, members: updatedMembers }));
    setCurrentUserId(null);

    shoppingListsApi.update(listId, { members: updatedMembers }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, members: prevMembers }));
      alert(e.message || "Nepodařilo se odejít ze seznamu");
    });
  };

  // přidání položky
  const handleAddItem = () => {
    if (isVisitor) return;

    const trimmed = newItemName.trim();
    if (!trimmed) return;

    const nextId =
      (shoppingList.items.reduce((max, i) => Math.max(max, i.id), 0) || 0) + 1;

    const prevItems = shoppingList.items;
    const updatedItems = [
      ...prevItems,
      { id: nextId, name: trimmed, done: false },
    ];
    setShoppingList((prev) => ({ ...prev, items: updatedItems }));
    shoppingListsApi.update(listId, { items: updatedItems }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, items: prevItems }));
      alert(e.message || "Nepodařilo se přidat položku");
    });
    setNewItemName("");
  };

  // odebrání položky
  const handleRemoveItem = (itemId) => {
    if (isVisitor) return;

    const prevItems = shoppingList.items;
    const updatedItems = prevItems.filter((i) => i.id !== itemId);
    setShoppingList((prev) => ({ ...prev, items: updatedItems }));
    shoppingListsApi.update(listId, { items: updatedItems }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, items: prevItems }));
      alert(e.message || "Nepodařilo se smazat položku");
    });
  };

  // toggle done
  const handleToggleItemDone = (itemId) => {
    if (isVisitor) return;

    const prevItems = shoppingList.items;
    const updatedItems = prevItems.map((i) =>
      i.id === itemId ? { ...i, done: !i.done } : i
    );
    setShoppingList((prev) => ({ ...prev, items: updatedItems }));
    shoppingListsApi.update(listId, { items: updatedItems }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, items: prevItems }));
      alert(e.message || "Nepodařilo se změnit stav položky");
    });
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

  if (status === "loading") {
    return (
      <div style={cardStyle}>
        <p>Načítám detail…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={cardStyle}>
        <h2>Chyba</h2>
        <p style={{ color: "#b00020" }}>
          Nepodařilo se načíst detail: {error?.message || "Neznámá chyba"}
        </p>
        <button onClick={loadDetail}>Zkusit znovu</button>
      </div>
    );
  }

  // Když ID neexistuje, zobrazíme jednoduchou hlášku:
  if (status === "notFound") {
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
              isVisitor
                ? "Návštěvník nemůže přidávat položky"
                : "Název nové položky"
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
