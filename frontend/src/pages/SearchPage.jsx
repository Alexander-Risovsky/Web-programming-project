import React from "react";
import { useSearchParams } from "react-router-dom";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  function handleSearchChange(e) {
    const value = e.target.value;
    setSearchParams({ q: value });
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">
        Поиск мероприятий и организаций
      </h1>

      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Введите запрос..."
        className="border rounded-md px-3 py-2 w-full mb-4"
      />

      {query ? (
        <p className="text-slate-700">Результаты поиска для: {query}</p>
      ) : (
        <p className="text-slate-500">Введите поисковый запрос</p>
      )}
    </section>
  );
}
