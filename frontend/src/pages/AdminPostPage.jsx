import React, { useState } from "react";

export default function AdminPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Пост создан: ${title}\n\n${content}`);
    setTitle("");
    setContent("");
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Создание поста организации</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок поста"
          className="w-full px-3 py-2 border rounded-md"
          required
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Текст поста..."
          className="w-full h-32 px-3 py-2 border rounded-md"
          required
        ></textarea>

        <button
          type="submit"
          className="px-4 py-2 text-white transition bg-green-600 rounded-md hover:bg-green-700"
        >
          Опубликовать
        </button>
      </form>
    </section>
  );
}
