import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export default function LeftSidebar({ currentPath }) {
  const followedOrganizations = [
    { id: 1, name: "Турклуб", logo: "../public/OrganizationLogo/TK logo.jpg" },
    {
      id: 2,
      name: "СтудАктив",
      logo: "../public/OrganizationLogo/studAct Logo.jpg",
    },
    { id: 3, name: "ССК", logo: "../public/OrganizationLogo/SSK Logo.jpg" },
    {
      id: 4,
      name: "СтрайкболКлуб",
      logo: "../public/OrganizationLogo/StrikeClubMeeting.jpg",
    },
    {
      id: 5,
      name: "SNOW MOVE",
      logo: "../public/OrganizationLogo/snowmove.jpg",
    },
    {
      id: 6,
      name: "hse crew",
      logo: "../public/OrganizationLogo/hsecrew.jpg",
    },
    {
      id: 7,
      name: "HSE INVEST CLUB PERM",
      logo: "../public/OrganizationLogo/investclub.jpg",
    },
    {
      id: 8,
      name: "HSE URSUS",
      logo: "../public/OrganizationLogo/ursus logo.jpg",
    },
  ];
  const userData = {
    name: "Богдан",
    surname: "Заозёров",
    email: "bazaozerov@edu.hse.ru",
    phone: "+7 (904) 847-05-84",
    studyGroup: "РИС-23-1",
    role: "Студент",
  };

  const location = useLocation();

  const isOrgPage = currentPath.startsWith("/organization");

  const isActive = location.pathname === `/`;

  return (
    <aside className="flex flex-col justify-between w-64 p-4 border-r bg-slate-50 border-slate-200">
      <div>
        {/* Лого */}
        <Link to="/">
          <div className="flex items-center pb-4 mb-6 space-x-3 border-b">
            <img src="../public/Logo.svg" alt="Логотип" className="w-8 h-8" />
            <div className="text-xl italic font-black text-slate-800 font-jakarta">
              HSE Flow
            </div>
          </div>
        </Link>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            className={`flex items-center mt-2 justify-between   rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-all duration-300 ${
              isActive
                ? "bg-secondary border border-primaryHover"
                : "bg-white border border-slate-200"
            }`}
          >
            <div className="flex items-center">
              <img
                src="../public/HomeIcon.svg"
                alt="Иконка Главной страницы"
                className="object-cover mr-3 w-7 h-7"
              />
              <span className="font-medium">Главная</span>
            </div>
          </NavLink>
          {/* <NavLink to="/search" className="hover:text-blue-600 font-jakarta">
            Поиск
          </NavLink>
          <NavLink to="/profile" className="hover:text-blue-600">
            Профиль
          </NavLink> */}
        </nav>

        <div className="mt-3">
          <h3 className="mb-3 font-semibold">Список организаций</h3>
          <ul className="space-y-1 text-600 ">
            {followedOrganizations.map((org) => {
              const isActive = location.pathname === `/organization/${org.id}`;
              console.log(isActive);

              return (
                <li key={org.id}>
                  <NavLink
                    to={`/organization/${org.id}`}
                    // className={`text-md items-center font-medium px-2 py-2 rounded-full block mt-2 ${
                    //   isActive ? "bg-secondary" : "bg-slate-100"
                    // }`}
                    className={`flex items-center mt-2 justify-between font-medium rounded-full px-2 py-2 shadow-sm hover:shadow-md transition-all duration-300 ${
                      isActive
                        ? "bg-secondary border border-primaryHover"
                        : "bg-white border border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-start">
                      <img
                        src={
                          org.logo ||
                          "../public/OrganizationLogo/DefaultLogo.jpg"
                        }
                        alt="Логотип организации"
                        // onError={(e) => {
                        //   e.target.onerror = null;
                        //   e.target.src = "OrganizationLogo/DefaultLogo.jpg";
                        // }}
                        className="object-cover mr-3 rounded-full w-7 h-7"
                      />
                      {org.name}
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-6 border-t">
        <div className="flex items-center">
          {/* Фото профиля */}
          <NavLink to="/profile" className="">
            <img
              src="../public/ProfilePhoto.jpg"
              alt="Фото профиля"
              className="object-cover w-10 h-10 mr-3 rounded-full"
            />
          </NavLink>

          {/* Имя, фамилия, группа студента */}
          <div className="flex flex-col ">
            <span className="text-sm font-medium">
              {userData.name} {userData.surname}
            </span>
            <span className="text-sm text-slate-700">{userData.role}</span>
          </div>
        </div>

        {/* Выход из аккаунта */}
        <NavLink to="/login" className="">
          <img
            src="../public/LogoutIcon.svg"
            alt="Выход из аккаунта"
            className="object-cover w-10 h-10"
          />
        </NavLink>
      </div>
    </aside>
  );
}
