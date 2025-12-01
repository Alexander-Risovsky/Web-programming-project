import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Ближайшие мероприятия</h1>

      <div className="space-y-3">
        <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Мастер-класс по Frontend</h2>
          <p className="text-sm text-slate-600">
            12 октября, 14:00 — организатор: IT-клуб
          </p>
          <Link
            to="/event/1"
            className="inline-block mt-2 text-blue-600 hover:underline"
          >
            Подробнее
          </Link>
        </div>

        <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition">
          <h2 className="font-semibold text-lg">Хакатон “AI в действии”</h2>
          <p className="text-sm text-slate-600">
            20 октября, 10:00 — организатор: Лаборатория данных
          </p>
          <Link
            to="/event/2"
            className="inline-block mt-2 text-blue-600 hover:underline"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </section>
  );
}
