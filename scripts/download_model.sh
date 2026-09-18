#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MODEL_DIR="$ROOT_DIR/models"

mkdir -p "$MODEL_DIR"

MODEL_FILE="$MODEL_DIR/mobilenet_ssd_v2_coco.tflite"
LABELS_FILE="$MODEL_DIR/coco_labels.txt"

MODEL_URL="https://raw.githubusercontent.com/google-coral/test_data/master/ssd_mobilenet_v2_coco_quant_postprocess.tflite"
LABELS_URL="https://raw.githubusercontent.com/google-coral/test_data/master/coco_labels.txt"

if [ ! -f "$MODEL_FILE" ] || [ ! -s "$MODEL_FILE" ]; then
    echo "Downloading TFLite model..."
    curl -L -o "$MODEL_FILE" "$MODEL_URL" || wget -O "$MODEL_FILE" "$MODEL_URL"
else
    echo "Model already exists at $MODEL_FILE"
fi

if [ ! -f "$LABELS_FILE" ] || [ ! -s "$LABELS_FILE" ]; then
    echo "Downloading COCO labels..."
    curl -L -o "$LABELS_FILE" "$LABELS_URL" || wget -O "$LABELS_FILE" "$LABELS_URL"
else
    echo "Labels already exist at $LABELS_FILE"
fi

echo "Model download finished successfully."
