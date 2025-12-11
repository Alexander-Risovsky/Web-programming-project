import React, { useState } from "react";

export default function AdminPostPage() {
  const [type, setType] = useState("info"); // info | event
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions((prev) => [...prev, { id: Date.now(), text: newQuestion.trim() }]);
    setNewQuestion("");
  };

  const handleRemoveQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      type,
      title,
      content,
      image: imageFile?.name || "",
      questions: type === "event" ? questions : [],
    };
    alert(
      `Создан пост (${type === "event" ? "мероприятие" : "информационный"}):\n\n${title}\n\n${content}\n\nКартинка: ${
        payload.image || "не выбрана"
      }\n\nВопросов: ${payload.questions.length}`
    );
    setTitle("");
    setContent("");
    setQuestions([]);
    setNewQuestion("");
    setType("info");
    setImageFile(null);
  }

  return (
    <section className="max-w-3xl mx-auto space-y-4 animate-slide-up">
      <div className="p-6 glass-card lg:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-primary">Панель организации</p>
            <h1 className="text-2xl font-bold lg:text-3xl text-slate-900">Создание поста</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-100/70 border border-slate-200 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType("info")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                type === "info"
                  ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Информационный
            </button>
            <button
              type="button"
              onClick={() => setType("event")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                type === "event"
                  ? "bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Мероприятие
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Новая встреча клуба"
              className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Описание</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Добавьте подробности поста или мероприятия..."
              className="w-full px-4 py-3 transition-all duration-300 bg-white border-2 shadow-sm resize-none h-36 rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Картинка поста</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 transition-all duration-300 bg-white border-2 shadow-sm rounded-xl border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:shadow-md file:mr-3 file:px-3 file:py-2 file:border-0 file:rounded-lg file:bg-primary/10 file:text-primary file:cursor-pointer"
            />
            {imageFile && (
              <p className="text-xs text-slate-500">Выбрано: {imageFile.name}</p>
            )}
          </div>

          {type === "event" && (
            <div className="space-y-3 border rounded-xl border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Форма регистрации</p>
                  <p className="text-xs text-slate-500">
                    Добавьте вопросы, которые увидит пользователь при регистрации
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Например: Ваш курс?"
                    className="px-3 py-2 text-sm border-2 rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-primary via-purple-600 to-indigo-600 shadow-md hover:shadow-lg transition-all"
                  >
                    Добавить
                  </button>
                </div>
              </div>
              {questions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Пока нет вопросов. Добавьте первый вопрос для регистрации.
                </p>
              ) : (
                <div className="space-y-2">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between px-3 py-2 bg-white border rounded-lg border-slate-200"
                    >
                      <span className="text-sm text-slate-800">{q.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01]"
            >
              Опубликовать
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
