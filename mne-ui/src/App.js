import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import FileUpload from './components/FileUpload';
import DagEditor from './components/DagEditor';
import MetadataModal from './components/MetadataModal';

import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const handleFileSelected = (file) => {
    if (!file) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const inputNode = {
      id: 'input-node',
      type: 'default',
      position: { x: 250, y: 150 },
      data: {
        label: 'Input',
        metadata: {
          fileName: file.name,
          filePath: file.path || file.name,
        },
      },
    };

    setNodes([inputNode]);
    setEdges([]);
  };

  const handleNodeSelect = (id) => {
    setSelectedNodeId(id);
  };

  const handleNodeUpdate = (id, newData) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: newData } : n))
    );
  };

  const downloadJson = () => {
    const filename = 'dag_export.json';
    const dagData = { nodes, edges };
    const jsonStr = JSON.stringify(dagData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunClick = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/ping`);
      if (!res.ok) throw new Error("Server returned an error");
      const data = await res.json();
      alert(JSON.stringify(data, null, 2));
    } catch (err) {
      alert("Error calling API: " + err.message);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div
      className="app-container"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ marginBottom: '10px' }}>MNE Instrumentation App</h1>

      <ReactFlowProvider>
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <FileUpload onFileSelected={handleFileSelected} />
          <button onClick={downloadJson} disabled={nodes.length === 0}>
            Download DAG config
          </button>
          <button onClick={handleRunClick}>
            Run
          </button>
        </div>

        <div
          style={{
            flexGrow: 1,
            border: '1px solid #ccc',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <DagEditor
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            onNodeSelect={handleNodeSelect}
          />
        </div>

        <MetadataModal
          open={!!selectedNode}
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={handleNodeUpdate}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
