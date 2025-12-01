import React from "react";

export default function ProfilePage() {
  const user = {
    name: "Богдан Заозёров",
    email: "bazaozerov@edu.hse.ru",
    trackedOrgs: [
      "Турклуб",
      "СтудАктив",
      "ССК",
      "СтрайкболКлуб",
      "SNOWMOVE",
      "hse crew",
      "invest club",
      "HSE URSUS",
    ],
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Профиль пользователя</h1>

      <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm">
        <p>
          <span className="font-semibold">Имя:</span> {user.name}
        </p>
        <p>
          <span className="font-semibold">Почта:</span> {user.email}
        </p>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Отслеживаемые организации:</h2>
        <ul className="list-disc list-inside text-slate-700">
          {user.trackedOrgs.map((org, i) => (
            <li key={i}>{org}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
