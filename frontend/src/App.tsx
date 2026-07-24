import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import LibraryPage from "./pages/LibraryPage.tsx";
import FlashcardsPage from "./pages/FlashcardsPage.tsx";
import TutorPage from "./pages/TutorPage.tsx";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/tutor" element={<TutorPage />} />
      </Route>
    </Routes>
  );
}

export default App;