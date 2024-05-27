import { useState } from 'react';
import Map from '../components/Map';
import FileUpload from '../components/FileUpload';

export default function Dashboard() {
  const [datasets, setDatasets] = useState([]);

  const handleDatasetUpload = (newDataset) => {
    setDatasets([...datasets, newDataset]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <FileUpload onUpload={handleDatasetUpload} />
      <Map datasets={datasets} />
    </div>
  );
}
