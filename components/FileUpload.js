// components/FileUpload.js

import React from 'react';

export default function FileUpload({ onUpload }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      // Parse the uploaded file as GeoJSON data
      const geojsonData = JSON.parse(e.target.result);
      // Pass the uploaded GeoJSON data to the parent component
      onUpload({
        type: 'geojson',
        data: geojsonData,
        id: `geojson-${Date.now()}`, // Generate a unique ID for the dataset
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-4">
      <input type="file" onChange={handleFileChange} accept=".geojson" />
    </div>
  );
}
