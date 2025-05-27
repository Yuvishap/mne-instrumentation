import os
import time
import mne

def run(metadata: dict, log_path: str, cache: dict):
    with open(log_path, "w") as log_file:
        log_file.write("[INFO] Starting Input File processing...\n")

        file_name = metadata.get("file")
        shared_dir = os.environ.get("SERVER_SHARED_DATA_PATH", "/app/shared")
        full_path = os.path.join(shared_dir, file_name)

        if not file_name:
            log_file.write("[ERROR] No 'file' provided in metadata.\n")
            raise ValueError("No 'file' provided in metadata.")

        if not os.path.exists(full_path):
            msg = f"[ERROR] File does not exist: {full_path}\n"
            log_file.write(msg)
            raise FileNotFoundError(msg)

        try:
            log_file.write(f"[INFO] Loading file from: {full_path}\n")
            raw = mne.io.read_raw_fif(full_path, preload=True, verbose='error')
            log_file.write("[INFO] File successfully loaded.\n")

            info = raw.info
            log_file.write("[INFO] File Metadata Summary:\n")
            log_file.write(f"  - Sampling Frequency: {info['sfreq']} Hz\n")
            log_file.write(f"  - Number of Channels: {info['nchan']}\n")
            log_file.write(f"  - Channel Names: {', '.join(info['ch_names'])}\n")
            log_file.write(f"  - Highpass: {info['highpass']}, Lowpass: {info['lowpass']}\n")
            log_file.write(f"  - Line Frequency: {info.get('line_freq', 'N/A')} Hz\n")
            log_file.write(f"  - Bad Channels: {info.get('bads', [])}\n")
            if info.get('meas_date'):
                log_file.write(f"  - Measured On: {info['meas_date']}\n")

            cache["file_in_use"] = raw

        except Exception as e:
            msg = f"[ERROR] Failed to read FIF file: {e}\n"
            log_file.write(msg)
            raise RuntimeError(msg)

        time.sleep(2)
        log_file.write("[INFO] Completed Input File processing.\n")
