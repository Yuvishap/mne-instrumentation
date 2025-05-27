import mne
import os

def run(metadata: dict, log_path: str, cache: dict):
    with open(log_path, "w") as log_file:
        log_file.write("[INFO] Starting Output File export...\n")

        if not isinstance(metadata, dict):
            msg = f"[ERROR] Invalid metadata format: {metadata}\n"
            log_file.write(msg)
            raise ValueError(msg)

        raw = cache.get("file_in_use")
        if raw is None:
            msg = "[ERROR] No raw file found in cache. You must run Input File first.\n"
            log_file.write(msg)
            raise RuntimeError(msg)

        out_path = metadata.get("path")
        if not out_path:
            msg = "[ERROR] Output file path not provided in metadata.\n"
            log_file.write(msg)
            raise ValueError(msg)

        local_shared_folder = os.environ.get("LOCAL_SHARED_DATA_PATH", "/data/")
        server_shared_folder = os.environ.get("SERVER_SHARED_DATA_PATH", "/app/shared/")
        full_path = os.path.join(server_shared_folder, out_path)

        try:
            raw.save(full_path, overwrite=True)
            log_file.write(f"[INFO] File saved to {full_path.replace(server_shared_folder, local_shared_folder)}\n")
        except Exception as e:
            msg = f"[ERROR] Failed to save file: {e}\n"
            log_file.write(msg)
            raise
