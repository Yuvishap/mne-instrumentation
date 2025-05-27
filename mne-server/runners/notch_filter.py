import time

def run(metadata: dict, log_path: str, cache: dict):
    with open(log_path, "w") as log_file:
        log_file.write("[INFO] Starting Notch Filter processing...\n")

        freq = metadata.get("frequency")
        include_eog = metadata.get("include eog", True)
        raw = cache.get("file_in_use")

        if raw is None:
            msg = "[ERROR] No raw file loaded in cache. Input File must run first.\n"
            log_file.write(msg)
            raise RuntimeError(msg)

        if not freq or float(freq) <= 0:
            msg = f"[ERROR] Invalid frequency: {freq}\n"
            log_file.write(msg)
            raise ValueError(msg)

        try:
            picks = 'all' if include_eog else raw.pick_types(eeg=True, eog=False)
            log_file.write(f"[INFO] Applying notch filter at {freq} Hz (include EOG: {include_eog})...\n")

            raw.notch_filter(freqs=[float(freq)], picks=picks, verbose='error')
            log_file.write("[INFO] Notch filter applied successfully.\n")

            # 🧠 Add verification/logging insights
            log_file.write("[INFO] Notch filter summary:\n")
            log_file.write(f"  - Duration (s): {raw.times[-1]:.2f}\n")
            log_file.write(f"  - Shape: {raw._data.shape} (channels x samples)\n")
            log_file.write(f"  - Channel Types: {raw.get_channel_types()}\n")
            log_file.write(f"  - Data Mean: {raw.get_data().mean():.3e}, Std: {raw.get_data().std():.3e}\n")

            cache["file_in_use"] = raw

        except Exception as e:
            msg = f"[ERROR] Notch filter failed: {e}\n"
            log_file.write(msg)
            raise RuntimeError(msg)

        time.sleep(2)
        log_file.write("[INFO] Completed Notch Filter processing.\n")
