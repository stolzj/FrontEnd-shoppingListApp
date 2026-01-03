import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { shoppingListsApi } from "./api/shoppingLists";

function ShoppingListDetailRoute() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const listId = Number(id);

  const [status, setStatus] = useState("loading"); // loading | ready | error | notFound
  const [error, setError] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);

  // simulace uživatele (v reálné app by bylo z auth)
  const [currentUserId, setCurrentUserId] = useState(2);

  const [listNameDraft, setListNameDraft] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [itemFilter, setItemFilter] = useState("open"); // open | all

  const safeList = shoppingList ?? {
  id: listId,
  name: "",
  ownerId: 1,
  members: [],
  items: []
};


  async function loadDetail() {
    if (!Number.isFinite(listId)) {
      setStatus("notFound");
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const data = await shoppingListsApi.get(listId);
      if (!data) {
      setStatus("notFound");
      return;
      }
      setShoppingList(data);
      setListNameDraft(data.name || "");
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

  const currentUser = (safeList.members || []).find((m) => m.id === currentUserId);
  const isOwner = safeList.ownerId === currentUserId;
  const isVisitor = !currentUser && !isOwner;

  const filteredItems = useMemo(() => {
  const items = safeList.items || [];
  if (itemFilter === "open") return items.filter((item) => !item.done);
  return items;
  }, [safeList.items, itemFilter]);


  const totalItems = (safeList.items || []).length;
  const openItems = (safeList.items || []).filter((i) => !i.done).length;
  const doneItems = Math.max(0, totalItems - openItems);


  const pieData = useMemo(
    () => [
      { name: t("open"), value: openItems },
      { name: t("done"), value: doneItems }
    ],
    [openItems, doneItems, t]
  );

  const handleSaveName = () => {
    if (!isOwner) return;
    const trimmed = listNameDraft.trim();
    if (!trimmed) return;

    const prevName = safeList.name;
    setShoppingList((prev) => ({ ...prev, name: trimmed }));
    shoppingListsApi.update(listId, { name: trimmed }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, name: prevName }));
      alert(e.message || t("saveNameFailed"));
    });
  };

  const handleAddMember = () => {
    if (!isOwner) return;
    const trimmed = newMemberName.trim();
    if (!trimmed) return;

    const nextId =
      ((safeList.members || []).reduce((max, m) => Math.max(max, m.id), 0) ||
        0) + 1;

    const prevMembers = safeList.members;
    const nextMembers = [...prevMembers, { id: nextId, name: trimmed }];
    setShoppingList((prev) => ({ ...prev, members: nextMembers }));
    shoppingListsApi.update(listId, { members: nextMembers }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, members: prevMembers }));
      alert(e.message || t("addMemberFailed"));
    });

    setNewMemberName("");
  };

  const handleRemoveMember = (memberId) => {
    if (!isOwner) return;

    if (memberId === safeList.ownerId) {
      alert(t("cannotRemoveOwner"));
      return;
    }

    const prevMembers = safeList.members;
    const updatedMembers = prevMembers.filter((m) => m.id !== memberId);
    setShoppingList((prev) => ({ ...prev, members: updatedMembers }));
    if (memberId === currentUserId) setCurrentUserId(null);

    shoppingListsApi.update(listId, { members: updatedMembers }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, members: prevMembers }));
      alert(e.message || t("removeMemberFailed"));
    });
  };

  const handleLeaveList = () => {
    if (!currentUser || isOwner) return;

    const prevMembers = safeList.members;
    const updatedMembers = prevMembers.filter((m) => m.id !== currentUserId);
    setShoppingList((prev) => ({ ...prev, members: updatedMembers }));
    setCurrentUserId(null);

    shoppingListsApi.update(listId, { members: updatedMembers }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, members: prevMembers }));
      alert(e.message || t("leaveFailed"));
    });
  };

  const handleAddItem = () => {
    if (isVisitor) return;

    const trimmed = newItemName.trim();
    if (!trimmed) return;

    const nextId =
      ((safeList.items || []).reduce((max, i) => Math.max(max, i.id), 0) ||
        0) + 1;

    const prevItems = safeList.items;
    const updatedItems = [...prevItems, { id: nextId, name: trimmed, done: false }];
    setShoppingList((prev) => ({ ...prev, items: updatedItems }));
    shoppingListsApi.update(listId, { items: updatedItems }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, items: prevItems }));
      alert(e.message || t("addItemFailed"));
    });

    setNewItemName("");
  };

  const handleRemoveItem = (itemId) => {
    if (isVisitor) return;

    const prevItems = safeList.items;
    const updatedItems = prevItems.filter((i) => i.id !== itemId);
    setShoppingList((prev) => ({ ...prev, items: updatedItems }));
    shoppingListsApi.update(listId, { items: updatedItems }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, items: prevItems }));
      alert(e.message || t("deleteItemFailed"));
    });
  };

  const handleToggleItemDone = (itemId) => {
    if (isVisitor) return;

    const prevItems = safeList.items;
    const updatedItems = prevItems.map((i) =>
      i.id === itemId ? { ...i, done: !i.done } : i
    );
    setShoppingList((prev) => ({ ...prev, items: updatedItems }));
    shoppingListsApi.update(listId, { items: updatedItems }).catch((e) => {
      setShoppingList((prev) => ({ ...prev, items: prevItems }));
      alert(e.message || t("toggleItemFailed"));
    });
  };

  const handleChangeUser = (event) => {
    const value = event.target.value;
    if (value === "") setCurrentUserId(null);
    else setCurrentUserId(Number(value));
  };

  if (status === "loading") {
    return (
      <div className="card">
        <p>{t("loadingDetail")}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{t("error")}</h2>
        <p style={{ color: "var(--danger)" }}>
          {t("loadDetailError")}: {error?.message || "—"}
        </p>
        <button className="btn" onClick={loadDetail}>
          {t("retry")}
        </button>
      </div>
    );
  }

  if (status === "notFound") {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{t("listNotFound")}</h2>
        <p>{t("listNotFoundText")}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 900, margin: "0 auto" }}>
      <section className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{t("signedInSim")}</div>
          <div className="subtle">{t("currentUserSim")}</div>
        </div>

        <label className="field">
          <span className="field__label">{t("currentUser")}</span>
          <select
            className="input"
            value={currentUserId ?? ""}
            onChange={handleChangeUser}
          >
            <option value="">{t("visitor")}</option>
            {safeList.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.id === safeList.ownerId ? " (owner)" : ""}
              </option>
            ))}
          </select>
        </label>
      </section>

      <hr className="divider" />

      <button className="btn" onClick={() => navigate("/")}>
        {t("back")}
      </button>

      <h2 style={{ margin: "14px 0 8px" }}>{t("listDetailTitle")}</h2>

      <div className="row" style={{ alignItems: "flex-end" }}>
        <label style={{ flex: 1 }}>
          <div className="subtle" style={{ marginBottom: 6 }}>
            {t("listName")}
          </div>
          <input
            className="input"
            style={{ width: "100%" }}
            type="text"
            value={listNameDraft}
            onChange={(e) => setListNameDraft(e.target.value)}
            disabled={!isOwner}
          />
        </label>
        <button
          className="btn btn--primary"
          onClick={handleSaveName}
          disabled={!isOwner}
        >
          {t("save")}
        </button>
      </div>

      {!isOwner && (
        <div className="subtle" style={{ marginTop: 6 }}>
          {t("nameOnlyOwner")}
        </div>
      )}

      <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
        <div style={{ minWidth: 280 }}>
          <div>
            <strong>{t("owner")}:</strong>{" "}
            {safeList.members.find((m) => m.id === safeList.ownerId)?.name || "—"}
          </div>
          <div>
            <strong>{t("currentUser")}:</strong>{" "}
            {currentUser ? currentUser.name : t("visitor")}
          </div>
          {isVisitor && (
            <div className="subtle" style={{ marginTop: 6 }}>
              {t("visitorHint")}
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <strong>{t("itemsTotal")}:</strong> {totalItems}
            {" · "}
            <strong>{t("itemsOpen")}:</strong> {openItems}
          </div>
        </div>

        <div style={{ width: 320, maxWidth: "100%" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{t("openVsDone")}</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                <Cell fill="var(--open)" />
                <Cell fill="var(--done)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <hr className="divider" />

      <section>
        <h3 style={{ marginTop: 0 }}>{t("members")}</h3>

        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          {safeList.members.map((member) => (
            <li
              key={member.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 6
              }}
            >
              <span>
                {member.name}
                {member.id === safeList.ownerId ? ` (${t("owner")})` : ""}
                {member.id === currentUserId ? ` (${t("you")})` : ""}
              </span>

              {isOwner && member.id !== safeList.ownerId && (
                <button className="btn" onClick={() => handleRemoveMember(member.id)}>
                  {t("remove")}
                </button>
              )}
            </li>
          ))}
        </ul>

        {isOwner && (
          <div className="row" style={{ marginTop: 10 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder={t("addMemberPlaceholder")}
            />
            <button className="btn btn--primary" onClick={handleAddMember}>
              {t("addMember")}
            </button>
          </div>
        )}

        {currentUser && !isOwner && (
          <button
            className="btn btn--danger"
            onClick={handleLeaveList}
            style={{ marginTop: 10 }}
          >
            {t("leaveList")}
          </button>
        )}
      </section>

      <hr className="divider" />

      <section>
        <h3 style={{ marginTop: 0 }}>{t("items")}</h3>

        <div className="row" style={{ marginBottom: 10 }}>
          <label className="field">
            <span className="field__label">{t("show")}</span>
            <select
              className="input"
              value={itemFilter}
              onChange={(e) => setItemFilter(e.target.value)}
            >
              <option value="open">{t("showOpenOnly")}</option>
              <option value="all">{t("showAll")}</option>
            </select>
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <p>{t("noItems")}</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {filteredItems.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)"
                }}
              >
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
                      color: item.done ? "var(--muted)" : "inherit"
                    }}
                  >
                    {item.name}
                  </span>
                </label>

                <button
                  className="btn btn--danger"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isVisitor}
                >
                  {t("delete")}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="row" style={{ marginTop: 12 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={isVisitor ? t("addItemDisabledPlaceholder") : t("addItemPlaceholder")}
            disabled={isVisitor}
          />
          <button
            className="btn btn--primary"
            onClick={handleAddItem}
            disabled={isVisitor}
          >
            {t("addItem")}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ShoppingListDetailRoute;
