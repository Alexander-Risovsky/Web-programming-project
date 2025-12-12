import React from "react";
import { organizations as orgData } from "../data/mockOrgsAndPosts";
import { useAuth } from "../context/AuthContext";

const events = [
  {
    id: 1,
    title: "Тренировочный матч ЛФК-турнира",
    org: "Strike Club",
    date: "30 октября 2025",
    time: "18:00",
    img: "/OrganizationLogo/StrikeClubMeeting.jpg",
  },
  {
    id: 2,
    title: "HSE Face",
    org: "HSE Crew",
    date: "28 декабря 2026",
    time: "18:30",
    img: "/OrganizationLogo/hseface logo.jpg",
  },
];

export default function RightSidebar() {
  const { user } = useAuth();
  const isOrg = user?.role === "org";
  const recommendations = orgData.slice(0, 4);

  return (
    <aside className="h-full space-y-5">
      <div className="p-4 glass-card">
        <h3 className="mb-3 font-semibold text-slate-800">
          {isOrg ? "Ближайшие мероприятия организации" : "Ближайшие мероприятия"}
        </h3>
        <div className="flex flex-col gap-3">
          {events.map((event, idx) => (
            <div
              key={event.id}
              className="overflow-hidden border shadow-sm bg-white/90 rounded-xl border-slate-200 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <img src={event.img} alt={event.title} className="object-cover w-full h-28" />
              <div className="p-3">
                <h4 className="text-sm font-semibold text-slate-800">{event.title}</h4>
                <p className="text-xs text-slate-500">{event.org}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {event.date}, {event.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 glass-card">
        <h3 className="mb-3 font-semibold text-slate-800">Другие организации</h3>
        <div className="flex flex-col gap-2">
          {recommendations.map((org, idx) => (
            <div
              key={org.id}
              className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 70}ms` }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={org.avatar_url || "/OrganizationLogo/DefaultLogo.jpg"}
                  alt={org.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/OrganizationLogo/DefaultLogo.jpg";
                  }}
                  className="object-cover rounded-full w-9 h-9"
                />
                <span className="text-sm font-medium text-slate-800">{org.name}</span>
              </div>
              <button className="flex items-center justify-center w-8 h-8 transition-all duration-300 border shadow-sm rounded-xl border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
