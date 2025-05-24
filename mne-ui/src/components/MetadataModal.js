import React, { useState, useEffect, useRef } from 'react';
import './MetadataModal.css';
import { NODE_METADATA_SCHEMAS, validateMetadata } from '../utils/nodeSchemas';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const MetadataModal = ({ open, node, onClose, onUpdate, onRemove }) => {
  const [label, setLabel] = useState('');
  const [metadata, setMetadata] = useState({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [type, setType] = useState('');
  const [errors, setErrors] = useState([]);
  const [fileOptions, setFileOptions] = useState([]);

  const typeOptions = Object.keys(NODE_METADATA_SCHEMAS);
  const metadataHistory = useRef({});

  const pendingNode = node && !node.data?.metadata?.Type;

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      const initial = node.data.metadata || {};
      setMetadata(initial);
      setType(initial?.Type || '');
      metadataHistory.current[initial?.Type || ''] = initial;
    }
  }, [node]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (type === 'Input File') {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/files`);
          const data = await res.json();
          setFileOptions(data);
        } catch (err) {
          console.error("Failed to fetch files:", err);
        }
      }
    };
    fetchFiles();
  }, [type]);

  const requiredFields = NODE_METADATA_SCHEMAS[type] || {};

  const handleFieldChange = (key, value) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const removeMetadataKey = (key) => {
    setMetadata((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const addMetadataField = () => {
    if (!newKey.trim()) {
      alert('Please enter a metadata key.');
      return;
    }
    handleFieldChange(newKey.trim(), newValue);
    setNewKey('');
    setNewValue('');
  };

  const getAllSchemaKeys = () => {
    const keys = {};
    for (const schema of Object.values(NODE_METADATA_SCHEMAS)) {
      for (const k of Object.keys(schema)) {
        keys[k] = true;
      }
    }
    return keys;
  };

  const handleSave = () => {
    const fullMetadata = { ...metadata, Type: type };
    const { valid, errors } = validateMetadata(type, fullMetadata);
    if (!valid) {
      setErrors(errors);
      return;
    }

    const allowedKeys = new Set([
      'Type',
      ...Object.keys(NODE_METADATA_SCHEMAS[type] || {})
    ]);

    const cleanedMetadata = Object.entries(fullMetadata).reduce((acc, [key, val]) => {
      if (allowedKeys.has(key) || !(key in getAllSchemaKeys())) {
        acc[key] = val;
      }
      return acc;
    }, {});

    metadataHistory.current[type] = cleanedMetadata;
    onUpdate(node.id, { label, metadata: cleanedMetadata });
    setErrors([]);
    onClose();
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    const schema = NODE_METADATA_SCHEMAS[newType] || {};
    const prev = metadataHistory.current[newType] || {};

    const preserved = {};
    for (const key of Object.keys(schema)) {
      preserved[key] = prev[key] ?? schema[key]?.default ?? '';
    }

    metadataHistory.current[newType] = { ...preserved, Type: newType };
    setMetadata({ ...preserved, Type: newType });
  };

  const optionalMetadataKeys = Object.keys(metadata).filter(
    (key) => key !== 'Type' && !(key in requiredFields)
  );

  const capitalize = (s) => s.replace(/(^\w|\s\w)/g, m => m.toUpperCase());

  if (!open || !node) return null;

  return (
    <div className="metadata-modal">
      <div className="metadata-modal-content">
        <h3>Edit Metadata</h3>

        <label>
          Type: 
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="">-- Select Type --</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Label:
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>

        {Object.entries(requiredFields).map(([key, config]) => {
          if (key === 'Type') return null;
          const tooltipId = `tooltip-${key}`;
          const isBoolean = config.type === "boolean";
          const inputValue = metadata[key] ?? config.default ?? (isBoolean ? false : '');

          return (
            <label key={key}>
              <span
                data-tooltip-id={tooltipId}
                data-tooltip-content={config.description || key}
                style={{ textDecoration: 'underline dotted', cursor: 'help' }}
              >
                {capitalize(key)}
              </span>

              {type === 'Input File' && key === 'file' ? (
                <select
                  value={metadata[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                >
                  <option value="">-- Select EEG File --</option>
                  {fileOptions.map(([name, path]) => (
                    <option key={path} value={path}>{name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={isBoolean ? "checkbox" : "text"}
                  value={!isBoolean ? inputValue : undefined}
                  checked={isBoolean ? inputValue : undefined}
                  onChange={(e) => {
                    const val = isBoolean ? e.target.checked : e.target.value;
                    handleFieldChange(key, val);
                  }}
                />
              )}

              <ReactTooltip id={tooltipId} place="right" />
            </label>
          );
        })}

        {optionalMetadataKeys.length > 0 && (
          <div className="metadata-fields">
            {optionalMetadataKeys.map((key) => (
              <div key={key} className="metadata-field">
                <input type="text" value={capitalize(key)} readOnly />
                <input
                  type="text"
                  value={metadata[key]}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                />
                <button onClick={() => removeMetadataKey(key)}>&times;</button>
              </div>
            ))}
          </div>
        )}

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

        {errors.length > 0 && (
          <div className="metadata-errors">
            <ul>
              {errors.map((err, idx) => <li key={idx} style={{ color: 'red' }}>{err}</li>)}
            </ul>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={handleSave} disabled={!type}>Save</button>
          <button onClick={onClose}>Close</button>
          {!pendingNode && (
            <button onClick={() => onRemove(node.id)} className="remove-button" style={{ color: 'red', marginLeft: 'auto' }}>
              🗑 Remove Node
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataModal;
