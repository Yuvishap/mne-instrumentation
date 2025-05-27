import React, { useState, useEffect, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DagEditor from './components/DagEditor';
import MetadataModal from './components/MetadataModal';
import './App.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [pendingNode, setPendingNode] = useState(null);
  const [metadataModalOpen, setMetadataModalOpen] = useState(false);
  const [dagId, setDagId] = useState(null);
  const [nodeLogs, setNodeLogs] = useState({});
  const [fullLogs, setFullLogs] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const pollingRef = useRef(null);

  const handleNodeSelect = async (id) => {
    const node = nodes.find(n => n.id === id);
    setSelectedNodeId(id);

    if (dagId && node?.data?.metadata?.status === "failed") {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/logs/${dagId}/${id}`);
        const data = await res.json();
        setNodeLogs((prev) => ({ ...prev, [id]: data.logs }));
      } catch (err) {
        setNodeLogs((prev) => ({ ...prev, [id]: "Failed to load logs." }));
      }
    }
  };

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
      const body = {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.data.metadata.Type,
          metadata: n.data.metadata,
        })),
        edges: edges.map(e => ({
          source: e.source,
          target: e.target,
        })),
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { dag_id } = await res.json();
      setDagId(dag_id);
      startPolling(dag_id);
    } catch (err) {
      toast.error("❌ Failed to start pipeline");
    }
  };

  const startPolling = (dag_id) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/status/${dag_id}`);
        const status = await res.json();

        const updatedNodes = nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            metadata: { ...n.data.metadata, status: status[n.id] || 'pending' },
          },
        }));

        setNodes(updatedNodes);

        const allStatuses = Object.values(status);
        const done = allStatuses.every(s => s === 'success') || allStatuses.includes('failed');
        if (done) {
          stopPolling();
          if (allStatuses.includes('failed')) {
            toast.error("❌ Pipeline failed");
          } else {
            toast.success("✅ Pipeline completed successfully");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        toast.error("❌ Failed to fetch pipeline status");
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const fetchFullLogs = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/logs/${dagId}`);
      const { logs } = await res.json();
      setFullLogs(logs);
      setShowLogModal(true);
    } catch (err) {
      toast.error("Failed to fetch full logs.");
    }
  };

  const completedNodes = nodes.filter(n => n.data?.metadata?.status === "success").length;
  const totalNodes = nodes.length;
  const progressPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  const isPipelineDone = nodes.length > 0 && nodes.every(n => ['success',].includes(n.data?.metadata?.status));
  const isPipelineFailed = nodes.length > 0 && nodes.some(n => ['failed'].includes(n.data?.metadata?.status));

  return (
    <div className="app-container">
      <h1>MNE Instrumentation App</h1>

      <ReactFlowProvider>
        <div className="app-toolbar">
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

          <button onClick={handleRunClick}>Run</button>

          {(isPipelineDone || isPipelineFailed) && (
            <button onClick={fetchFullLogs}>View Full Logs</button>
          )}

          {dagId && (
            <div className="app-progress">
              Progress: {completedNodes}/{totalNodes} ({progressPercent}%)
            </div>
          )}
        </div>

        <div className="app-dag-container">
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
          logs={nodeLogs[selectedNodeId] || ""}
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

      {showLogModal && (
        <div className="log-modal">
          <div className="log-modal-content">
            <h3>Pipeline Logs</h3>
            <pre>{fullLogs}</pre>
            <button onClick={() => setShowLogModal(false)}>Close</button>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;
