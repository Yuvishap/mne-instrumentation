# 🧠 MNE DAG Orchestrator

This project is an interactive, containerized EEG preprocessing pipeline tool using [MNE-Python](https://mne.tools/stable/index.html). Users can visually construct a Directed Acyclic Graph (DAG) of processing steps and execute them with live progress updates.

---

## ✨ Features

- ✅ Visual DAG editor with React Flow
- ✅ Configurable node types:
- ✅ GUI plotting using MNE inside Docker via VcXsrv
- ✅ Scrollable UI-based log viewer with full logs for each node 
- ✅ Automatic file sharing via Docker volume

---

## 🧰 Tech Stack

| Layer     | Technology         |
|-----------|--------------------|
| Frontend  | React, React Flow  |
| Backend   | FastAPI, MNE-Python|
| Orchestration | Docker Compose |
| Volume Sharing | Host ↔ Docker container |
| GUI Support in DOcker | VcXsrv (Windows only) |
| Logging   | Per-node logs, status polling |

---

## 🛠️ Setup Instructions

### 1️⃣ Prerequisites

#### 🐳 Docker Desktop for Windows

1. Download: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Choose the correct installer for your system (AMD64 or ARM64).
3. Install and run Docker Desktop.
4. Make sure Docker is running before continuing.

---

#### 🪟 VcXsrv for GUI (Plotting)

1. Download from: [https://sourceforge.net/projects/vcxsrv/](https://sourceforge.net/projects/vcxsrv/)
2. Install and launch VcXsrv with:
   - ✅ Multiple windows
   - ✅ Start no client
   - ✅ Disable access control
3. Leave VcXsrv open while using the app to enable MNE's interactive plots.

---

### 2️⃣ Clone the Repository

Open terminal and navigate to the folder you would like to store the project in. Run:

```bash
git clone [https://github.com/YOUR_USERNAME/mne-dag-tool](https://github.com/Yuvishap/mne-instrumentation.git
cd mne-instrumentation
```

### 3️⃣ Build and Run the App

```bash
docker compose up --build
```

This will:

* Build and start both client and server containers
* Expose:
   * Frontend at http://localhost:3000
   * Backend API at http://localhost:5000
   * Mount a shared data volume at ./data

### 4️⃣ Use the App
1. Create a data folder in the root of the project (same level as mne-server, mne-client folders)
2. Place .fif files into the ./data folder.
3. Open your browser and go to http://localhost:3000.
4. Click Add Node, select a Type, and fill in mandatory fields.
5. Connect nodes to represent your EEG processing DAG.
6. Press Run to execute the pipeline.
7. View real-time logs and node statuses.
8. Final processed .fif files will be available in ./data if the "Output File" node is used.
