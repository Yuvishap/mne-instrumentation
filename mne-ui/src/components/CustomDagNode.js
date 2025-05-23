import React from 'react';
import './CustomDagNode.css';
import { Handle, Position } from 'reactflow';
import { MoreVertical } from 'lucide-react';

const CustomDagNode = ({ id, data }) => {
  const handleOpenMetadata = () => {
    if (data.onEditMetadata) {
      data.onEditMetadata(id);
    }
  };

  return (
    <div className="custom-node">
      <div className="custom-node-header">
        <span className="custom-node-label">{data.label}</span>
        <button className="custom-node-menu" onClick={handleOpenMetadata}>
          <MoreVertical size={16} />
        </button>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomDagNode;
