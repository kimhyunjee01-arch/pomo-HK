
import React, { useState, useEffect } from 'react';

interface CatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CatModal: React.FC<CatModalProps> = ({ isOpen, onClose }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Append timestamp to bust cache and get a new cat image
      const newImageUrl = `https://cataas.com/cat?_=${new Date().getTime()}`;
      setImageUrl(newImageUrl);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleImageLoad = () => {
    setIsLoading(false);
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl p-4 relative max-w-lg w-full"
        onClick={e => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-500 transition-colors"
            aria-label="Close"
        >
          &times;
        </button>
        <div className="aspect-square w-full bg-gray-700 rounded-md flex items-center justify-center">
            {isLoading && <div className="text-white">Loading a cute cat...</div>}
            <img 
                src={imageUrl} 
                alt="A random cat to help you relax" 
                className={`object-contain h-full w-full rounded-md ${isLoading ? 'hidden' : 'block'}`}
                onLoad={handleImageLoad}
            />
        </div>
        <p className="text-center text-gray-300 mt-2 text-sm">Here's a cat. Now, back to work!</p>
      </div>
    </div>
  );
};

export default CatModal;
