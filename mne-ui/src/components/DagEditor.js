import React from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

function DagEditor({ nodes, setNodes, edges, setEdges, onNodeSelect }) {
  const onNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const onConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  const onNodeClick = (_, node) => {
    onNodeSelect(node.id);
  };

  const getNodeStyle = (status) => {
    const colors = {
      success: '#d4edda',
      failed: '#f8d7da',
      running: '#fff3cd',
      pending: '#d1ecf1',
    };
    return {
      border: '2px solid black',
      background: colors[status] || '#ffffff',
    };
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes.map((n) => ({
          ...n,
          style: getNodeStyle(n.data?.metadata?.status),
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default DagEditor;
