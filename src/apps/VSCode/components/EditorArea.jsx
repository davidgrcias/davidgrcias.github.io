import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const EditorArea = ({ activeFile }) => {
  if (!activeFile) {
      return (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 bg-[#1e1e1e]">
              <div className="text-6xl mb-4 text-[#333]">DG</div>
              <p className="text-sm">Select a file to start viewing</p>
              <div className="mt-8 text-xs flex flex-col gap-2 max-w-xs text-left">
                  <div className="flex gap-2"><span className="text-gray-400">Show All Commands</span> <span className="ml-auto text-gray-600">Ctrl+Shift+P</span></div>
                  <div className="flex gap-2"><span className="text-gray-400">Go to File</span> <span className="ml-auto text-gray-600">Ctrl+P</span></div>
              </div>
          </div>
      );
  }

  // Content Generators
  const getFileContent = () => {
      if (activeFile.type === 'md' || activeFile.name.endsWith('.md')) {
          // It's a project
          const { title, description, tech, image, github, demo, readme } = activeFile.data || {};
          const markdown = `
# ${title}

![Project Image](${image || 'https://via.placeholder.com/800x400'})

${description}

### Tech Stack
${Array.isArray(tech) ? tech.map(t => `- ${t}`).join('\n') : tech}

### Links
${github ? `- [GitHub Repo](${github})` : ''}
${demo ? `- [Live Demo](${demo})` : ''}

---

${readme || '### Case Study \n\nNo detailed case study available yet.'}
          `;
          return (
              <div className="prose prose-invert prose-blue max-w-none p-8">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
          );
      }

      if (activeFile.id === 'about') {
          const code = `
const DavidGarcia = {
  role: "Creative Developer",
  location: "Jakarta, Indonesia",
  skills: [
    "React", "Next.js", "Three.js", "Firebase",
    "Node.js", "TailwindCSS", "UI/UX Design"
  ],
  passion: "Bridging the gap between design and engineering.",
  contact: {
    email: "david@example.com",
    github: "@davidgrcias"
  },
  
  sayHi: function() {
    console.log("Let's build something awesome together!");
  }
};

DavidGarcia.sayHi();
          `;
          return (
              <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '20px', fontSize: '14px', background: 'transparent' }}>
                 {code.trim()}
              </SyntaxHighlighter>
          );
      }
      
      if (activeFile.id === 'contact') {
          const code = `
{
  "name": "David Garcia Saragih",
  "email": "david.garcia@umn.ac.id",
  "socials": {
     "linkedin": "linkedin.com/in/davidgarcia",
     "instagram": "@davidgrcias"
  },
  "availability": "Open for opportunities"
}
          `;
          return (
              <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, padding: '20px', fontSize: '14px', background: 'transparent' }}>
                 {code.trim()}
              </SyntaxHighlighter>
          );
      }

      return <div className="p-8 text-gray-400">// content not found</div>;
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-auto custom-scrollbar">
       {/* Breadcrumbs could go here */}
       {getFileContent()}
    </div>
  );
};

export default EditorArea;
