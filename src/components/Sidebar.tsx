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

  const hasGPS = !!metadata.gps;
  const hasHardware = !!(metadata.Make || metadata.Model || metadata.LensModel);
  const isSafe = !hasGPS && !hasHardware;

  return (
    <div className="sidebar glass-panel">
      {/* Security Status Header */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 overflow-hidden relative">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mb-1">Safety Status</p>
            <h2 className={`text-2xl font-bold ${isSafe ? 'text-green-400' : 'text-red-400'}`}>
              {isSafe ? 'SECURED' : 'RISK DETECTED'}
            </h2>
          </div>
          <div className={`p-3 rounded-xl ${isSafe ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <ShieldCheck size={32} />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-2">
           <div className="flex items-center justify-between text-sm">
             <span className="text-gray-400">Privacy Rating</span>
             <span className="font-bold">{isSafe ? '100%' : hasGPS ? '20%' : '60%'}</span>
           </div>
           <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
             <div 
               className={`h-full transition-all duration-1000 ${isSafe ? 'w-full bg-green-400' : hasGPS ? 'w-1/5 bg-red-400' : 'w-3/5 bg-yellow-400'}`}
             />
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 mb-4">
        {isSafe && (
          <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20 text-sm text-green-200/80 leading-relaxed italic">
            "We found no traces of sensitive location or hardware data. This image is likely already stripped of EXIF data by a social platform like Facebook or Instagram."
          </div>
        )}

        {hasGPS && (
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold uppercase text-xs tracking-tighter">
              <MapPin size={16} />
              <span>Breached Location Data</span>
            </div>
            <div className="text-sm font-mono text-gray-300">
              <div className="mb-4 space-y-1">
                <p className="flex justify-between font-mono"><span className="text-gray-500">LAT:</span> {metadata.gps.latitude.toFixed(6)}</p>
                <p className="flex justify-between font-mono"><span className="text-gray-500">LNG:</span> {metadata.gps.longitude.toFixed(6)}</p>
              </div>
              
              {metadata.gps.bearing !== undefined && (
                <div className="flex flex-col gap-2 p-3 bg-primary-5 rounded-xl border border-primary-30">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                    <Compass size={14} className="animate-spin-slow" />
                    <span>Shooting Angle</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold tracking-tight text-white leading-none">
                      {metadata.gps.bearing.toFixed(1)}°
                    </span>
                    <span className="text-[10px] uppercase bg-primary px-1.5 py-0.5 rounded text-white font-bold leading-none mb-1">
                      {(() => {
                        const deg = metadata.gps.bearing;
                        if (deg >= 337.5 || deg < 22.5) return 'North';
                        if (deg >= 22.5 && deg < 67.5) return 'North-East';
                        if (deg >= 67.5 && deg < 112.5) return 'East';
                        if (deg >= 112.5 && deg < 157.5) return 'South-East';
                        if (deg >= 157.5 && deg < 202.5) return 'South';
                        if (deg >= 202.5 && deg < 247.5) return 'South-West';
                        if (deg >= 247.5 && deg < 292.5) return 'West';
                        return 'North-West';
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {hasHardware && (
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2 text-purple-400 font-semibold uppercase text-xs tracking-tighter">
              <Info size={16} />
              <span>Identity Leakage (Hardware)</span>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-500">Device</span> 
                <span className="text-right truncate max-w-[140px]">{metadata.Make} {metadata.Model}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-500">Lens</span> 
                <span className="text-right truncate max-w-[140px]">{metadata.LensModel || 'Unknown'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-gray-500">Exposure</span> 
                <span>{metadata.ExposureTime || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ISO</span> 
                <span>{metadata.ISO || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button 
          onClick={onClean}
          disabled={isCleaning || isSafe}
          className={`btn-primary flex items-center justify-center gap-2 w-full transition-all ${isSafe ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
        >
          <Trash2 size={18} />
          {isCleaning ? 'Neutralizing...' : isSafe ? 'Verified Safe' : 'Neutralize Metadata'}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onDownloadReport}
            className="btn-secondary flex items-center justify-center gap-2 text-xs py-2 px-1"
          >
            <Download size={14} />
            Report
          </button>
          <button 
            onClick={onReset}
            className="btn-secondary flex items-center justify-center gap-2 text-xs py-2 px-1 hover:text-red-400"
          >
            <Trash2 size={14} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
  );
}
