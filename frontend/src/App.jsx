import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import OrganizationPage from "./pages/OrganizationPage";
import EventPage from "./pages/EventPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import AdminPostPage from "./pages/AdminPostPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "organization/:orgId", element: <OrganizationPage /> },
      { path: "event/:eventId", element: <EventPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "search", element: <SearchPage /> },
      { path: "admin/post", element: <AdminPostPage /> },
      { path: "*", element: <Navigate to="/" /> },
    ],
  },
  // страницы без Layout
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
