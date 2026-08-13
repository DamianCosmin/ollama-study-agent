import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import LibraryPage from "./pages/LibraryPage.tsx";
import FlashcardsPage from "./pages/FlashcardsPage.tsx";
import FlashcardsSessionPage from "./pages/FlashcardsSessionPage.tsx";
import TutorPage from "./pages/TutorPage.tsx";
import { StatusProvider } from "./context/StatusContext.tsx";

function App() {
  return (
    <StatusProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/tutor" element={<TutorPage />} />
        </Route>

        <Route path="/flashcards/session" element={<FlashcardsSessionPage />} />
      </Routes>
    </StatusProvider>
  );
}

export default App;