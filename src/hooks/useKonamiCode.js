import { useEffect, useState } from 'react';

/**
 * useKonamiCode - Detect the famous Konami Code sequence
 * ↑ ↑ ↓ ↓ ← → ← → B A
 */
export const useKonamiCode = (callback) => {
  const [keys, setKeys] = useState([]);
  
  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Add new key to sequence
      const newKeys = [...keys, e.key];
      
      // Keep only last 10 keys
      if (newKeys.length > 10) {
        newKeys.shift();
      }
      
      setKeys(newKeys);
      
      // Check if sequence matches
      const matches = konamiCode.every((key, index) => {
        return newKeys[index] === key;
      });
      
      if (matches && newKeys.length === konamiCode.length) {
        callback();
        setKeys([]); // Reset after activation
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback]);

  return keys;
};

export default useKonamiCode;
