import os
import sys
import urllib.request
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_URL = "https://raw.githubusercontent.com/google-coral/test_data/master/ssd_mobilenet_v2_coco_quant_postprocess.tflite"
LABELS_URL = "https://raw.githubusercontent.com/google-coral/test_data/master/coco_labels.txt"

MODEL_PATH = MODEL_DIR / "mobilenet_ssd_v2_coco.tflite"
LABELS_PATH = MODEL_DIR / "coco_labels.txt"

def download_file(url: str, dest_path: Path):
    if dest_path.exists() and dest_path.stat().st_size > 0:
        print(f"File already exists: {dest_path}")
        return

    print(f"Downloading from {url} to {dest_path} ...")
    try:
        urllib.request.urlretrieve(url, str(dest_path))
        print(f"Successfully downloaded to {dest_path}")
    except Exception as e:
        print(f"Download failed: {e}")

def main():
    download_file(MODEL_URL, MODEL_PATH)
    download_file(LABELS_URL, LABELS_PATH)

if __name__ == "__main__":
    main()
