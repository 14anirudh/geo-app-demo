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
  const [hoverInfo, setHoverInfo] = useState(null);
  const markersRef = useRef([]);

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

          map.on('mouseenter', dataset.id, (e) => {
            map.getCanvas().style.cursor = 'pointer';
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;

            const point = map.project(coordinates);

            setHoverInfo({
              point,
              properties,
              name: dataset.name,
            });
          });

          map.on('mouseleave', dataset.id, () => {
            map.getCanvas().style.cursor = '';
            setHoverInfo(null);
          });
        }
      }
    });
  }, [datasets, visibleDatasets]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove existing point layers and markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new point layers
    points.forEach((point, index) => {
      const marker = new mapboxgl.Marker({ draggable: true })
        .setLngLat(point)
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setPoints(prevPoints => {
          const newPoints = [...prevPoints];
          newPoints[index] = [lngLat.lng, lngLat.lat];
          return newPoints;
        });
      });

      markersRef.current.push(marker);
    });
  }, [points]);

  const handleSelectModeToggle = () => {
    if (selectMode) {
      setPoints([]);
      setDistance(null);
    }
    setSelectMode((prevMode) => !prevMode);
  };

  const handleSavePoints = () => {
    localStorage.setItem('savedPoints', JSON.stringify(points));
    alert('Points saved!');
  };

  const handleLoadPoints = () => {
    const savedPoints = JSON.parse(localStorage.getItem('savedPoints'));
    if (savedPoints) {
      setPoints(savedPoints);
    } else {
      alert('No saved points found.');
    }
  };

  const handleDeletePoint = (index) => {
    setPoints((prevPoints) => prevPoints.filter((_, i) => i !== index));
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
        <button
          onClick={handleSavePoints}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Points
        </button>
        <button
          onClick={handleLoadPoints}
          className="mb-4 px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Load Points
        </button>
        {distance && (
          <div className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
            Distance: {distance} kilometers and {(distance * 1.6).toFixed(2)} miles
          </div>
        )}
        <div className="mb-4">
          {points.map((point, index) => (
            <div key={index} className="flex items-center">
              <span className="mr-2">Point {index + 1}:</span>
              <button
                onClick={() => handleDeletePoint(index)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <div ref={mapContainerRef} className="relative w-full h-screen">
        {hoverInfo && (
          <div
            className="absolute bg-white p-2 rounded shadow"
            style={{
              left: `${hoverInfo.point.x}px`,
              top: `${hoverInfo.point.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <strong>{hoverInfo.name}</strong>
            <p>{JSON.stringify(hoverInfo.properties)}</p>
          </div>
        )}
      </div>
    </div>
  );
}


// import React, { useEffect, useRef, useState } from 'react';
// import mapboxgl from 'mapbox-gl';
// import * as turf from '@turf/turf';

// const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// export default function Map({ datasets, visibleDatasets }) {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const [points, setPoints] = useState([]);
//   const [distance, setDistance] = useState(null);
//   const [selectMode, setSelectMode] = useState(false);
//   const [hoverInfo, setHoverInfo] = useState(null);

//   useEffect(() => {
//     mapboxgl.accessToken = MAPBOX_TOKEN;

//     const map = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: 'mapbox://styles/mapbox/streets-v11',
//       center: [0, 0],
//       zoom: 2,
//     });

//     mapRef.current = map;

//     map.on('click', (e) => {
//       if (selectMode) {
//         const newPoint = [e.lngLat.lng, e.lngLat.lat];
//         setPoints((prevPoints) => {
//           if (prevPoints.length < 2) {
//             return [...prevPoints, newPoint];
//           } else {
//             return [newPoint];
//           }
//         });
//       }
//     });

//     return () => map.remove();
//   }, [selectMode]);

//   useEffect(() => {
//     if (points.length === 2) {
//       const from = turf.point(points[0]);
//       const to = turf.point(points[1]);
//       const distance = turf.distance(from, to, { units: 'kilometers' });
//       setDistance(distance.toFixed(2));
//     }
//   }, [points]);

//   useEffect(() => {
//     if (!mapRef.current) return;
//     const map = mapRef.current;

//     datasets.forEach((dataset) => {
//       if (dataset.type === 'geojson') {
//         if (map.getSource(dataset.id)) {
//           map.removeLayer(dataset.id);
//           map.removeSource(dataset.id);
//         }

//         if (visibleDatasets.includes(dataset.id)) {
//           map.addSource(dataset.id, {
//             type: 'geojson',
//             data: dataset.data,
//           });

//           map.addLayer({
//             id: dataset.id,
//             type: 'circle',
//             source: dataset.id,
//             paint: {
//               'circle-radius': 10,
//               'circle-color': '#007cbf',
//             },
//           });

//           map.on('mouseenter', dataset.id, (e) => {
//             map.getCanvas().style.cursor = 'pointer';
//             const coordinates = e.features[0].geometry.coordinates.slice();
//             const properties = e.features[0].properties;

//             const point = map.project(coordinates);

//             setHoverInfo({
//               point,
//               properties,
//               name: dataset.name,
//             });
//           });

//           map.on('mouseleave', dataset.id, () => {
//             map.getCanvas().style.cursor = '';
//             setHoverInfo(null);
//           });
//         }
//       }
//     });
//   }, [datasets, visibleDatasets]);

//   useEffect(() => {
//     if (!mapRef.current) return;
//     const map = mapRef.current;

//     // Remove existing point layers
//     if (map.getLayer('selected-point-1')) {
//       map.removeLayer('selected-point-1');
//       map.removeSource('selected-point-1');
//     }
//     if (map.getLayer('selected-point-2')) {
//       map.removeLayer('selected-point-2');
//       map.removeSource('selected-point-2');
//     }

//     // Add new point layers
//     points.forEach((point, index) => {
//       map.addSource(`selected-point-${index + 1}`, {
//         type: 'geojson',
//         data: {
//           type: 'Feature',
//           geometry: {
//             type: 'Point',
//             coordinates: point,
//           },
//         },
//       });

//       map.addLayer({
//         id: `selected-point-${index + 1}`,
//         type: 'circle',
//         source: `selected-point-${index + 1}`,
//         paint: {
//           'circle-radius': 10,
//           'circle-color': '#ff0000',
//         },
//       });
//     });
//   }, [points]);

//   const handleSelectModeToggle = () => {
//     if (selectMode) {
//       setPoints([]);
//       setDistance(null);
//     }
//     setSelectMode((prevMode) => !prevMode);
//   };

//   const handleSavePoints = () => {
//     // Save the points state to your backend or any storage here
//     console.log('Points saved:', points);
//   };

//   const handleDeletePoint = (index) => {
//     setPoints((prevPoints) => prevPoints.filter((_, i) => i !== index));
//   };

//   return (
//     <div>
//       <div className="flex flex-col items-center">
//         <button
//           onClick={handleSelectModeToggle}
//           className={`mb-4 px-4 py-2 ${selectMode ? 'bg-red-500' : 'bg-green-500'} text-white rounded`}
//         >
//           {selectMode ? 'Cancel Selection' : 'Select Points'}
//         </button>
//         <button
//           onClick={handleSavePoints}
//           className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Save Points
//         </button>
//         {distance && (
//           <div className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
//             Distance: {distance} kilometers and {(distance * 1.6).toFixed(2)} miles
//           </div>
//         )}
//         <div className="mb-4">
//           {points.map((point, index) => (
//             <div key={index} className="flex items-center">
//               <span className="mr-2">Point {index + 1}:</span>
//               <button
//                 onClick={() => handleDeletePoint(index)}
//                 className="px-2 py-1 bg-red-500 text-white rounded"
//               >
//                 Delete
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div ref={mapContainerRef} className="relative w-full h-screen">
//         {hoverInfo && (
//           <div
//             className="absolute bg-white p-2 rounded shadow"
//             style={{
//               left: `${hoverInfo.point.x}px`,
//               top: `${hoverInfo.point.y}px`,
//               transform: 'translate(-50%, -100%)',
//             }}
//           >
//             <strong>{hoverInfo.name}</strong>
//             <p>{JSON.stringify(hoverInfo.properties)}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
