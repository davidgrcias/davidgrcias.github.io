import { storage } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} folder - Storage folder path (e.g., 'pdfs', 'images')
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} - Download URL
 */
export const uploadToFirebaseStorage = async (file, folder = 'files', onProgress = null) => {
  if (!file) throw new Error('No file provided');

  // Create unique filename
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress callback
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        reject(error);
      },
      async () => {
        // Upload complete, get download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Delete file from Firebase Storage by URL
 * @param {string} fileUrl - Full Firebase Storage URL
 */
export const deleteFromFirebaseStorage = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.includes('firebasestorage.googleapis.com')) {
      console.warn('Not a Firebase Storage URL, skipping delete');
      return;
    }

    // Extract path from URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    const pathStart = fileUrl.indexOf('/o/') + 3;
    const pathEnd = fileUrl.indexOf('?');
    
    if (pathStart === -1 || pathEnd === -1) {
      throw new Error('Invalid Firebase Storage URL');
    }

    const encodedPath = fileUrl.substring(pathStart, pathEnd);
    const path = decodeURIComponent(encodedPath);
    
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw - deletion is not critical
  }
};
