import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Diary from "./pages/Diary";

// ✅ ProtectedRoute: only accessible if token exists
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// ✅ PublicRoute: only accessible if token does NOT exist
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/journal" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Welcome page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Welcome />
            </PublicRoute>
          }
        />

        {/* Login page */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Journal page */}
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Diary />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
