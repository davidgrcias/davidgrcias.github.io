// This code is designed for React 19+ and Tailwind CSS v4+
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import "./config/firebase"; // Initialize Firebase

// Layouts & Pages
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/admin/Login";
import Projects from "./pages/admin/Projects";
import ProjectForm from "./pages/admin/ProjectForm";
import Desktop from "./components/os/Desktop";

// Import old components only if needed for migration reference
// import PortfolioContent from "./components/PortfolioContent";

export default function App() {
  return (
    <TranslationProvider>
      <MusicPlayerProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Route: The WebOS Portfolio Experience */}
          <Route path="/" element={<Desktop />} />

          {/* Admin Routes: The Content Management System */}
          <Route path="/admin" element={<AdminLayout />}>
             {/* Default Admin Page -> Projects */}
             <Route index element={<Navigate to="projects" replace />} />
             <Route path="projects" element={<Projects />} />
             <Route path="projects/new" element={<ProjectForm />} />
             <Route path="projects/edit/:id" element={<ProjectForm />} />
             
             <Route path="experience" element={<div className="text-xl">Experience Management Module</div>} />
             <Route path="settings" element={<div className="text-xl">Settings Module</div>} />
          </Route>

          {/* Admin Auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MusicPlayerProvider>
    </TranslationProvider>
  );
}
