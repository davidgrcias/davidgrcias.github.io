import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { uploadToFirebaseStorage } from '../../services/firebase-storage';

/**
 * PDF Uploader Component
 * Supports:
 * 1. Upload to Firebase Storage (fast, reliable)
 * 2. Manual URL input (for external hosting)
 */
const PDFUploader = ({ onPDFUploaded, initialPDF = '', label = "Upload PDF (CV/Resume)" }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(initialPDF);
  const [pdfName, setPdfName] = useState(initialPDF ? initialPDF.split('/').pop().split('?')[0] : '');
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file too large. Maximum size is 10MB.');
      return;
    }

    setPdfName(file.name);
    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Upload to Firebase Storage
      const url = await uploadToFirebaseStorage(
        file, 
        'pdfs',
        (progress) => setUploadProgress(progress)
      );
      
      setPdfUrl(url);
      onPDFUploaded(url);
    } catch (err) {
      console.error('PDF Upload Error:', err);
      setError('Upload failed. Please try again or use manual URL input.');
      setPdfUrl('');
      setPdfName('');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onPDFUploaded]);

  const removePDF = (e) => {
    e.stopPropagation();
    setPdfUrl('');
    setPdfName('');
    onPDFUploaded('');
  };

  const handleManualUrlSubmit = () => {
    if (!manualUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Convert Google Drive link to embeddable URL
    let finalUrl = manualUrl.trim();
    
    // Check if it's a Google Drive link
    if (finalUrl.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      // Format 1: /file/d/{FILE_ID}/view or /file/d/{FILE_ID}/preview
      const match1 = finalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match1) fileId = match1[1];
      
      // Format 2: /open?id={FILE_ID} or ?id={FILE_ID}
      const match2 = finalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (!fileId && match2) fileId = match2[1];
      
      if (fileId) {
        // Use Google Docs Viewer for reliable PDF embedding
        // This works better than /preview which can redirect to download
        const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(driveUrl)}&embedded=true`;
      } else {
        setError('Invalid Google Drive link. Please share the file publicly and copy the link.');
        return;
      }
    }

    // Basic URL validation
    try {
      new URL(finalUrl);
      setPdfUrl(finalUrl);
      setPdfName('CV.pdf'); // Default name for external links
      onPDFUploaded(finalUrl);
      setShowUrlInput(false);
      setManualUrl('');
      setError('');
    } catch {
      setError('Invalid URL format');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      {!showUrlInput ? (
        <>
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer overflow-hidden ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : pdfUrl
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800'
            } ${uploading ? 'pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />

            {pdfUrl ? (
              <div className="relative">
                {/* PDF Preview */}
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <FileText size={24} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {pdfName || 'CV.pdf'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF Document</p>
                  </div>
                  <button
                    onClick={removePDF}
                    className="flex-shrink-0 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove PDF"
                  >
                    <X size={16} />
                  </button>
                </div>

                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg">
                    <Loader2 className="animate-spin text-white mb-2" size={32} />
                    <span className="text-white text-sm font-medium">{uploadProgress}%</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  ) : (
                    <Upload className="text-gray-400" size={32} />
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {uploading 
                    ? `Uploading... ${uploadProgress}%` 
                    : isDragActive 
                    ? 'Drop PDF here' 
                    : 'Drag & drop PDF or click to browse'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload to Firebase Storage • Max 10MB
                </p>
              </div>
            )}
          </div>

          {/* Manual URL Input Button */}
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <LinkIcon size={12} />
            Or paste URL from external hosting
          </button>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualUrlSubmit()}
              placeholder="https://drive.google.com/file/d/... or any URL"
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white text-sm"
            />
            <button
              onClick={handleManualUrlSubmit}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowUrlInput(false);
                setManualUrl('');
                setError('');
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p className="font-medium text-gray-300">📌 Tips:</p>
            <p>• <strong>Google Drive:</strong> Share → Anyone with link → Copy link → Paste here</p>
            <p>• <strong>Dropbox:</strong> Share → Copy link → Replace dl=0 with dl=1</p>
            <p>• Or use any direct PDF URL</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2 text-red-500 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {pdfUrl && !error && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          PDF ready
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
