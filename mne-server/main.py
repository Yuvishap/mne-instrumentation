import os
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import uuid
import os
import json
import threading
from utils.dag_utils import topological_sort, execute_node
from orchestrator.dag_runner import DAGOrchestrator
from data_model.dag import DAG

app = FastAPI()
orchestrator = DAGOrchestrator()

server_shared_path = os.environ.get("SERVER_SHARED_DATA_PATH", "/app/shared/")
SHARED_DIR = Path(server_shared_path)
RUNS_DIR = "runs"
os.makedirs(RUNS_DIR, exist_ok=True)

app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/files")
def list_files():
    return [(f.name, str(f).replace(server_shared_path, "")) for f in SHARED_DIR.glob("*") if f.is_file()]


@app.post("/run")
def run_dag(dag: DAG, background_tasks: BackgroundTasks):
    dag_id = str(uuid.uuid4())
    orchestrator.init_dag(dag_id, dag)
    background_tasks.add_task(orchestrator.run_dag, dag_id, dag)
    return {"dag_id": dag_id}

@app.get("/status/{dag_id}")
def get_status(dag_id: str):
    try:
        return orchestrator.get_status(dag_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="DAG not found")

@app.get("/logs/{dag_id}/{node_id}")
def get_logs(dag_id: str, node_id: str):
    try:
        return {"logs": orchestrator.get_logs(dag_id, node_id)}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Logs not found")

@app.get("/logs/{dag_id}")
def get_full_logs(dag_id: str):
    logs_dir = os.path.join(RUNS_DIR, dag_id, "logs")
    if not os.path.exists(logs_dir):
        raise HTTPException(status_code=404, detail="Logs not found")

    logs_output = ""
    for fname in sorted(os.listdir(logs_dir)):
        fpath = os.path.join(logs_dir, fname)
        with open(fpath, "r") as f:
            logs_output += f"\n\n===== {fname} =====\n"
            logs_output += f.read()

    return {"logs": logs_output}