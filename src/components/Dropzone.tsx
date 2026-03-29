'use client';

import { UploadCloud } from 'lucide-react';
import { useState, useRef } from 'react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
}

export default function Dropzone({ onFileSelect }: DropzoneProps) {
  const [isHovered, setIsHovered] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className="dropzone-overlay glass-panel"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.1)' : undefined,
        borderColor: isHovered ? 'var(--primary)' : 'var(--glass-border)',
      }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept="image/*"
        id="file-input"
      />
      <div className="flex flex-col items-center gap-4 text-center">
        <UploadCloud size={64} className="text-primary animate-pulse" />
        <h2 className="text-2xl font-bold">Unveil the Story</h2>
        <p className="text-gray-400 max-w-250">
          Drop your photo here to explore its origins and protect your privacy.
        </p>
      </div>
    </div>
  );
}
