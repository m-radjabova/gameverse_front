import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "aos/dist/aos.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateContextPro from "./hooks/CreateContextPro.tsx";


const queryClient = new QueryClient();

if (typeof window !== "undefined") {
  const legacyPrefixes = [
    "game-session:",
    "game-leaderboard:",
  ];
  const legacyExactKeys = new Set([
    "games.quiz_battle.questions.v1",
    "games.wheel_of_fortune.questions.v1",
  ]);

  for (const key of Object.keys(window.localStorage)) {
    if (
      legacyPrefixes.some((prefix) => key.startsWith(prefix)) ||
      legacyExactKeys.has(key)
    ) {
      window.localStorage.removeItem(key);
    }
  }
}

createRoot(document.getElementById("root")!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <CreateContextPro>
        <App />
          <ToastContainer hideProgressBar />
          </CreateContextPro>
      </BrowserRouter>
    </QueryClientProvider>
  </>
);
