// MetadataModal.jsx
import React, { useState, useEffect } from 'react';
import './MetadataModal.css';

const MetadataModal = ({ open, node, onClose, onUpdate }) => {
  const [label, setLabel] = useState('');
  const [metadata, setMetadata] = useState({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      setMetadata(node.data.metadata || {});
    }
  }, [node]);

  const updateMetadata = (key, value) => {
    const updated = { ...metadata, [key]: value };
    setMetadata(updated);
    onUpdate(node.id, { ...node.data, label, metadata: updated });
  };

  const removeMetadataKey = (key) => {
    const updated = { ...metadata };
    delete updated[key];
    setMetadata(updated);
    onUpdate(node.id, { ...node.data, label, metadata: updated });
  };

  const addMetadataField = () => {
    if (!newKey.trim()) {
      alert('Please enter a metadata key.');
      return;
    }
    updateMetadata(newKey.trim(), newValue);
    setNewKey('');
    setNewValue('');
  };

  const saveChanges = () => {
    onUpdate(node.id, { ...node.data, label, metadata });
    onClose();
  };

  if (!open || !node) return null;

  return (
    <div className="metadata-modal">
      <div className="metadata-modal-content">
        <h3>Edit Metadata</h3>
        <label>
          Label:
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>

        <div className="metadata-fields">
          {Object.entries(metadata).map(([key, val]) => (
            <div key={key} className="metadata-field">
              <input type="text" value={key} readOnly />
              <input
                type="text"
                value={val}
                onChange={(e) => updateMetadata(key, e.target.value)}
              />
              <button onClick={() => removeMetadataKey(key)}>&times;</button>
            </div>
          ))}
        </div>

        <div className="add-metadata">
          <input
            type="text"
            placeholder="New key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            type="text"
            placeholder="New value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button onClick={addMetadataField}>Add Field</button>
        </div>

        <div className="modal-actions">
          <button onClick={saveChanges}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default MetadataModal;