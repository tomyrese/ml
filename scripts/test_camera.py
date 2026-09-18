import time
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from PIL import Image
from src.config import config
from src.hardware.camera_service import CameraService

def main():
    print("=== CAMERA HARDWARE TEST ===")
    cam = CameraService(config)
    ok = cam.start()
    if not ok:
        print("ERROR: Camera failed to initialize.")
        sys.exit(1)

    print("Camera initialized. Capturing frames for 3 seconds...")
    start_time = time.monotonic()
    frames_captured = 0
    last_frame = None

    while time.monotonic() - start_time < 3.0:
        frame, ts = cam.get_latest_frame()
        if frame is not None:
            frames_captured += 1
            last_frame = frame
        time.sleep(0.03)

    cam.stop()

    duration = time.monotonic() - start_time
    calc_fps = frames_captured / duration if duration > 0 else 0.0

    print(f"Test Duration: {duration:.2f}s")
    print(f"Frames Captured: {frames_captured}")
    print(f"Calculated FPS: {calc_fps:.1f}")

    if last_frame is not None:
        out_path = Path(__file__).resolve().parent.parent / "test_frame.jpg"
        img = Image.fromarray(last_frame)
        img.save(str(out_path))
        print(f"Frame shape: {last_frame.shape}")
        print(f"Saved test frame to: {out_path}")
        print("Camera test PASSED.")
    else:
        print("ERROR: No valid frames were captured.")
        sys.exit(1)

if __name__ == "__main__":
    main()
