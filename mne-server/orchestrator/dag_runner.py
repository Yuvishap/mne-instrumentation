import os
import traceback
from utils.dag_utils import topological_sort
from utils.dag_utils import execute_node
from data_model.dag import DAG

class DAGOrchestrator:
    def __init__(self):
        self._status = {}
        self._cache = {}  # 🧠 in-memory cache for raw data

    def init_dag(self, dag_id: str, dag: DAG):
        self._status[dag_id] = {node.id: "pending" for node in dag.nodes}
        self._cache[dag_id] = {"file_in_use": None}

    def run_dag(self, dag_id: str, dag: DAG):
        dag_dir = os.path.join("runs", dag_id)
        logs_dir = os.path.join(dag_dir, "logs")
        os.makedirs(logs_dir, exist_ok=True)

        cache = self._cache.get(dag_id, {})

        try:
            for node in topological_sort(dag.nodes, dag.edges):
                self._status[dag_id][node.id] = "running"
                log_path = os.path.join(logs_dir, f"{node.id}.log")

                execute_node(node, dag_dir, log_path, cache)

                self._status[dag_id][node.id] = "success"

        except Exception as e:
            self._status[dag_id][node.id] = "failed"
            print(f"[ERROR] Node {node.id} failed: {e}")
            print("[TRACEBACK]\n")
            print(traceback.format_exc())


        self._cache.pop(dag_id, None)

    def get_status(self, dag_id: str):
        return self._status.get(dag_id, {})

    def get_logs(self, dag_id: str, node_id: str):
        log_path = os.path.join("runs", dag_id, "logs", f"{node_id}.log")
        with open(log_path, "r") as f:
            return f.read()
