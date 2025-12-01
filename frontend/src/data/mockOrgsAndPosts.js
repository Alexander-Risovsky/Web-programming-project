// src/data/mockData.js
export const organizations = [
  { id: 1, name: "Турклуб" },
  { id: 2, name: "СтудАктив" },
  { id: 3, name: "ССК" },
  { id: 4, name: "СтрайкболКлуб" },
  { id: 5, name: "SNOW MOVE" },
  { id: 6, name: "hse crew" },
  { id: 7, name: "HSE INVEST CLUB PERM" },
  { id: 8, name: "HSE URSUS" },
];

export const posts = [
  {
    id: 1,
    orgId: 1,
    title: "Новый поход в горы!",
    content:
      "Друзья, приглашаем всех желающих на треккинг по Уралу в эти выходные!",
    date: "2025-11-10",
    image: "/OrganizationLogo/TK logo.jpg",
  },
  {
    id: 2,
    orgId: 1,
    title: "Собрание турклуба",
    content: "Обсудим планы на зимний сезон, новые маршруты и оборудование.",
    date: "2025-10-30",
  },
  {
    id: 3,
    orgId: 2,
    title: "Собрание студактива",
    content: "Присоединяйтесь к нашей команде для организации мероприятий!",
    date: "2025-11-05",
    image: "/OrganizationLogo/studAct Logo.jpg",
  },
  {
    id: 4,
    orgId: 3,
    title: "Спортивные выходные!",
    content:
      "ССК приглашает всех студентов принять участие в футбольном турнире!",
    date: "2025-11-02",
  },
  {
    id: 5,
    orgId: 5,
    title: "SNOW MOVE открыл сезон!",
    content:
      "Катание, музыка, эмоции — всё это ждало участников нашего открытия сезона.",
    date: "2025-11-01",
    image: "/OrganizationLogo/snowmove.jpg",
  },
];
