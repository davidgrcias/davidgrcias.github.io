import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImageToImgBB } from '../../services/imgbb';

const ImageUploader = ({ onImageUploaded, initialImage = '', label = "Upload Image" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setError('');

    try {
      // Attempt upload
      const url = await uploadImageToImgBB(file);
      onImageUploaded(url);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Check API Key or try again.');
      // Keep local preview for UX even if upload fails (user can retry later) or revert?
      // For now, we keep preview but show error
    } finally {
      setUploading(false);
    }
  }, [onImageUploaded]);

  const removeImage = (e) => {
    e.stopPropagation();
    setPreview('');
    onImageUploaded('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp'],
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer overflow-hidden ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800'
        }`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
              <button
                onClick={removeImage}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-gray-500 dark:text-gray-400">
            {uploading ? (
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
            ) : (
                <Upload size={32} className="mb-2" />
            )}
            <p className="text-sm font-medium text-center">
              {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs mt-1 opacity-70">PNG, JPG, WEBP up to 5MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUploader;
