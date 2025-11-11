import React from "react";
import { useParams } from "react-router-dom";
import { organizations, posts } from "../data/mockOrgsAndPosts";

export default function OrganizationPage() {
  const { orgId } = useParams();
  const org = organizations.find((o) => o.id === Number(orgId));
  const orgPosts = posts.filter((p) => p.orgId === Number(orgId));

  if (!org) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-bold">Организация не найдена</h1>
        <p className="text-slate-600">
          Возможно, вы перешли по неверной ссылке.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">{org.name}</h1>

      {orgPosts.length > 0 ? (
        <div className="space-y-4">
          {orgPosts.map((post) => (
            <article
              key={post.id}
              className="p-4 transition-shadow bg-white border shadow-sm border-slate-200 rounded-xl hover:shadow-md"
            >
              <h2 className="mb-2 text-lg font-semibold">{post.title}</h2>
              <p className="mb-2 text-slate-700">{post.content}</p>
              {post.image && (
                <img
                  src={post.image}
                  alt="Изображение поста"
                  className="object-cover w-full h-full mb-2 rounded-lg"
                />
              )}
              <p className="text-sm text-slate-500">
                Опубликовано: {new Date(post.date).toLocaleDateString("ru-RU")}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-slate-50">
          <h2 className="font-semibold">Недавние посты</h2>
          <p className="mt-2 text-sm text-slate-600">
            Пока здесь пусто... Организация ещё не опубликовала новости.
          </p>
        </div>
      )}
    </section>
  );
  // return (
  //   <section>
  //     <h1 className="mb-4 text-2xl font-bold">Страница организации №{orgId}</h1>

  //     <p className="mb-4 text-slate-700">
  //       Здесь будет отображаться информация об организации, её посты и
  //       предстоящие мероприятия.
  //     </p>

  //     <div className="p-4 border rounded-lg bg-slate-50">
  //       <h2 className="font-semibold">Недавние посты</h2>
  //       <p className="mt-2 text-sm text-slate-600">
  //         Пока здесь пусто... Организация ещё не опубликовала новости.
  //       </p>
  //     </div>
  //   </section>
  // );
}
