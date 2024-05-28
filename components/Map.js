// components/Map.js
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function Map({ datasets, visibleDatasets }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });

    mapRef.current = map;

    // Cleanup
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    datasets.forEach((dataset) => {
      if (dataset.type === 'geojson') {
        if (map.getSource(dataset.id)) {
          map.removeLayer(dataset.id);
          map.removeSource(dataset.id);
        }

        if (visibleDatasets.includes(dataset.id)) {
          map.addSource(dataset.id, {
            type: 'geojson',
            data: dataset.data,
          });

          map.addLayer({
            id: dataset.id,
            type: 'circle',
            source: dataset.id,
            paint: {
              'circle-radius': 10,
              'circle-color': '#007cbf',
            },
          });
        }
      }
    });
  }, [datasets, visibleDatasets]);

  return <div ref={mapContainerRef} className="w-full h-screen" />;
}
