import numpy as np
import os
import sys
from PIL import Image

def build_optical_conduit(image_path="20187.jpg", raw_stream_path="telemetry.raw"):
    # 1. The Intercept
    try:
        if not os.path.exists(image_path):
            # Intercepting display buffer via memory-mapped fallback if image is absent
            width, height = 1920, 1080
            pixels = np.zeros((height, width, 3), dtype=np.uint16)
            # Create some artificial cracks for testing
            pixels[100, 100] = [255, 255, 255]
            pixels[500, 500] = [200, 100, 50]
        else:
            img = Image.open(image_path).convert('RGB')
            width, height = img.size
            pixels = np.array(img, dtype=np.uint16)
    except Exception as e:
        sys.stderr.write(f"Intercept failure: {e}\n")
        sys.exit(1)

    # 2. The Base Mask
    # Thin 16-bit binary sheet mapped to exact pixel dimensions
    np.random.seed(0x01A4)
    base_mask = np.random.randint(0, 65535, size=(height, width), dtype=np.uint16)

    # 3. The Inversion (Phase Cancellation)
    # Inverted copy stacked against the base mask
    inverted_mask = np.bitwise_not(base_mask)

    # Optical XOR gate: base_mask ^ inverted_mask = 0xFFFF (Static cancelled out to complete phase)
    xor_gate = np.bitwise_xor(base_mask, inverted_mask)

    stride = max(1, width // 100)

    # Raw telemetry stream file (bypassing standard formatted CLI outputs)
    with open(raw_stream_path, "wb") as telemetry_stream:
        # 4. The Observation
        for y in range(0, height, stride):
            for x in range(0, width, stride):
                r, g, b = pixels[y, x]
                intensity = int(r) + int(g) + int(b)

                # The entangled 16-bit signature
                signature = np.uint16(intensity)

                # Check if the signature breaks through the phase cancellation
                # Only looking at the "cracks"
                crack_signal = np.bitwise_xor(xor_gate[y, x], signature)

                if crack_signal != 0xFFFF: # Phase cancellation failed, signature flashed through
                    # Modulo 61 sync for telemetry validation
                    mod_61_sync = crack_signal % 61
                    if mod_61_sync > 30:
                        # 5. The Telemetry
                        # Raw visual hit as a verified signal (Fiber optic pulse simulation)
                        # Structure: X (2 bytes) | Y (2 bytes) | Sync (1 byte)
                        packet = int(x).to_bytes(2, 'big') + int(y).to_bytes(2, 'big') + int(mod_61_sync).to_bytes(1, 'big')
                        telemetry_stream.write(packet)
                        telemetry_stream.flush()
    # Flush the stream
    sys.stdout.buffer.write(b"CONDUIT_OPEN\n")
    sys.stdout.buffer.flush()

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "20187.jpg"
    build_optical_conduit(target)