import os
import sys
import time
import requests
import joblib
import numpy as np
import pandas as pd
from scapy.all import sniff, IP, TCP, UDP

# Add project root to sys.path to allow imports from utils
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(BASE_DIR))

from utils.preprocess_input import preprocess_input

# Configuration
API_URL = "https://cyber-sentinelai.onrender.com"
API_MODEL = "random_forest"  # Model to use on the backend (must match a model loaded in app.py)

flows = {}

def get_flow_key(packet):
    if packet.haslayer(TCP):
        proto = 6
        sport = packet[TCP].sport
        dport = packet[TCP].dport
    elif packet.haslayer(UDP):
        proto = 17
        sport = packet[UDP].sport
        dport = packet[UDP].dport
    else:
        return None

    src = packet[IP].src
    dst = packet[IP].dst

    return (src, dst, sport, dport, proto)


def process_packet(packet):
    if not packet.haslayer(IP):
        return

    key = get_flow_key(packet)
    if key is None:
        return

    current_time = time.time()
    length = len(packet)

    if key not in flows:
        flows[key] = {
            "start_time": current_time,
            "last_seen": current_time,
            "fwd_packets": 0,
            "bwd_packets": 0,
            "fwd_bytes": 0,
            "bwd_bytes": 0,
            "fwd_packet_lengths": [],
            "bwd_packet_lengths": [],
            "packet_times": [],
            "flags": {
                "FIN": 0,
                "SYN": 0,
                "RST": 0,
                "PSH": 0,
                "ACK": 0,
                "URG": 0,
                "ECE": 0,
                "CWE": 0
            }
        }

    flow = flows[key]
    flow["last_seen"] = current_time
    flow["packet_times"].append(current_time)

    if packet[IP].src == key[0]:
        flow["fwd_packets"] += 1
        flow["fwd_bytes"] += length
        flow["fwd_packet_lengths"].append(length)
    else:
        flow["bwd_packets"] += 1
        flow["bwd_bytes"] += length
        flow["bwd_packet_lengths"].append(length)

    if packet.haslayer(TCP):
        flags = packet[TCP].flags
        if flags & 0x01: flow["flags"]["FIN"] += 1
        if flags & 0x02: flow["flags"]["SYN"] += 1
        if flags & 0x04: flow["flags"]["RST"] += 1
        if flags & 0x08: flow["flags"]["PSH"] += 1
        if flags & 0x10: flow["flags"]["ACK"] += 1
        if flags & 0x20: flow["flags"]["URG"] += 1
        if flags & 0x40: flow["flags"]["ECE"] += 1
        if flags & 0x80: flow["flags"]["CWE"] += 1


MODEL_PATH = os.path.join(BASE_DIR, "saved_models", "random_forest_ddos.joblib")
model = joblib.load(MODEL_PATH)

# --- Backend Health Check & Model Sync ---
print(f"Checking backend health at {API_URL}...")
try:
    resp = requests.get(f"{API_URL}/", timeout=5)
    if resp.status_code == 200:
        data = resp.json()
        available = data.get('available_models', [])
        print(f"Backend Online. Available Models: {available}")
        
        if API_MODEL not in available:
            if available:
                print(f"Warning: Configured model '{API_MODEL}' not found on backend.")
                print(f"Switching to '{available[0]}' automatically.")
                API_MODEL = available[0]
            else:
                print("CRITICAL: No models loaded on the backend!")
                print("Ensure you have pushed the .joblib files to backend/saved_models/ on GitHub.")
                sys.exit(1)
    else:
        print(f"Backend returned status {resp.status_code}")
except Exception as e:
    print(f"Could not connect to backend: {e}")

try:
    while True:
        flows = {}  # Reset flows for the new window
        print("Capturing packets for 10 seconds...")
        sniff(timeout=10, prn=process_packet)

        print("\nEvaluating Flows...\n")

        for key, flow in flows.items():

            duration = flow["last_seen"] - flow["start_time"]
            if duration <= 0:
                continue

            total_packets = flow["fwd_packets"] + flow["bwd_packets"]
            total_bytes = flow["fwd_bytes"] + flow["bwd_bytes"]

            fwd_pkt_lengths = flow["fwd_packet_lengths"]
            bwd_pkt_lengths = flow["bwd_packet_lengths"]

            flow_iat = np.diff(flow["packet_times"])
            flow_iat_mean = np.mean(flow_iat) if len(flow_iat) > 0 else 0
            flow_iat_std = np.std(flow_iat) if len(flow_iat) > 0 else 0
            flow_iat_max = np.max(flow_iat) if len(flow_iat) > 0 else 0
            flow_iat_min = np.min(flow_iat) if len(flow_iat) > 0 else 0

            feature_dict = {
                "Source Port": key[2],
                "Destination Port": key[3],
                "Protocol": key[4],
                "Flow Duration": duration,
                "Total Fwd Packets": flow["fwd_packets"],
                "Total Backward Packets": flow["bwd_packets"],
                "Total Length of Fwd Packets": flow["fwd_bytes"],
                "Total Length of Bwd Packets": flow["bwd_bytes"],
                "Fwd Packet Length Max": max(fwd_pkt_lengths) if fwd_pkt_lengths else 0,
                "Fwd Packet Length Min": min(fwd_pkt_lengths) if fwd_pkt_lengths else 0,
                "Fwd Packet Length Mean": np.mean(fwd_pkt_lengths) if fwd_pkt_lengths else 0,
                "Fwd Packet Length Std": np.std(fwd_pkt_lengths) if fwd_pkt_lengths else 0,
                "Bwd Packet Length Max": max(bwd_pkt_lengths) if bwd_pkt_lengths else 0,
                "Bwd Packet Length Min": min(bwd_pkt_lengths) if bwd_pkt_lengths else 0,
                "Bwd Packet Length Mean": np.mean(bwd_pkt_lengths) if bwd_pkt_lengths else 0,
                "Bwd Packet Length Std": np.std(bwd_pkt_lengths) if bwd_pkt_lengths else 0,
                "Flow Bytes/s": (total_bytes / duration) if duration > 0 else 0,
                "Flow Packets/s": (total_packets / duration) if duration > 0 else 0,
                "Flow IAT Mean": flow_iat_mean,
                "Flow IAT Std": flow_iat_std,
                "Flow IAT Max": flow_iat_max,
                "Flow IAT Min": flow_iat_min,
                "FIN Flag Count": flow["flags"]["FIN"],
                "SYN Flag Count": flow["flags"]["SYN"],
                "RST Flag Count": flow["flags"]["RST"],
                "PSH Flag Count": flow["flags"]["PSH"],
                "ACK Flag Count": flow["flags"]["ACK"],
                "URG Flag Count": flow["flags"]["URG"],
                "CWE Flag Count": flow["flags"]["CWE"],
                "ECE Flag Count": flow["flags"]["ECE"],
            }

            df = pd.DataFrame([feature_dict])
            json_payload = df.to_dict(orient="records")[0]

            # Add metadata for backend display (not used for prediction)
            json_payload["Source IP"] = key[0]
            json_payload["Destination IP"] = key[1]

            df = preprocess_input(df, getattr(model, "feature_names_in_", None))
            prediction = model.predict(df)

            label = "DDoS Attack" if prediction[0] == 1 else "Normal"

            # SEND EVERY FLOW TO BACKEND
            try:
                response = requests.post(
                    f"{API_URL}/predict?model={API_MODEL}",
                    json=json_payload,
                    timeout=2
                )
                if response.status_code == 200:
                    print(f"Sent to backend: {label}")
                else:
                    print(f"Backend Error {response.status_code}: {response.text[:100]}")
            except Exception as e:
                print("Failed to send to backend (Connection Error):", e)

            print(f"{label}: {key}")
            print("=" * 60)
except KeyboardInterrupt:
    print("\n Capture stopped by user.")
    sys.exit(0)