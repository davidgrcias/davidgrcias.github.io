import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Code, Save, FileCode, FileJson, FileType, X, Eye, Wand2 } from 'lucide-react';
import { firestoreService } from '../../services/firestore';

// Default VS Code files
const defaultFiles = [
  {
    id: 'about',
    name: 'about_me.js',
    type: 'js',
    content: `// About David Garcia Saragih
const developer = {
  name: "David Garcia Saragih",
  title: "Full-Stack Web & Systems Engineer",
  location: "Jakarta, Indonesia",
  
  passion: [
    "Building innovative web experiences",
    "Creating scalable systems",
    "UI/UX Design"
  ],
  
  philosophy: \`
    I'm driven by curiosity and the excitement 
    of learning something new. What started as 
    a hobby has grown into a habit of building, 
    exploring, and bringing ideas to life.
  \`,
  
  currentFocus: "Building this OS-style portfolio"
};

export default developer;`
  },
  {
    id: 'contact',
    name: 'contact.json',
    type: 'json',
    content: `{
  "name": "David Garcia Saragih",
  "email": "davidgarciasaragih7@gmail.com",
  "location": "Jakarta, Indonesia",
  "socials": {
    "github": "https://github.com/davidgrcias",
    "linkedin": "https://linkedin.com/in/davidgrcias",
    "youtube": "https://youtube.com/@DavidGTech"
  }
}`
  },
  {
    id: 'skills',
    name: 'skills.xml',
    type: 'xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<skills>
  <category name="Frontend">
    <skill level="advanced">React.js</skill>
    <skill level="advanced">Next.js</skill>
    <skill level="advanced">Tailwind CSS</skill>
  </category>
  <category name="Backend">
    <skill level="advanced">Laravel</skill>
    <skill level="advanced">PHP</skill>
    <skill level="intermediate">Node.js</skill>
  </category>
</skills>`
  }
];

const fileTypeOptions = [
  { value: 'js', label: 'JavaScript (.js)', icon: '🟨' },
  { value: 'json', label: 'JSON (.json)', icon: '📋' },
  { value: 'xml', label: 'XML (.xml)', icon: '📄' },
  { value: 'md', label: 'Markdown (.md)', icon: '📝' },
  { value: 'txt', label: 'Text (.txt)', icon: '📃' },
  { value: 'ts', label: 'TypeScript (.ts)', icon: '🔷' },
  { value: 'css', label: 'CSS (.css)', icon: '🎨' },
  { value: 'html', label: 'HTML (.html)', icon: '🌐' },
];

const VSCodeFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getDocument('vscodeFiles', 'main');

      if (data && data.staticFiles && data.staticFiles.length > 0) {
        setFiles(data.staticFiles);
      } else {
        setFiles(defaultFiles);
      }
    } catch (error) {
      console.error("Error fetching VS Code files:", error);
      setFiles(defaultFiles);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    const newId = `file_${Date.now()}`;
    setEditingFile({
      id: newId,
      name: 'new_file.js',
      type: 'js',
      content: '// Your code here\n'
    });
    setIsEditing(true);
  };

  const handleEdit = (file) => {
    setEditingFile({ ...file });
    setIsEditing(true);
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const updatedFiles = files.filter(f => f.id !== fileId);
      await firestoreService.setDocument('vscodeFiles', 'main', {
        staticFiles: updatedFiles,
        updatedAt: new Date().toISOString()
      });
      setFiles(updatedFiles);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
    }
  };

  const handleSave = async () => {
    if (!editingFile.name.trim()) {
      alert('Please enter a file name');
      return;
    }

    setSaving(true);
    try {
      // Ensure file extension matches type
      let fileName = editingFile.name;
      const ext = `.${editingFile.type}`;
      if (!fileName.endsWith(ext)) {
        fileName = fileName.replace(/\.[^.]+$/, '') + ext;
      }

      const fileData = {
        ...editingFile,
        name: fileName
      };

      let updatedFiles;
      const existingIndex = files.findIndex(f => f.id === editingFile.id);
      
      if (existingIndex >= 0) {
        updatedFiles = [...files];
        updatedFiles[existingIndex] = fileData;
      } else {
        updatedFiles = [...files, fileData];
      }

      await firestoreService.setDocument('vscodeFiles', 'main', {
        staticFiles: updatedFiles,
        updatedAt: new Date().toISOString()
      });

      setFiles(updatedFiles);
      setIsEditing(false);
      setEditingFile(null);
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Failed to save file");
    } finally {
      setSaving(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'js': return <FileCode size={18} className="text-yellow-400" />;
      case 'json': return <FileJson size={18} className="text-yellow-500" />;
      case 'ts': return <FileCode size={18} className="text-blue-400" />;
      case 'md': return <FileType size={18} className="text-blue-300" />;
      case 'xml': return <FileType size={18} className="text-orange-400" />;
      default: return <FileType size={18} className="text-gray-400" />;
    }
  };

  // ============================================
  // AUTO-GENERATE FROM EXISTING DATA
  // ============================================
  const generateFromData = async () => {
    if (!confirm('This will generate files from your existing profile, skills, experiences, and education data. Continue?')) return;

    setGenerating(true);
    try {
      // Fetch all data
      const [profile, skills, experiences, education, certifications] = await Promise.all([
        firestoreService.getDocument('profile', 'main'),
        firestoreService.getDocument('skills', 'main'),
        firestoreService.getCollection('experiences', { orderByField: 'order' }),
        firestoreService.getCollection('education', { orderByField: 'order' }),
        firestoreService.getCollection('certifications', { orderByField: 'order' }),
      ]);

      const fileTypes = ['js', 'json', 'xml', 'md'];
      const getRandomType = () => fileTypes[Math.floor(Math.random() * fileTypes.length)];

      const generatedFiles = [];

      // 1. Generate ABOUT file
      if (profile) {
        const aboutType = getRandomType();
        generatedFiles.push({
          id: 'gen_about',
          name: `about_me.${aboutType}`,
          type: aboutType,
          content: generateAboutContent(profile, aboutType)
        });
      }

      // 2. Generate CONTACT file
      if (profile?.contact || profile?.socials) {
        const contactType = getRandomType();
        generatedFiles.push({
          id: 'gen_contact',
          name: `contact.${contactType}`,
          type: contactType,
          content: generateContactContent(profile, contactType)
        });
      }

      // 3. Generate SKILLS file
      if (skills) {
        const skillsType = getRandomType();
        generatedFiles.push({
          id: 'gen_skills',
          name: `skills.${skillsType}`,
          type: skillsType,
          content: generateSkillsContent(skills, skillsType)
        });
      }

      // 4. Generate EXPERIENCE file
      if (experiences && experiences.length > 0) {
        const expType = getRandomType();
        generatedFiles.push({
          id: 'gen_experience',
          name: `experience.${expType}`,
          type: expType,
          content: generateExperienceContent(experiences, expType)
        });
      }

      // 5. Generate EDUCATION file
      if (education && education.length > 0) {
        const eduType = getRandomType();
        generatedFiles.push({
          id: 'gen_education',
          name: `education.${eduType}`,
          type: eduType,
          content: generateEducationContent(education, eduType)
        });
      }

      // 6. Generate CERTIFICATIONS file
      if (certifications && certifications.length > 0) {
        const certType = getRandomType();
        generatedFiles.push({
          id: 'gen_certifications',
          name: `certifications.${certType}`,
          type: certType,
          content: generateCertificationsContent(certifications, certType)
        });
      }

      // Merge with existing manual files (keep files that don't start with 'gen_')
      const manualFiles = files.filter(f => !f.id.startsWith('gen_'));
      const updatedFiles = [...generatedFiles, ...manualFiles];

      await firestoreService.setDocument('vscodeFiles', 'main', {
        staticFiles: updatedFiles,
        updatedAt: new Date().toISOString()
      });

      setFiles(updatedFiles);
      alert(`✅ Generated ${generatedFiles.length} files from your data!`);
    } catch (error) {
      console.error('Error generating files:', error);
      alert('Failed to generate files');
    } finally {
      setGenerating(false);
    }
  };

  // Content generators for different file types
  const generateAboutContent = (profile, type) => {
    const { name, headline, aboutText, status, availableFor } = profile;
    
    switch (type) {
      case 'js':
        return `// ${name} - Portfolio
const developer = {
  name: "${name || 'Developer'}",
  headline: "${headline || ''}",
  status: "${status || 'open'}",
  availableFor: ${JSON.stringify(availableFor || [])},
  
  about: \`${aboutText || ''}\`,
  
  sayHello() {
    console.log("Thanks for visiting my portfolio!");
  }
};

export default developer;`;
      
      case 'json':
        return JSON.stringify({
          name: name || 'Developer',
          headline: headline || '',
          status: status || 'open',
          availableFor: availableFor || [],
          about: aboutText || ''
        }, null, 2);
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<developer>
  <name>${name || 'Developer'}</name>
  <headline>${headline || ''}</headline>
  <status>${status || 'open'}</status>
  <availableFor>
    ${(availableFor || []).map(a => `<item>${a}</item>`).join('\n    ')}
  </availableFor>
  <about><![CDATA[${aboutText || ''}]]></about>
</developer>`;
      
      case 'md':
      default:
        return `# ${name || 'Developer'}

> ${headline || ''}

## About Me

${aboutText || ''}

## Status
- **Availability:** ${status === 'open' ? '🟢 Open to opportunities' : '🔴 Not available'}
- **Looking for:** ${(availableFor || []).join(', ')}
`;
    }
  };

  const generateContactContent = (profile, type) => {
    const { contact, socials } = profile;
    
    switch (type) {
      case 'js':
        return `// Contact Information
const contact = {
  email: "${contact?.email || ''}",
  phone: "${contact?.phone || contact?.whatsapp || ''}",
  location: "${contact?.location || ''}",
  
  socials: {
    ${Object.entries(socials || {}).map(([key, val]) => 
      `${key}: "${val?.url || val || ''}"`
    ).join(',\n    ')}
  },
  
  getInTouch() {
    window.open(\`mailto:\${this.email}\`);
  }
};

module.exports = contact;`;
      
      case 'json':
        return JSON.stringify({
          email: contact?.email || '',
          phone: contact?.phone || contact?.whatsapp || '',
          location: contact?.location || '',
          socials: Object.fromEntries(
            Object.entries(socials || {}).map(([k, v]) => [k, v?.url || v || ''])
          )
        }, null, 2);
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<contact>
  <email>${contact?.email || ''}</email>
  <phone>${contact?.phone || contact?.whatsapp || ''}</phone>
  <location>${contact?.location || ''}</location>
  <socials>
    ${Object.entries(socials || {}).map(([key, val]) => 
      `<${key}>${val?.url || val || ''}</${key}>`
    ).join('\n    ')}
  </socials>
</contact>`;
      
      case 'md':
      default:
        return `# Contact Information

## Get in Touch

- 📧 **Email:** ${contact?.email || 'N/A'}
- 📱 **Phone:** ${contact?.phone || contact?.whatsapp || 'N/A'}
- 📍 **Location:** ${contact?.location || 'N/A'}

## Social Links

${Object.entries(socials || {}).map(([key, val]) => 
  `- **${key.charAt(0).toUpperCase() + key.slice(1)}:** ${val?.url || val || ''}`
).join('\n')}
`;
    }
  };

  const generateSkillsContent = (skills, type) => {
    const { technical, soft } = skills;
    
    switch (type) {
      case 'js':
        return `// Technical Skills & Expertise
const skills = {
  technical: [
    ${(technical || []).map(cat => `{
      category: "${cat.category}",
      skills: ${JSON.stringify(cat.skills)}
    }`).join(',\n    ')}
  ],
  
  soft: ${JSON.stringify(soft || [])},
  
  getByCategory(name) {
    return this.technical.find(t => t.category === name);
  }
};

export default skills;`;
      
      case 'json':
        return JSON.stringify({ technical, soft }, null, 2);
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<skills>
  ${(technical || []).map(cat => `<category name="${cat.category}">
    ${(cat.skills || []).map(s => `<skill>${s}</skill>`).join('\n    ')}
  </category>`).join('\n  ')}
  <softSkills>
    ${(soft || []).map(s => `<skill>${s}</skill>`).join('\n    ')}
  </softSkills>
</skills>`;
      
      case 'md':
      default:
        return `# Skills & Expertise

## Technical Skills

${(technical || []).map(cat => `### ${cat.category}
${(cat.skills || []).map(s => `- ${s}`).join('\n')}`).join('\n\n')}

## Soft Skills

${(soft || []).map(s => `- ${s}`).join('\n')}
`;
    }
  };

  const generateExperienceContent = (experiences, type) => {
    switch (type) {
      case 'js':
        return `// Work Experience
const experience = [
  ${experiences.map(exp => `{
    company: "${exp.company || ''}",
    role: "${exp.role || ''}",
    period: "${exp.period || ''}",
    description: "${(exp.description || '').replace(/"/g, '\\"').replace(/\n/g, '\\n')}",
    highlights: ${JSON.stringify(exp.highlights || [])}
  }`).join(',\n  ')}
];

export default experience;`;
      
      case 'json':
        return JSON.stringify(experiences.map(exp => ({
          company: exp.company,
          role: exp.role,
          period: exp.period,
          description: exp.description,
          highlights: exp.highlights
        })), null, 2);
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<experience>
  ${experiences.map(exp => `<position>
    <company>${exp.company || ''}</company>
    <role>${exp.role || ''}</role>
    <period>${exp.period || ''}</period>
    <description><![CDATA[${exp.description || ''}]]></description>
    <highlights>
      ${(exp.highlights || []).map(h => `<item>${h}</item>`).join('\n      ')}
    </highlights>
  </position>`).join('\n  ')}
</experience>`;
      
      case 'md':
      default:
        return `# Work Experience

${experiences.map(exp => `## ${exp.role || 'Role'}
**${exp.company || 'Company'}** | ${exp.period || ''}

${exp.description || ''}

${exp.highlights?.length ? `### Highlights\n${exp.highlights.map(h => `- ${h}`).join('\n')}` : ''}`).join('\n\n---\n\n')}
`;
    }
  };

  const generateEducationContent = (education, type) => {
    switch (type) {
      case 'js':
        return `// Education Background
const education = [
  ${education.map(edu => `{
    institution: "${edu.institution || ''}",
    degree: "${edu.degree || ''}",
    field: "${edu.field || ''}",
    period: "${edu.period || ''}",
    gpa: "${edu.gpa || ''}"
  }`).join(',\n  ')}
];

export default education;`;
      
      case 'json':
        return JSON.stringify(education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          period: edu.period,
          gpa: edu.gpa
        })), null, 2);
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<education>
  ${education.map(edu => `<entry>
    <institution>${edu.institution || ''}</institution>
    <degree>${edu.degree || ''}</degree>
    <field>${edu.field || ''}</field>
    <period>${edu.period || ''}</period>
    <gpa>${edu.gpa || ''}</gpa>
  </entry>`).join('\n  ')}
</education>`;
      
      case 'md':
      default:
        return `# Education

${education.map(edu => `## ${edu.institution || 'Institution'}

- **Degree:** ${edu.degree || ''} in ${edu.field || ''}
- **Period:** ${edu.period || ''}
${edu.gpa ? `- **GPA:** ${edu.gpa}` : ''}`).join('\n\n---\n\n')}
`;
    }
  };

  const generateCertificationsContent = (certifications, type) => {
    switch (type) {
      case 'js':
        return `// Certifications & Achievements
const certifications = [
  ${certifications.map(cert => `{
    name: "${cert.name || ''}",
    issuer: "${cert.issuer || ''}",
    date: "${cert.date || ''}",
    credentialUrl: "${cert.credentialUrl || ''}"
  }`).join(',\n  ')}
];

export default certifications;`;
      
      case 'json':
        return JSON.stringify(certifications.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          credentialUrl: cert.credentialUrl
        })), null, 2);
      
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<certifications>
  ${certifications.map(cert => `<certification>
    <name>${cert.name || ''}</name>
    <issuer>${cert.issuer || ''}</issuer>
    <date>${cert.date || ''}</date>
    <credentialUrl>${cert.credentialUrl || ''}</credentialUrl>
  </certification>`).join('\n  ')}
</certifications>`;
      
      case 'md':
      default:
        return `# Certifications

${certifications.map(cert => `## ${cert.name || 'Certification'}

- **Issued by:** ${cert.issuer || ''}
- **Date:** ${cert.date || ''}
${cert.credentialUrl ? `- **Credential:** [View Certificate](${cert.credentialUrl})` : ''}`).join('\n\n---\n\n')}
`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Edit Form
  if (isEditing && editingFile) {
    return (
      <div className="space-y-6 pb-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {files.find(f => f.id === editingFile.id) ? 'Edit File' : 'New File'}
            </h1>
            <p className="text-gray-400">Configure the file that appears in VS Code Explorer</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setIsEditing(false); setEditingFile(null); }}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save File
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* File Name & Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">File Name *</label>
                <input
                  type="text"
                  value={editingFile.name}
                  onChange={(e) => setEditingFile({ ...editingFile, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white font-mono"
                  placeholder="filename.js"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">File Type</label>
                <select
                  value={editingFile.type}
                  onChange={(e) => setEditingFile({ ...editingFile, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                >
                  {fileTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Content
              </label>
              <textarea
                value={editingFile.content}
                onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                rows={20}
                className="w-full px-4 py-3 rounded-lg bg-[#1e1e1e] border border-gray-700 focus:border-blue-500 outline-none text-green-400 font-mono text-sm resize-none"
                placeholder="// Enter your code here..."
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // File List
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code size={24} />
            VS Code Files
          </h1>
          <p className="text-gray-400">Manage files shown in VS Code Explorer sidebar</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateFromData}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-lg transition-all font-medium disabled:opacity-50"
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {generating ? 'Generating...' : 'Generate from Data'}
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Plus size={18} />
            Add File
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          💡 Click <strong>"Generate from Data"</strong> to auto-create files from your existing Profile, Skills, Experiences, and Education data.
          Projects from the Projects collection are automatically shown in the "projects" folder.
        </p>
      </div>

      {/* Files Grid */}
      <div className="grid gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#1e1e1e] flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-mono">{file.name}</h3>
                  <p className="text-sm text-gray-500">
                    {file.type.toUpperCase()} • {file.content?.length || 0} characters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(file)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Content Preview */}
            <div className="px-4 pb-4">
              <pre className="bg-[#1e1e1e] rounded-lg p-3 text-xs text-gray-400 font-mono overflow-hidden max-h-24">
                {file.content?.substring(0, 300)}
                {file.content?.length > 300 && '...'}
              </pre>
            </div>
          </div>
        ))}

        {files.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Code size={48} className="mx-auto mb-4 opacity-50" />
            <p>No files yet</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {getFileIcon(previewFile.type)}
                <span className="font-mono text-white">{previewFile.name}</span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <pre className="p-4 text-sm text-green-400 font-mono overflow-auto max-h-[60vh] bg-[#1e1e1e]">
              {previewFile.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default VSCodeFiles;
