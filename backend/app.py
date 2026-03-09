import os
import sys
import logging
from collections import deque
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(BASE_DIR))

latest_prediction = {}
alerts = deque(maxlen=200)
stats = {"total_flows": 0, "normal": 0, "attacks": 0}
recent_predictions = deque(maxlen=50)

try:
    from utils.preprocess_input import preprocess_input
except ImportError:
    def preprocess_input(df, feature_names=None):
        if feature_names is not None:
            for col in feature_names:
                if col not in df.columns:
                    df[col] = 0
            df = df[feature_names]
        return df

MODEL_DIR = os.path.join(BASE_DIR, "saved_models")
LOG_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[logging.FileHandler(os.path.join(LOG_DIR, "app.log")), logging.StreamHandler(sys.stdout)])

MODEL_PATHS = {
    "xgboost": "xgboost_ddos.joblib",
    "lightgbm": "lightgbm_ddos.joblib",
    "random_forest": "random_forest_ddos.joblib",
    "logistic_regression": "logistic_regression_ddos.joblib"
}

MODELS = {}
for name, file in MODEL_PATHS.items():
    path = os.path.join(MODEL_DIR, file)
    if os.path.exists(path):
        try:
            MODELS[name] = joblib.load(path)
            logging.info(f"Loaded model: {name}")
        except Exception as e:
            logging.error(f"Failed loading {name}: {e}")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Cyber Sentinel AI Backend Running", "available_models": list(MODELS.keys())})

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "available_models": list(MODELS.keys())})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        model_name = request.args.get("model", "xgboost")
        model = MODELS.get(model_name)
        if not model:
            return jsonify({"error": "Model not found"}), 400
        data = request.get_json()
        df = pd.DataFrame([data])
        processed = preprocess_input(df, getattr(model, "feature_names_in_", None))
        prediction = int(model.predict(processed)[0])
        label = "DDoS Attack" if prediction == 1 else "Normal"
        stats["total_flows"] += 1
        if prediction == 1:
            stats["attacks"] += 1
        else:
            stats["normal"] += 1
        recent_predictions.append(prediction)
        protocol_map = {6: "TCP", 17: "UDP", 1: "ICMP"}
        proto_str = protocol_map.get(data.get("Protocol", 0), str(data.get("Protocol", 0)))
        result = {
            "model_used": model_name, "prediction": prediction, "label": label,
            "timestamp": pd.Timestamp.now().isoformat(),
            "source_ip": data.get("Source IP", "N/A"), "destination_ip": data.get("Destination IP", "N/A"),
            "protocol": proto_str
        }
        latest_prediction.clear()
        latest_prediction.update(result)
        alerts.append(result)
        return jsonify(result)
    except Exception as e:
        logging.error(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/predict-csv", methods=["POST"])
def predict_csv():
    try:
        model_name = request.args.get("model", "xgboost")
        model = MODELS.get(model_name)
        if not model:
            return jsonify({"error": "Invalid model name"}), 400
        if "file" not in request.files:
            return jsonify({"error": "CSV file missing"}), 400
        file = request.files["file"]
        df = pd.read_csv(file)
        processed = preprocess_input(df, getattr(model, "feature_names_in_", None))
        predictions = model.predict(processed)
        return jsonify({
            "model_used": model_name, "total_rows": len(predictions),
            "ddos_detected": int((predictions == 1).sum()), "normal": int((predictions == 0).sum())
        })
    except Exception as e:
        return jsonify({"error": "CSV prediction failed"}), 500

@app.route("/api/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_prediction)

@app.route("/api/stats", methods=["GET"])
def get_stats():
    total = stats["total_flows"]
    attacks = stats["attacks"]
    normal = stats["normal"]
    recent_attack_ratio = sum(recent_predictions) / len(recent_predictions) if recent_predictions else 0
    status = "THREAT" if recent_attack_ratio > 0.3 else "SAFE"
    return jsonify({"total_flows": total, "normal": normal, "attacks": attacks, "recent_attack_ratio": round(recent_attack_ratio, 2), "status": status})

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    return jsonify(list(alerts))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
