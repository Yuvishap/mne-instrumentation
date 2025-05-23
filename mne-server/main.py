import os
from fastapi import FastAPI
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/ping")
def ping():
    file_path = SHARED_DIR / "test_write"

    # Create an empty file
    file_path.touch()
    return {"message": "pong"}

server_shared_path = os.environ.get("SERVER_SHARED_DATA_PATH", "/app/shared")
local_shared_path = os.environ.get("LOCAL_SHARED_DATA_PATH", "/shared_files")
SHARED_DIR = Path(server_shared_path)

@app.get("/files")
def list_files():
    return [(f.name, str(f).replace(server_shared_path, local_shared_path)) for f in SHARED_DIR.glob("*") if f.is_file()]
