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
import OrgLoginPage from "./pages/Auth/OrgLoginPage";
import OrgRegisterPage from "./pages/Auth/OrgRegisterPage";
import WelcomePage from "./pages/WelcomePage";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, allowRole }) {
  const { user } = useAuth();
  const isAuthenticated = !!(user?.access && user?.refresh);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowRole && user?.role !== allowRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "welcome", element: <WelcomePage /> },
      { path: "organization/:orgId", element: <OrganizationPage /> },
      { path: "event/:eventId", element: <EventPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "search", element: <SearchPage /> },
      {
        path: "admin/post",
        element: (
          <ProtectedRoute allowRole="org">
            <AdminPostPage />
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <Navigate to="/" /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/org/login", element: <OrgLoginPage /> },
  { path: "/org/register", element: <OrgRegisterPage /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
