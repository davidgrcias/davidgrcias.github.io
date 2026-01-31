import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, X } from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import ImageUploader from '../../components/admin/ImageUploader';
import PDFUploader from '../../components/admin/PDFUploader';

// Static fallback data
const defaultProfile = {
  name: "David Garcia Saragih",
  headline: "Full-Stack Web & Systems Engineer · Content Creator",
  photoUrl: "/profilpict.webp",
  cvUrl: "/CV_DavidGarciaSaragih.pdf", // Default CV URL
  aboutText: "I'm driven by curiosity and the excitement of learning something new, especially when it comes to technology. What started as a hobby has grown into a habit of building, exploring, and bringing ideas to life through code and creativity",
  // Status card settings
  status: "open", // 'open' | 'employed' | 'busy'
  availableFor: ["Full-time", "Freelance"],
  contact: {
    email: "davidgarciasaragih7@gmail.com",
    location: "Jakarta, Indonesia",
    whatsapp: "+6287776803957",
    phone: ""
  },
  socials: {
    youtube: { url: "https://www.youtube.com/c/DavidGTech", handle: "@DavidGTech" },
    tiktok: { url: "https://www.tiktok.com/@davidgtech", handle: "@davidgtech" },
    github: { url: "https://github.com/davidgrcias", handle: "davidgrcias" },
    linkedin: { url: "https://www.linkedin.com/in/davidgrcias/", handle: "davidgrcias" },
    instagram: { url: "https://www.instagram.com/davidgrcias/", handle: "@davidgrcias" }
  }
};

const availableOptions = [
  { value: "Full-time", label: "Full-time Position" },
  { value: "Part-time", label: "Part-time Position" },
  { value: "Freelance", label: "Freelance Work" },
  { value: "Contract", label: "Contract Work" },
  { value: "Remote", label: "Remote Work" },
  { value: "Collaboration", label: "Collaboration" },
];

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getDocument('profile', 'main');
      
      if (data && data.name) {
        // Merge Firestore data with defaults to ensure all fields exist
        setProfile(prev => ({
          ...defaultProfile,
          ...data,
          status: data.status || defaultProfile.status,
          availableFor: data.availableFor || defaultProfile.availableFor,
          contact: { ...defaultProfile.contact, ...data.contact },
          socials: { 
            youtube: { ...defaultProfile.socials.youtube, ...data.socials?.youtube },
            tiktok: { ...defaultProfile.socials.tiktok, ...data.socials?.tiktok },
            github: { ...defaultProfile.socials.github, ...data.socials?.github },
            linkedin: { ...defaultProfile.socials.linkedin, ...data.socials?.linkedin },
            instagram: { ...defaultProfile.socials.instagram, ...data.socials?.instagram }
          }
        }));
      }
      // If no data in Firestore, keep defaultProfile (already set in useState)
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Keep default profile on error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialChange = (platform, field, value) => {
    setProfile(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [platform]: { ...prev.socials[platform], [field]: value }
      }
    }));
  };

  const handleAvailableForToggle = (option) => {
    setProfile(prev => {
      const currentList = prev.availableFor || [];
      if (currentList.includes(option)) {
        return { ...prev, availableFor: currentList.filter(item => item !== option) };
      } else {
        return { ...prev, availableFor: [...currentList, option] };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await firestoreService.setDocument('profile', 'main', {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      alert('Profile saved successfully!');
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  const socialPlatforms = [
    { key: 'youtube', label: 'YouTube', icon: '📺' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'github', label: 'GitHub', icon: '💻' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'instagram', label: 'Instagram', icon: '📷' }
  ];

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400">Edit your personal information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      {/* Basic Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Photo */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
              <ImageUploader
                initialImage={profile.photoUrl}
                onImageUploaded={(url) => setProfile(prev => ({ ...prev, photoUrl: url }))}
              />
            </div>

            {/* Name & Headline */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Headline / Title</label>
                <input
                  type="text"
                  name="headline"
                  value={profile.headline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  placeholder="e.g. Full-Stack Developer · Content Creator"
                />
              </div>
            </div>
          </div>

          {/* CV/Resume Upload */}
          <div>
            <PDFUploader
              initialPDF={profile.cvUrl}
              onPDFUploaded={(url) => setProfile(prev => ({ ...prev, cvUrl: url }))}
              label="CV / Resume (PDF)"
            />
            <p className="mt-2 text-xs text-gray-500">
              Upload your latest CV/Resume. This will be used for the "My CV" download button.
            </p>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">About Me</label>
            <textarea
              name="aboutText"
              value={profile.aboutText}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white resize-none"
              placeholder="A brief description about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Status Card Settings */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-lg font-semibold text-white">Status Card Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure the status card displayed on your portfolio</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Work Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Work Status</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'open', label: 'Open to Work', color: 'emerald', desc: 'Actively looking' },
                { value: 'employed', label: 'Employed', color: 'blue', desc: 'Currently working' },
                { value: 'busy', label: 'Not Available', color: 'orange', desc: 'Not taking work' },
              ].map(({ value, label, color, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, status: value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    profile.status === value 
                      ? `border-${color}-500 bg-${color}-500/10` 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full ${
                      value === 'open' ? 'bg-emerald-500' : 
                      value === 'employed' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                    <span className="font-medium text-white text-sm">{label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Available For */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Available For</label>
            <div className="flex flex-wrap gap-2">
              {availableOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleAvailableForToggle(value)}
                  className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                    (profile.availableFor || []).includes(value)
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {(profile.availableFor || []).includes(value) && (
                    <span className="mr-1">✓</span>
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-lg font-semibold text-white">Contact Information</h2>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="contact.email"
              value={profile.contact.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              name="contact.location"
              value={profile.contact.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              name="contact.phone"
              value={profile.contact.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="+62-xxx-xxxx-xxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp</label>
            <input
              type="tel"
              name="contact.whatsapp"
              value={profile.contact.whatsapp}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="+6287xxxxxxxxxx (with country code)"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 bg-gray-800/30">
          <h2 className="text-lg font-semibold text-white">Social Links</h2>
        </div>

        <div className="p-6 space-y-4">
          {socialPlatforms.map(({ key, label, icon }) => (
            <div key={key} className="grid md:grid-cols-2 gap-4 p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2 md:mb-0 md:col-span-2">
                <span className="text-xl">{icon}</span>
                <span className="font-medium text-white">{label}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">URL</label>
                <input
                  type="url"
                  value={profile.socials[key]?.url || ''}
                  onChange={(e) => handleSocialChange(key, 'url', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white text-sm"
                  placeholder={`https://${key}.com/...`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Handle / Username</label>
                <input
                  type="text"
                  value={profile.socials[key]?.handle || ''}
                  onChange={(e) => handleSocialChange(key, 'handle', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white text-sm"
                  placeholder="@username"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
