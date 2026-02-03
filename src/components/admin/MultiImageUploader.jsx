import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImageToImgBB } from '../../services/imgbb';

const MultiImageUploader = ({ onImagesUploaded, initialImages = [], label = "Gallery Images" }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState('');

  // Sync state with props when editing different posts or re-mounting
  React.useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError('');

    const newImages = [];
    
    // Create optimistic previews
    const previews = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading'
    }));

    // We can't easily mix optimistic with "done" URLs in the same array without complex state, 
    // so for simplicity in this implementation, we'll upload one by one and append.
    // Or we could show a loading state while processing.
    
    try {
      const uploadPromises = acceptedFiles.map(file => uploadImageToImgBB(file));
      const urls = await Promise.all(uploadPromises);
      
      const updatedImages = [...images, ...urls];
      setImages(updatedImages);
      onImagesUploaded(updatedImages);
    } catch (err) {
      console.error(err);
      setError('Some images failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, onImagesUploaded]);

  const removeImage = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp', '.gif'],
    },
    multiple: true
  });

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer overflow-hidden mb-4 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center py-4 text-gray-500 dark:text-gray-400">
          {uploading ? (
             <Loader2 size={32} className="animate-spin mb-2 text-blue-500" />
          ) : (
             <Upload size={32} className="mb-2" />
          )}
          <p className="text-sm font-medium text-center">
            {isDragActive ? 'Drop images here' : 'Drag & drop multiple images'}
          </p>
          <p className="text-xs mt-1 opacity-70">PNG, JPG, WEBP, GIF up to 5MB</p>
        </div>
      </div>

      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

      {/* Grid of Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent drag drop click
                    removeImage(index);
                  }}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiImageUploader;
