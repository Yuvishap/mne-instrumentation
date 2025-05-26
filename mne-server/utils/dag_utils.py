import os
from typing import List, Dict
from collections import defaultdict, deque
from data_model.dag import Node
import threading
from runners import input_file, notch_filter, plot_channels, output_file

def topological_sort(nodes: List[Node], edges: List[Dict]) -> List[Node]:
    graph = defaultdict(list)
    in_degree = {node.id: 0 for node in nodes}
    node_map = {node.id: node for node in nodes}

    for edge in edges:
        graph[edge.source].append(edge.target)
        in_degree[edge.target] += 1

    queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
    sorted_nodes = []

    while queue:
        current = queue.popleft()
        sorted_nodes.append(node_map[current])
        for neighbor in graph[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(sorted_nodes) != len(nodes):
        raise Exception("Cycle detected in DAG")

    return sorted_nodes

def execute_node(node: Node, dag_path: str):
    log_path = os.path.join(dag_path, "logs", f"{node.id}.log")
    if node.type == "Input File":
        input_file.run(node.metadata, log_path)
    elif node.type == "Notch Filter":
        notch_filter.run(node.metadata, log_path)
    elif node.type == "Plot Channels":
        plot_channels.run(node.metadata, log_path)
    elif node.type == "Output File":
        output_file.run(node.metadata, log_path)
    else:
        raise Exception(f"Unknown node type: {node.type}")
