// components/Map.js

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function Map({ datasets }) {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });

    map.on('load', () => {
      // Add uploaded datasets to the map
      datasets.forEach((dataset) => {
        if (dataset.type === 'geojson') {
          // Add GeoJSON data to the map
          map.addSource(dataset.id, {
            type: 'geojson',
            data: dataset.data,
          });

          // Add a layer to the map for the GeoJSON data
          map.addLayer({
            id: dataset.id,
            type: 'circle', // Change to circle type
            source: dataset.id,
            paint: {
              'circle-radius': 8, // Increase the circle radius
              'circle-color': 'blue', // Circle color
              'circle-opacity': 0.5, // Circle opacity
            },
          });
        }
      });
    });

    // Cleanup
    return () => map.remove();
  }, [datasets]);

  return <div ref={mapContainerRef} className="w-full h-screen" />;
}
