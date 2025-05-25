import time

def run(metadata: dict, log_path: str):
    with open(log_path, "w") as log_file:
        log_file.write("Starting Noth Filter processing...\n")
        # Simulate processing
        time.sleep(5)
        log_file.write("Completed Notch Filter processing.\n")
