// Route map. Routes are added as their backend routes come online (build order: CLAUDE.md §6).
// Role-protected routes wrap in a guard from hooks/useAuth (Sprint 1).
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DevPanel from './pages/DevPanel.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dev" element={<DevPanel />} />{/* backend test harness */}
      {/* Sprint 1: /login, /role, /seller/onboarding, /seller, /shop/:id, /admin */}
      {/* Sprint 2: /catalog, /product/:id, /cart */}
      {/* Sprint 3: /checkout, /pay, /orders */}
      {/* Sprint 4: /custom/* */}
      {/* Sprint 5: /admin/ip, /admin/analytics, /admin/shops */}
      {/* Sprint 6: /legal/* */}
    </Routes>
  );
}
