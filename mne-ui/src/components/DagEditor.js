import React, { useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

function DagEditor({ nodes, setNodes, edges, setEdges, onNodeSelect }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const onNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const onConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  const onNodeClick = (event, node) => {
    setSelectedNodeId(node.id);
    if (onNodeSelect) {
      onNodeSelect(node.id);
    }
  };

  const addNode = () => {
    const id = `node_${+new Date()}`;
    const newNode = {
      id,
      type: 'default',
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
      },
      data: { label: `Node ${nodes.length + 1}`, metadata: {} },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const removeSelectedNode = () => {
    if (!selectedNodeId) return;

    // Remove node
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));

    // Remove edges connected to this node
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );

    setSelectedNodeId(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          marginBottom: 8,
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-start',
        }}
      >
        <button onClick={addNode}>Add Node</button>
        <button onClick={removeSelectedNode} disabled={!selectedNodeId}>
          Remove Selected Node
        </button>
      </div>

      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default DagEditor;
