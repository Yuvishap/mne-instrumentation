import os
import json
from typing import Dict
from data_model.dag import DAG, Node
from utils.dag_utils import topological_sort, execute_node

class DAGOrchestrator:
    def __init__(self, base_dir="runs"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def init_dag(self, dag_id: str, dag: DAG):
        dag_path = os.path.join(self.base_dir, dag_id)
        os.makedirs(os.path.join(dag_path, "logs"), exist_ok=True)

        status = {node.id: "pending" for node in dag.nodes}
        with open(os.path.join(dag_path, "status.json"), "w") as f:
            json.dump(status, f)

    def run_dag(self, dag_id: str, dag: DAG):
        dag_path = os.path.join(self.base_dir, dag_id)
        status_path = os.path.join(dag_path, "status.json")

        with open(status_path, "r") as f:
            status = json.load(f)

        sorted_nodes = topological_sort(dag.nodes, dag.edges)

        for node in sorted_nodes:
            status[node.id] = "running"
            self._save_status(status_path, status)

            try:
                execute_node(node, dag_path)
                status[node.id] = "success"
            except Exception as e:
                status[node.id] = "failed"
                log_path = os.path.join(dag_path, "logs", f"{node.id}.log")
                with open(log_path, "w") as log_file:
                    log_file.write(str(e))
                break

            self._save_status(status_path, status)

    def _save_status(self, path, status: Dict):
        with open(path, "w") as f:
            json.dump(status, f)

    def get_status(self, dag_id: str):
        status_path = os.path.join(self.base_dir, dag_id, "status.json")
        if not os.path.exists(status_path):
            raise FileNotFoundError(f"No status found for DAG {dag_id}")
        with open(status_path, "r") as f:
            return json.load(f)

    def get_logs(self, dag_id: str, node_id: str):
        log_path = os.path.join(self.base_dir, dag_id, "logs", f"{node_id}.log")
        if not os.path.exists(log_path):
            raise FileNotFoundError(f"No logs found for node {node_id}")
        with open(log_path, "r") as f:
            return f.read()
