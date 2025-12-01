import React, { useState } from "react";

export default function RightSidebar({ currentPath }) {
  // Состояние для подписок
  const [followed, setFollowed] = useState([]);
  const [organizations, setOrganizations] = useState([
    { id: 1, name: "Большой ЭД", logo: "/OrganizationLogo/big ed logo.jpg" },
    { id: 2, name: "ARTЭрия", logo: "/OrganizationLogo/arteria logo.jpg" },
    { id: 3, name: "Автоклуб", logo: "/OrganizationLogo/autoclub logo.jpg" },
    {
      id: 4,
      name: "Клуб Интеллектуальных Игр",
      logo: "/OrganizationLogo/intelect igri logo.jpg",
    },
  ]);

  const events = [
    {
      id: 1,
      title: "Выезд постреляться)",
      org: "СтрайкболКлуб",
      date: "30 сентября, 2025",
      time: "18:00",
      img: "../public/OrganizationLogo/StrikeClubMeeting.jpg",
    },
    {
      id: 2,
      title: "HSE FACE",
      org: "СтудАктив",
      date: "28 апреля 2026",
      time: "18:30",
      img: "../public/OrganizationLogo/hseface logo.jpg",
    },
  ];

  // const handleFollow = (org) => {
  //   // setFollowed([...followed, org]);
  //   // setOrganizations(organizations.filter((o) => o.id !== org.id));
  // };

  return (
    <aside className="w-72 bg-slate-50 border-l border-slate-200 p-5 pt-3 flex flex-col gap-6">
      {/* Верхний блок с иконками Уведосления и Настройки */}
      <div className="flex justify-end gap-3 border-b pb-3">
        <button className="w-10 h-10 rounded-full hover:bg-slate-200 transition-colors duration-300">
          <img src="../public/NotificationIcon.svg" alt="Уведомления" />
        </button>
        <button className="w-10 h-10 rounded-full hover:bg-slate-200 transition-colors duration-300">
          <img src="../public/SettingsIcon.svg" alt="Настройки" />
        </button>
      </div>

      {/* Ближайшие мероприятия */}
      <div>
        <h3 className="font-semibold mb-3">Ближайшие мероприятия</h3>
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <img
                src={event.img}
                alt={event.title}
                className="w-full h-28 object-cover"
              />
              <div className="p-3">
                <h4 className="font-semibold text-slate-800 text-sm">
                  {event.title}
                </h4>
                <p className="text-xs text-slate-500">{event.org}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {event.date}, {event.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Возможно интересно */}
      <div>
        <h3 className="font-semibold mb-3">Возможно интересно</h3>
        <div className="flex flex-col gap-2">
          {organizations.length > 0 ? (
            organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-full px-2 py-2 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-2 justify-between w-full">
                  <div className="flex items-center justify-start gap-2">
                    <img
                      src={org.logo}
                      alt={org.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/OrganizationLogo/DefaultLogo.jpg";
                      }}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span
                      className="text-sm font-medium text-slate-800 truncate max-w-[200px]"
                      title={org.name}
                    >
                      {org.name}
                    </span>
                  </div>

                  <button className="p-1.5 items-center rounded-full hover:bg-slate-100 transition-all duration-300">
                    <img
                      src="../public/FollowOrg.svg"
                      alt="Отслеживать организацию"
                    />
                  </button>
                </div>
                {/* <button
                  onClick={() => handleFollow(org)}
                  className="w-7 h-7 rounded-full bg-primary text-white font-bold hover:bg-primaryHover transition-all duration-300 flex items-center justify-center"
                >
                  +
                </button> */}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Вы подписаны на все организации!
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
