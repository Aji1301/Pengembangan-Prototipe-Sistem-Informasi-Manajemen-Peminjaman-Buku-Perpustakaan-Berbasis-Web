import { useState, useEffect } from "react";
import LandingPage from "./components/landing";
import AuthScreen from "./components/auth";
import StudentApp from "./components/student";
import AdminApp from "./components/admin";
import { removeAuthToken } from "./lib/api";

type Session = "landing" | "auth" | "student" | "admin";

export default function App() {
  const [session, setSession] = useState<Session>("landing");
  const [authInitialMode, setAuthInitialMode] = useState<"student" | "staff">("student");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("kancil_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === "ADMIN") {
          setSession("admin");
        } else {
          setSession("student");
        }
      } catch {}
    }
  }, []);

  const handleGoAuth = (mode?: "student" | "staff") => {
    setAuthInitialMode(mode || "student");
    setSession("auth");
  };

  const handleEnter = (role: "student" | "admin", user: any) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("kancil_user", JSON.stringify(user));
    }
    setSession(role);
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem("kancil_user");
    setCurrentUser(null);
    setSession("landing");
  };

  return (
    <div className="min-h-screen w-full bg-paper text-ink flex flex-col">
      {session === "landing" && <LandingPage onGoAuth={handleGoAuth} />}
      {session === "auth" && (
        <AuthScreen
          initialMode={authInitialMode}
          onEnter={handleEnter}
          onBackLanding={() => setSession("landing")}
        />
      )}
      {session === "student" && <StudentApp user={currentUser} onLogout={handleLogout} />}
      {session === "admin" && <AdminApp user={currentUser} onLogout={handleLogout} />}
    </div>
  );
}
