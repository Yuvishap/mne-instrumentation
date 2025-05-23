import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelected(null);
  };

  return (
    <div className="file-upload">
      <label htmlFor="fileInput">Upload EEG File</label>
      <input
        type="file"
        id="fileInput"
        onChange={handleFileChange}
        disabled={selectedFile !== null}
      />
      {selectedFile && (
        <div className="file-info">
          <p>Selected file: {selectedFile.name}</p>
          <button className="remove-button" onClick={handleRemoveFile}>
            Remove File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
