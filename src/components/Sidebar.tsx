'use client';

import { ShieldCheck, MapPin, Compass, Info, Download, Trash2 } from 'lucide-react';

interface SidebarProps {
  metadata: any;
  onClean: () => void;
  onDownloadReport: () => void;
  onReset: () => void;
  isCleaning?: boolean;
}

export default function Sidebar({ metadata, onClean, 
  onDownloadReport, 
  onReset,
  isCleaning 
}: SidebarProps) {
  if (!metadata) return null;

  return (
    <div className="sidebar glass-panel">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <ShieldCheck size={28} />
          <span>Metadata Audit</span>
        </div>
        <button 
          onClick={onReset}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
          title="Analyze another photo"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2">
        {metadata.gps && (
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold">
              <MapPin size={18} />
              <span>Location Data</span>
            </div>
            <div className="text-sm font-mono text-gray-300">
              <p>LAT: {metadata.gps.latitude.toFixed(6)}</p>
              <p>LNG: {metadata.gps.longitude.toFixed(6)}</p>
              {metadata.gps.bearing !== undefined && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-500/80">
                  <Compass size={12} className="animate-spin-slow" />
                  <span>Direction detected: {metadata.gps.bearing.toFixed(1)}°</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold">
            <Info size={18} />
            <span>Technical Specs</span>
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Device:</span> {metadata.Make} {metadata.Model}</p>
            <p><span className="text-gray-500">Lens:</span> {metadata.LensModel}</p>
            <p><span className="text-gray-500">ISO:</span> {metadata.ISO}</p>
            <p><span className="text-gray-500">Exposure:</span> {metadata.ExposureTime}</p>
            <p><span className="text-gray-500">Taken:</span> {metadata.DateTimeOriginal || metadata.DateTime}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button 
          onClick={onClean}
          disabled={isCleaning}
          className="btn-primary flex items-center justify-center gap-2 w-full"
        >
          <Trash2 size={18} />
          {isCleaning ? 'Cleaning...' : 'Wipe sensitive data'}
        </button>
        <button 
          onClick={onDownloadReport}
          className="btn-secondary flex items-center justify-center gap-2 w-full"
        >
          <Download size={18} />
          Export Metadata Report
        </button>
      </div>
    </div>
  );
}
