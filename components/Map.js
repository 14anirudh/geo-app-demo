import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function Map({ datasets, visibleDatasets }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });

    mapRef.current = map;

    map.on('click', (e) => {
      if (selectMode) {
        const newPoint = [e.lngLat.lng, e.lngLat.lat];
        setPoints((prevPoints) => {
          if (prevPoints.length < 2) {
            return [...prevPoints, newPoint];
          } else {
            return [newPoint];
          }
        });
      }
    });

    return () => map.remove();
  }, [selectMode]);

  useEffect(() => {
    if (points.length === 2) {
      const from = turf.point(points[0]);
      const to = turf.point(points[1]);
      const distance = turf.distance(from, to, { units: 'kilometers' });
      setDistance(distance.toFixed(2));
    }
  }, [points]);

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

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove existing point layers
    if (map.getLayer('selected-point-1')) {
      map.removeLayer('selected-point-1');
      map.removeSource('selected-point-1');
    }
    if (map.getLayer('selected-point-2')) {
      map.removeLayer('selected-point-2');
      map.removeSource('selected-point-2');
    }

    // Add new point layers
    points.forEach((point, index) => {
      map.addSource(`selected-point-${index + 1}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: point,
          },
        },
      });

      map.addLayer({
        id: `selected-point-${index + 1}`,
        type: 'circle',
        source: `selected-point-${index + 1}`,
        paint: {
          'circle-radius': 10,
          'circle-color': '#ff0000',
        },
      });
    });
  }, [points]);

  const handleSelectModeToggle = () => {
    if (selectMode) {
      setPoints([]);
      setDistance(null);
    }
    setSelectMode((prevMode) => !prevMode);
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        <button
          onClick={handleSelectModeToggle}
          className={`mb-4 px-4 py-2 ${selectMode ? 'bg-red-500' : 'bg-green-500'} text-white rounded`}
        >
          {selectMode ? 'Cancel Selection' : 'Select Points'}
        </button>
        {distance && (
          <div className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
            Distance: {distance} kilometers and {distance*1.6.toFixed(2)} miles
          </div>
        )}
      </div>
      <div ref={mapContainerRef} className="w-full h-screen" />
    </div>
  );
}
