from dataclasses import dataclass, field
from typing import List, Tuple

@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: Tuple[float, float, float, float]
    center_x: float
    center_y: float
    area_ratio: float
    in_stop_zone: bool
    timestamp: float

@dataclass
class FrameDetections:
    timestamp: float
    detections: List[Detection] = field(default_factory=list)
    has_person_in_stop_zone: bool = False
    max_confidence_in_stop_zone: float = 0.0
    inference_time_ms: float = 0.0
