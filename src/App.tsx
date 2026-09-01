import { useState } from "react";
import AuthScreen from "./components/auth";
import StudentApp from "./components/student";
import AdminApp from "./components/admin";

type Session = "auth" | "student" | "admin";

export default function App() {
  const [session, setSession] = useState<Session>("auth");

  return (
    <div className="min-h-full bg-paper text-ink">
      {session === "auth" && <AuthScreen onEnter={(role) => setSession(role)} />}
      {session === "student" && <StudentApp onLogout={() => setSession("auth")} />}
      {session === "admin" && <AdminApp onLogout={() => setSession("auth")} />}
    </div>
  );
}
