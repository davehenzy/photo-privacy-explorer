'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '@/components/Dropzone';
import Sidebar from '@/components/Sidebar';
import { parseExif, PhotoMetadata } from '@/lib/metadata';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-black animate-pulse" />
});

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PhotoMetadata | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setIsScanning(true);
    setFile(selectedFile);
    
    try {
      // Small artificial delay for premium "scanning" feel
      await new Promise(r => setTimeout(r, 1500));
      const arrayBuffer = await selectedFile.arrayBuffer();
      const parsedData = parseExif(arrayBuffer);
      setMetadata(parsedData);
    } finally {
      setIsScanning(false);
    }
  };

  const cleanMetadata = async () => {
    if (!file) return;
    setIsCleaning(true);
    
    // Privacy Logic: Re-drawing to canvas strips all EXIF headers
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `photo-privacy-cleaned-${file.name}`;
          a.click();
          URL.revokeObjectURL(url);
        }
        setIsCleaning(false);
      }, 'image/jpeg', 0.95);
    }
  };

  const downloadReport = () => {
    if (!metadata) return;
    const dataStr = JSON.stringify(metadata, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = 'metadata-report.json';
    a.click();
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Background Map */}
      <Map 
        center={metadata?.gps ? [metadata.gps.longitude, metadata.gps.latitude] : [0, 20]} 
        zoom={metadata?.gps ? 14 : 2} 
        bearing={metadata?.gps?.bearing}
      />

      {/* Overlay UI elements */}
      <div className="absolute inset-0 z-[100] pointer-events-none">
        {/* Footer Branding */}
        <div className="absolute bottom-6 left-6 flex items-center gap-3 pointer-events-none">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">P</div>
          <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">PhotoPrivacy Explorer</span>
        </div>

        {/* Dynamic Center Stage */}
        <div className="h-full w-full flex items-center justify-center pointer-events-none">
          <AnimatePresence>
            {!file && !isScanning && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto"
              >
                <Dropzone onFileSelect={handleFileSelect} />
              </motion.div>
            )}

            {isScanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-[300px] h-[300px] rounded-full border-2 border-primary/30 overflow-hidden flex items-center justify-center bg-primary/5">
                  <div className="scanning-indicator" />
                  <div className="text-primary font-mono text-lg animate-pulse">DEEP SCANNING...</div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest">Extracting Hidden Layers</h3>
                  <p className="text-gray-400">Auditing EXIF data for privacy vulnerabilities</p>
                </div>
              </motion.div>
            )}

            {file && !isScanning && (
              <motion.div
                key="audit-status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 bg-black/60 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] pointer-events-auto"
              >
                <div className={`p-4 rounded-full border-2 ${metadata?.gps ? 'border-red-400 bg-red-400/10 text-red-400' : 'border-green-400 bg-green-400/10 text-green-400'}`}>
                   <div className="text-4xl">
                     {metadata?.gps ? '⚠️' : '🛡️'}
                   </div>
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Audit Complete</h2>
                  <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em]">
                    {file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">
                  <div className={`h-1.5 w-1.5 rounded-full ${metadata?.gps ? 'bg-red-400' : 'bg-green-400'} animate-pulse`} />
                  <span className={metadata?.gps ? 'text-red-300' : 'text-green-300'}>
                    {metadata?.gps ? 'Vulnerabilities Found' : 'Privacy Verified'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Sidebar 
        metadata={metadata} 
        onClean={cleanMetadata} 
        onDownloadReport={downloadReport}
        onReset={() => {
          setFile(null);
          setMetadata(null);
        }}
        isCleaning={isCleaning}
      />
    </main>
  );
}
