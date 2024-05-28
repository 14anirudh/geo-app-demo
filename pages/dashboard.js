import { useState } from "react";
import Map from "../components/Map";
import { nanoid } from "nanoid";
import * as turf from "@turf/turf";

export default function Dashboard() {
  const [datasets, setDatasets] = useState([]);
  const [visibleDatasets, setVisibleDatasets] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      const id = nanoid();
      setDatasets((prev) => [
        ...prev,
        { id, data, type: "geojson", name: file.name },
      ]);
      setVisibleDatasets((prev) => [...prev, id]);
    };

    reader.readAsText(file);
  };

  const toggleDatasetVisibility = (id) => {
    setVisibleDatasets((prev) =>
      prev.includes(id)
        ? prev.filter((datasetId) => datasetId !== id)
        : [...prev, id]
    );
  };

  function calculateDistance(point1, point2, units = "kilometers") {
    // Create Turf.js point objects
    const from = turf.point(point1);
    const to = turf.point(point2);

    // Calculate the distance between the points
    const distance = turf.distance(from, to, { units });

    return distance;
  }

  const pointA = [-75.343, 39.984];
  const pointB = [-75.534, 39.123];
  const distance = calculateDistance(pointA, pointB, "miles");
  console.log(`Distance: ${distance} miles`);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold mt-6 mb-4">Dashboard</h1>

      <input
        type="file"
        accept=".geojson"
        onChange={handleFileUpload}
        className="mb-4"
      />
      <div className="flex flex-wrap justify-center mb-4">
        {datasets.map((dataset) => (
          <button
            key={dataset.id}
            onClick={() => toggleDatasetVisibility(dataset.id)}
            className={`px-4 py-2 m-2 ${
              visibleDatasets.includes(dataset.id)
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            } rounded`}
          >
            {dataset.name}
          </button>
        ))}
      </div>
      <div className="w-full h-96">
        <Map datasets={datasets} visibleDatasets={visibleDatasets} />
      </div>
    </div>
  );
}
