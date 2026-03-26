try:
    import smbus
except ImportError:
    try:
        import smbus2 as smbus
    except ImportError:
        # If both fail, we will catch this during initialization
        smbus = None
import time
import threading
import numpy as np

class MAX30102:
    """
    A fully integrated MAX30102 driver.
    Combines I2C communication, background threading, and
    the Maxim Heart Rate/SpO2 algorithm.
    """

    # --- Constants for the Algorithm ---
    SAMPLE_FREQ = 25
    MA_SIZE = 4
    BUFFER_SIZE = 100

    def __init__(self, channel=1, address=0x57):
        self.address = address
        self.bus = smbus.SMBus(channel)

        self.bpm = 0
        self.spo2 = 0
        self.is_finger_detected = False
        self._running = False
        self._thread = None

        self.reset()
        time.sleep(1)
        self.setup()

    # --- Hardware Control ---
    def reset(self):
        self.bus.write_i2c_block_data(self.address, 0x09, [0x40])

    def setup(self):
        self.bus.write_i2c_block_data(self.address, 0x02, [0xc0]) # Intr Enable
        self.bus.write_i2c_block_data(self.address, 0x08, [0x4f]) # FIFO Config
        self.bus.write_i2c_block_data(self.address, 0x09, [0x03]) # Mode: SpO2
        self.bus.write_i2c_block_data(self.address, 0x0A, [0x27]) # SpO2 Config
        self.bus.write_i2c_block_data(self.address, 0x0C, [0x24]) # LED1 PA
        self.bus.write_i2c_block_data(self.address, 0x0D, [0x24]) # LED2 PA
        self.bus.write_i2c_block_data(self.address, 0x10, [0x7f]) # Pilot LED

    def _read_fifo(self):
        d = self.bus.read_i2c_block_data(self.address, 0x07, 6)
        red = (d[0] << 16 | d[1] << 8 | d[2]) & 0x03FFFF
        ir = (d[3] << 16 | d[4] << 8 | d[5]) & 0x03FFFF
        return red, ir

    # --- Integrated Calculation Logic (formerly hrcalc.py) ---
    def _calculate_vitals(self, ir_data, red_data):
        ir_mean = int(np.mean(ir_data))
        x = -1 * (np.array(ir_data) - ir_mean)

        for i in range(x.shape[0] - self.MA_SIZE):
            x[i] = np.sum(x[i:i+self.MA_SIZE]) / self.MA_SIZE

        n_th = int(np.mean(x))
        n_th = max(30, min(60, n_th))

        # Peak detection
        ir_valley_locs, n_peaks = self._find_peaks(x, self.BUFFER_SIZE, n_th, 4, 15)

        hr, hr_v, sp, sp_v = 0, False, 0, False

        if n_peaks >= 2:
            peak_interval_sum = 0
            for i in range(1, n_peaks):
                peak_interval_sum += (ir_valley_locs[i] - ir_valley_locs[i-1])
            peak_interval_sum = int(peak_interval_sum / (n_peaks - 1))
            hr = int(self.SAMPLE_FREQ * 60 / peak_interval_sum)
            hr_v = True

        # SpO2 Logic
        ratio = []
        for k in range(n_peaks - 1):
            red_dc_max, ir_dc_max = -16777216, -16777216
            red_dc_max_idx, ir_dc_max_idx = -1, -1

            if ir_valley_locs[k+1] - ir_valley_locs[k] > 3:
                for i in range(ir_valley_locs[k], ir_valley_locs[k+1]):
                    if ir_data[i] > ir_dc_max:
                        ir_dc_max = ir_data[i]
                        ir_dc_max_idx = i
                    if red_data[i] > red_dc_max:
                        red_dc_max = red_data[i]
                        red_dc_max_idx = i

                # AC components
                red_ac = red_data[red_dc_max_idx] - (red_data[ir_valley_locs[k]] + int((red_data[ir_valley_locs[k+1]] - red_data[ir_valley_locs[k]]) * (red_dc_max_idx - ir_valley_locs[k]) / (ir_valley_locs[k+1] - ir_valley_locs[k])))
                ir_ac = ir_data[ir_dc_max_idx] - (ir_data[ir_valley_locs[k]] + int((ir_data[ir_valley_locs[k+1]] - ir_data[ir_valley_locs[k]]) * (ir_dc_max_idx - ir_valley_locs[k]) / (ir_valley_locs[k+1] - ir_valley_locs[k])))

                if ir_ac > 0 and red_dc_max > 0:
                    nume = red_ac * ir_dc_max
                    denom = ir_ac * red_dc_max
                    ratio.append(int(((nume * 100) & 0xffffffff) / denom))

        if ratio:
            ratio = sorted(ratio)
            ratio_ave = ratio[int(len(ratio) / 2)]
            if 2 < ratio_ave < 184:
                sp = -45.060 * (ratio_ave**2) / 10000.0 + 30.054 * ratio_ave / 100.0 + 94.845
                sp_v = True

        return hr, hr_v, sp, sp_v

    def _find_peaks(self, x, size, min_height, min_dist, max_num):
        ir_valley_locs = []
        n_peaks = 0
        i = 1
        while i < size - 1:
            if x[i] > min_height and x[i] > x[i-1]:
                n_width = 1
                while i + n_width < size - 1 and x[i] == x[i+n_width]:
                    n_width += 1
                if x[i] > x[i+n_width] and n_peaks < max_num:
                    ir_valley_locs.append(i)
                    n_peaks += 1
                    i += n_width + 1
                else: i += n_width
            else: i += 1
        return ir_valley_locs, n_peaks

    # --- Main Background Thread ---
    def _main_loop(self):
        ir_data, red_data, bpms = [], [], []
        while self._running:
            r_ptr = self.bus.read_byte_data(self.address, 0x06)
            w_ptr = self.bus.read_byte_data(self.address, 0x04)
            num_samples = (w_ptr - r_ptr) % 32

            if num_samples > 0:
                # print(f"[DEBUG] MAX30102 - Samples available: {num_samples}")
                for _ in range(num_samples):
                    red, ir = self._read_fifo()
                    ir_data.append(ir)
                    red_data.append(red)
                    if len(ir_data) > self.BUFFER_SIZE:
                        ir_data.pop(0)
                        red_data.pop(0)

                if len(ir_data) == self.BUFFER_SIZE:
                    if np.mean(ir_data) < 30000: # Finger detection
                        if self.is_finger_detected:
                            print("[DEBUG] MAX30102 - Finger removed")
                        self.is_finger_detected = False
                        self.bpm, self.spo2 = 0, 0
                    else:
                        if not self.is_finger_detected:
                            print(f"[DEBUG] MAX30102 - Finger detected! Mean IR: {int(np.mean(ir_data))}")
                        self.is_finger_detected = True
                        hb, hb_v, sp, sp_v = self._calculate_vitals(ir_data, red_data)
                        if hb_v:
                            bpms.append(hb)
                            if len(bpms) > 4: bpms.pop(0)
                            self.bpm = int(np.mean(bpms))
                        if sp_v: self.spo2 = int(sp)
            time.sleep(0.05)

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._main_loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False
        if self._thread: self._thread.join()
        self.bus.write_i2c_block_data(self.address, 0x09, [0x80])