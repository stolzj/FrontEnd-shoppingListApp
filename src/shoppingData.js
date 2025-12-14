export const INITIAL_LISTS = [
  {
    id: 1,
    name: "Víkendový nákup",
    archived: false,
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
  {
    id: 2,
    name: "Dovolená hory",
    archived: false,
    ownerId: 2,
    members: [
      { id: 1, name: "Alena" },
      { id: 2, name: "Petr" }, // vlastník
    ],
    items: [
      { id: 1, name: "Pivo", done: false },
      { id: 2, name: "Špekáčky", done: false },
    ],
  },
  {
    id: 3,
    name: "Firemní párty",
    archived: true,
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
];
