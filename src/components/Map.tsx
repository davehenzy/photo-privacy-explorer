import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  center?: [number, number];
  zoom?: number;
  bearing?: number;
}

export default function Map({ center = [0, 20], zoom = 2, bearing }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      const initMap = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: center,
        zoom: zoom,
        pitch: 45,
      });

      initMap.on('load', () => {
        initMap.addControl(new maplibregl.NavigationControl(), 'top-left');
        map.current = initMap;
      });
    } catch (e) {
      console.error("MapLibre Initialization Error:", e);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map view and marker when center/bearing changes
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    const updateMap = () => {
      m.flyTo({
        center,
        zoom: zoom === 2 ? 2 : 15,
        essential: true,
        duration: 3000,
      });

      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }

      if (zoom > 2) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = `
          <div style="position: relative;">
            ${bearing !== undefined ? `
              <div style="
                position: absolute;
                bottom: 10px;
                left: -50px;
                width: 120px;
                height: 120px;
                background: radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
                transform-origin: 50% 100%;
                transform: rotate(${bearing}deg);
                clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
                z-index: -1;
              "></div>
            ` : ''}
            <div style="
              width: 20px;
              height: 20px;
              background: var(--primary);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
            "></div>
          </div>
        `;

        marker.current = new maplibregl.Marker({ element: el })
          .setLngLat(center)
          .addTo(m);
      }
    };

    if (m.isStyleLoaded()) {
      updateMap();
    } else {
      m.on('style.load', updateMap);
    }

    return () => {
      m.off('style.load', updateMap);
    };
  }, [center, zoom, bearing]);

  return <div id="map-container" ref={mapContainer} />;
}
