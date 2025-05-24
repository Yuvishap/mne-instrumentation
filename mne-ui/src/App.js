import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import DagEditor from './components/DagEditor';
import MetadataModal from './components/MetadataModal';

import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [pendingNode, setPendingNode] = useState(null);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);

  const handleNodeSelect = (id) => setSelectedNodeId(id);

  const handleNodeUpdate = (id, newData) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: newData } : n))
    );
  };

  const handleSaveNewNode = (nodeData) => {
    if (pendingNode) {
      const newNode = { ...pendingNode, data: nodeData };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(newNode.id);
      setPendingNode(null);
      setMetadataModalOpen(false);
    }
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

  return (
    <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '10px', boxSizing: 'border-box' }}>
      <h1 style={{ marginBottom: '10px' }}>MNE Instrumentation App</h1>

      <ReactFlowProvider>
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => {
              const id = `node-${Date.now()}`;
              const newNode = {
                id,
                type: 'default',
                position: { x: 250, y: 150 + nodes.length * 50 },
                data: { label: '', metadata: {} },
              };
              setPendingNode(newNode);
              setMetadataModalOpen(true);
            }}
          >
            Add Node
          </button>

          <button onClick={downloadJson} disabled={nodes.length === 0}>
            Download DAG config
          </button>

          <button onClick={handleRunClick}>
            Run
          </button>
        </div>

        <div style={{ flexGrow: 1, border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          <DagEditor
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            onNodeSelect={handleNodeSelect}
          />
        </div>

        <MetadataModal
          open={metadataModalOpen || !!selectedNodeId}
          node={pendingNode || nodes.find((n) => n.id === selectedNodeId)}
          onClose={() => {
            setMetadataModalOpen(false);
            setPendingNode(null);
            setSelectedNodeId(null);
          }}
          onUpdate={(id, data) => {
            if (pendingNode) {
              handleSaveNewNode(data);
            } else {
              handleNodeUpdate(id, data);
            }
          }}
          onRemove={(id) => {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
            setSelectedNodeId(null);
          }}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
