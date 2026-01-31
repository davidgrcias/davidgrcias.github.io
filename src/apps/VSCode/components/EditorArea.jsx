import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronRight, FileCode, FileJson, FileType } from 'lucide-react';

// Get file icon based on extension
const getFileIcon = (name) => {
  if (name?.endsWith('.js') || name?.endsWith('.jsx')) return <FileCode size={14} className="text-yellow-400" />;
  if (name?.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
  if (name?.endsWith('.md')) return <FileType size={14} className="text-blue-400" />;
  return <FileType size={14} className="text-gray-400" />;
};

// Breadcrumb component
const Breadcrumbs = ({ activeFile }) => {
  const fileName = activeFile?.name || 'untitled';
  const folder = activeFile?.type === 'md' || fileName.endsWith('.md') ? 'projects' : 'src';

  return (
    <div className="h-6 bg-[#1e1e1e] border-b border-[#333] flex items-center px-3 text-xs text-[#858585] select-none">
      <span className="hover:text-white cursor-pointer">portfolio</span>
      <ChevronRight size={12} className="mx-1" />
      <span className="hover:text-white cursor-pointer">{folder}</span>
      <ChevronRight size={12} className="mx-1" />
      <span className="flex items-center gap-1 text-white">
        {getFileIcon(fileName)}
        {fileName}
      </span>
    </div>
  );
};

// Minimap component - simplified visual representation
const Minimap = ({ lines = 20 }) => {
  // Generate fake minimap lines
  const minimapLines = Array.from({ length: lines }, (_, i) => ({
    width: 20 + Math.random() * 60, // Random line width
    indent: Math.random() > 0.7 ? 8 : 0 // Some indentation
  }));

  return (
    <div className="w-16 bg-[#1e1e1e] border-l border-[#333] flex flex-col py-2 px-1 select-none shrink-0">
      {/* Viewport indicator */}
      <div className="absolute right-1 top-8 w-14 h-8 bg-[#264f78]/30 rounded-sm pointer-events-none" />

      {/* Mini lines */}
      {minimapLines.map((line, i) => (
        <div
          key={i}
          className="h-[3px] mb-[2px] rounded-full opacity-50"
          style={{
            width: `${line.width}%`,
            marginLeft: line.indent,
            backgroundColor: i % 5 === 0 ? '#569cd6' : i % 3 === 0 ? '#ce9178' : '#d4d4d4'
          }}
        />
      ))}
    </div>
  );
};

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

  // Determine file language from type or extension
  const getLanguage = () => {
    const name = activeFile?.name || '';
    if (name.endsWith('.js') || name.endsWith('.jsx') || activeFile?.type === 'js') return 'javascript';
    if (name.endsWith('.json') || activeFile?.type === 'json') return 'json';
    if (name.endsWith('.xml') || activeFile?.type === 'xml') return 'xml';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript';
    if (name.endsWith('.css')) return 'css';
    if (name.endsWith('.html')) return 'html';
    return 'javascript';
  };

  // Content Generators
  const getFileContent = () => {
    if (activeFile.type === 'md' || activeFile.name?.endsWith('.md')) {
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

    // If file has content from Firestore, use it
    if (activeFile.content) {
      return (
        <SyntaxHighlighter
          language={getLanguage()}
          style={vscDarkPlus}
          showLineNumbers={true}
          lineNumberStyle={{
            color: '#858585',
            paddingRight: '1em',
            minWidth: '3em',
            textAlign: 'right',
            userSelect: 'none'
          }}
          customStyle={{
            margin: 0,
            padding: '16px 0',
            fontSize: '14px',
            background: 'transparent',
            fontFamily: "'Consolas', 'Monaco', monospace"
          }}
        >
          {activeFile.content.trim()}
        </SyntaxHighlighter>
      );
    }

    return <div className="p-8 text-gray-400">// content not found</div>;
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] flex flex-col">
      {/* Breadcrumbs */}
      <Breadcrumbs activeFile={activeFile} />

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {getFileContent()}
      </div>
    </div>
  );
};

export default EditorArea;
