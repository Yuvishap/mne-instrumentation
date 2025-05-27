import time
from matplotlib import pyplot as plt
import mne

_VISUALIZATION_CHANNELS = 15
_VISUALIZATION_SCALING = dict(eeg=1e-4, eog=1e-4, eyegaze=5e2, pupil=5e2)

def run(metadata: dict, log_path: str, cache: dict):
    with open(log_path, "w") as log_file:
        log_file.write("[INFO] Starting Plot Channels visualization...\n")

        raw = cache.get("file_in_use")
        if raw is None:
            msg = "[ERROR] No raw file found in cache. You must run Input File first.\n"
            log_file.write(msg)
            raise RuntimeError(msg)

        n_channels = int(metadata.get("n_channels", _VISUALIZATION_CHANNELS))
        block = str(metadata.get("block", True)).lower() in ["true", "1"]
        title = metadata.get("title", "EEG Channel Overview")

        try:
            log_file.write(f"[INFO] Plotting {n_channels} channels. Block: {block}, Title: {title}\n")

            raw.plot(
                n_channels=n_channels,
                scalings=_VISUALIZATION_SCALING,
                title=title,
                block=block,
            )

            log_file.write("[INFO] Channel plot displayed successfully.\n")

            # 🧠 Log impactful changes
            bads = raw.info.get("bads", [])
            if bads:
                log_file.write(f"[INFO] Bad channels marked: {', '.join(bads)}\n")
            else:
                log_file.write("[INFO] No bad channels marked.\n")

            annotations = raw.annotations
            if annotations and len(annotations):
                log_file.write("[INFO] Annotations added:\n")
                for ann in annotations:
                    log_file.write(f"  - Onset: {ann['onset']}s, Duration: {ann['duration']}s, Description: {ann['description']}\n")
            else:
                log_file.write("[INFO] No annotations added.\n")

        except Exception as e:
            msg = f"[ERROR] Failed to plot channels: {e}\n"
            log_file.write(msg)
            raise RuntimeError(msg)

        time.sleep(1)
        log_file.write("[INFO] Completed Plot Channels step.\n")
