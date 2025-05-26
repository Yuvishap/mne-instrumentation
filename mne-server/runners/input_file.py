import time

def run(metadata: dict, log_path: str):
    with open(log_path, "w") as log_file:
        log_file.write("Starting Input File processing...\n")
        # Simulate processing
        time.sleep(5)
        log_file.write("Completed Input File processing.\n")
