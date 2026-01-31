import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, X } from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import ImageUploader from '../../components/admin/ImageUploader';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    headline: '',
    photoUrl: '',
    aboutText: '',
    contact: {
      email: '',
      location: '',
      whatsapp: '',
      phone: ''
    },
    socials: {
      youtube: { url: '', handle: '' },
      tiktok: { url: '', handle: '' },
      github: { url: '', handle: '' },
      linkedin: { url: '', handle: '' },
      instagram: { url: '', handle: '' }
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getDocument('profile', 'main');
      
      if (data && data.name) {
        setProfile(prev => ({
          ...prev,
          ...data,
          contact: { ...prev.contact, ...data.contact },
          socials: { ...prev.socials, ...data.socials }
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
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
