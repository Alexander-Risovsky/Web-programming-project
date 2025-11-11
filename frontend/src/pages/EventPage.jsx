import React from "react";
import { useParams } from "react-router-dom";

export default function EventPage() {
  const { eventId } = useParams();

  return (
    <section>
      <h1 className="text-2xl font-bold mb-3">Мероприятие №{eventId}</h1>
      <p className="text-slate-700 mb-4">
        Здесь появится подробное описание мероприятия, информация о регистрации,
        месте проведения и организаторе.
      </p>

      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Зарегистрироваться
      </button>
    </section>
  );
}
