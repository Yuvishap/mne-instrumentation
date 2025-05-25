from pydantic import BaseModel
from typing import List, Dict

class Node(BaseModel):
    id: str
    type: str
    metadata: Dict

class Edge(BaseModel):
    source: str
    target: str

class DAG(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
