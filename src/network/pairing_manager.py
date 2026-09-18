import random
import string
import time
from typing import Optional, Tuple
from PIL import Image
import qrcode
from src.config import RobotConfig, config
from src.utils.network import get_ip_address
from src.services.logging_service import logger

class PairingManager:
    def __init__(self, cfg: Optional[RobotConfig] = None):
        self.cfg = cfg or config
        self.current_code: Optional[str] = None
        self.expires_at: float = 0.0
        self.host: str = "127.0.0.1"
        self.port: int = self.cfg.SERVER_PORT

    def _generate_random_code(self, length: int = 6) -> str:
        chars = "".join([c for c in string.ascii_uppercase + string.digits if c not in "01IO"])
        return "".join(random.choice(chars) for _ in range(length))

    def start_pairing(self, host: Optional[str] = None, port: Optional[int] = None) -> Tuple[str, str]:
        self.host = host or get_ip_address()
        self.port = port or self.cfg.SERVER_PORT
        self.current_code = self._generate_random_code(6)
        self.expires_at = time.monotonic() + self.cfg.PAIRING_CODE_TTL

        payload = f"P1|{self.host}|{self.port}|{self.current_code}"
        logger.info(f"PAIRING_OPEN code={self.current_code} ttl={self.cfg.PAIRING_CODE_TTL}s host={self.host}:{self.port}")
        return self.current_code, payload

    def is_pairing_active(self) -> bool:
        if self.current_code is None:
            return False
        if time.monotonic() >= self.expires_at:
            self.current_code = None
            return False
        return True

    def get_remaining_seconds(self) -> int:
        if not self.is_pairing_active():
            return 0
        return max(0, int(self.expires_at - time.monotonic()))

    def get_payload(self) -> Optional[str]:
        if not self.is_pairing_active():
            return None
        return f"P1|{self.host}|{self.port}|{self.current_code}"

    def validate_code(self, input_code: str) -> bool:
        if not self.is_pairing_active():
            return False
        if self.current_code.upper() == input_code.strip().upper():
            logger.info(f"PAIRING_SUCCESS code={self.current_code}")
            self.invalidate()
            return True
        logger.warning(f"PAIRING_FAILED invalid_code={input_code}")
        return False

    def invalidate(self):
        self.current_code = None
        self.expires_at = 0.0

    def generate_qr_image(self, target_size: int = 56) -> Optional[Image.Image]:
        payload = self.get_payload()
        if not payload:
            return None

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=1,
            border=1,
        )
        qr.add_data(payload)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white").convert("1")
        scale = max(1, target_size // img.size[0])
        new_size = (img.size[0] * scale, img.size[1] * scale)
        scaled_img = img.resize(new_size, resample=Image.NEAREST)
        return scaled_img
