// This code is designed for React 19+ and Tailwind CSS v4+
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TranslationProvider } from "./contexts/TranslationContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { SoundProvider } from "./contexts/SoundContext";
import "./config/firebase"; // Initialize Firebase

// Layouts & Pages
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Projects from "./pages/admin/Projects";
import ProjectForm from "./pages/admin/ProjectForm";
import Experiences from "./pages/admin/Experiences";
import ExperienceForm from "./pages/admin/ExperienceForm";
import Education from "./pages/admin/Education";
import EducationForm from "./pages/admin/EducationForm";
import Certifications from "./pages/admin/Certifications";
import CertificationForm from "./pages/admin/CertificationForm";
import Skills from "./pages/admin/Skills";
import Profile from "./pages/admin/Profile";
import Content from "./pages/admin/Content";
import Blog from "./pages/admin/Blog";
import VSCodeFiles from "./pages/admin/VSCodeFiles";
import FileManagerAdmin from "./pages/admin/FileManagerAdmin";
import Knowledge from "./pages/admin/Knowledge";
import ChatAnalytics from "./pages/admin/ChatAnalytics";
import Desktop from "./components/os/Desktop";

// Initialize settings from localStorage immediately on load
(() => {
  try {
    const saved = localStorage.getItem('webos-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      // Apply reducedMotion immediately before React renders
      if (settings?.reducedMotion) {
        document.documentElement.classList.add('reduce-motion');
      }
      // Apply performanceMode immediately  
      if (settings?.performanceMode) {
        document.documentElement.classList.add('performance-mode');
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }
})();

export default function App() {
  return (
    <TranslationProvider>
      <SoundProvider>
        <MusicPlayerProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Route: The WebOS Portfolio Experience */}
              <Route path="/" element={<Desktop />} />

              {/* Admin Routes: The Content Management System */}
              <Route path="/admin" element={<AdminLayout />}>
                {/* Dashboard */}
                <Route index element={<Dashboard />} />
                
                {/* Projects CRUD */}
                <Route path="projects" element={<Projects />} />
                <Route path="projects/new" element={<ProjectForm />} />
                <Route path="projects/:id" element={<ProjectForm />} />

                {/* Blog Posts CRUD */}
                <Route path="blog" element={<Blog />} />

                {/* Experiences CRUD */}
                <Route path="experiences" element={<Experiences />} />
                <Route path="experiences/new" element={<ExperienceForm />} />
                <Route path="experiences/:id" element={<ExperienceForm />} />

                {/* Education CRUD */}
                <Route path="education" element={<Education />} />
                <Route path="education/new" element={<EducationForm />} />
                <Route path="education/:id" element={<EducationForm />} />

                {/* Certifications CRUD */}
                <Route path="certifications" element={<Certifications />} />
                <Route path="certifications/new" element={<CertificationForm />} />
                <Route path="certifications/:id" element={<CertificationForm />} />

                {/* Skills & Profile (singleton editors) */}
                <Route path="skills" element={<Skills />} />
                <Route path="profile" element={<Profile />} />

                {/* Content (funFacts + insights) */}
                <Route path="content" element={<Content />} />

                {/* VS Code Files & File Manager Structure */}
                <Route path="vscode" element={<VSCodeFiles />} />
                <Route path="files" element={<FileManagerAdmin />} />

                {/* AI Knowledge Base & Analytics */}
                <Route path="knowledge" element={<Knowledge />} />
                <Route path="chat-analytics" element={<ChatAnalytics />} />
              </Route>

              {/* Admin Auth */}
              <Route path="/admin/login" element={<Login />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </MusicPlayerProvider>
      </SoundProvider>
    </TranslationProvider>
  );
}
