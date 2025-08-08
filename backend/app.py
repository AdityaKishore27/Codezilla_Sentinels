#!/usr/bin/env python3
"""
Fraud Detection Dashboard - Flask Backend API
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import json
from datetime import datetime, timedelta
import logging
from werkzeug.utils import secure_filename
import traceback

# Import our custom models
from models.fraud_model import FraudDetectionModel
from models.behavior_model import BehaviorProfilingModel
from utils.data_processor import DataProcessor

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'data/uploads'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize models and data processor
fraud_model = None
behavior_model = None
data_processor = None

# In-memory storage for demo purposes
transaction_store = []
user_profiles_store = {}

def initialize_models():
    """Initialize ML models and data processor"""
    global fraud_model, behavior_model, data_processor

    try:
        fraud_model = FraudDetectionModel()
        behavior_model = BehaviorProfilingModel()
        data_processor = DataProcessor()

        # Load pre-trained models if they exist
        if os.path.exists('data/trained_xgb_model.pkl'):
            fraud_model.load_model('data/trained_xgb_model.pkl')
            logger.info("Loaded XGBoost model successfully")

        if os.path.exists('data/trained_isolation_model.pkl'):
            behavior_model.load_model('data/trained_isolation_model.pkl')
            logger.info("Loaded Isolation Forest model successfully")

        logger.info("Models initialized successfully")

    except Exception as e:
        logger.error(f"Error initializing models: {str(e)}")
        raise

@app.route('/')
def index():
    """Serve the main dashboard page"""
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files (CSS, JS, etc.)"""
    return send_from_directory('../frontend', filename)

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models_loaded': {
            'fraud_model': fraud_model is not None,
            'behavior_model': behavior_model is not None
        }
    })

@app.route('/api/dashboard_metrics')
def get_dashboard_metrics():
    """Get dashboard overview metrics"""
    try:
        # Calculate metrics from stored transactions
        total_transactions = len(transaction_store)
        high_risk_count = sum(1 for t in transaction_store if t.get('riskCategory') == 'High')
        anomalous_users = len([u for u in user_profiles_store.values() if u.get('isAnomalous', False)])

        # Calculate fraud detection rate
        actual_frauds = sum(1 for t in transaction_store if t.get('fraud') == 1)
        detected_frauds = sum(1 for t in transaction_store if t.get('riskCategory') == 'High' and t.get('fraud') == 1)
        fraud_detection_rate = detected_frauds / actual_frauds if actual_frauds > 0 else 0

        # Risk distribution
        risk_distribution = {
            'Low': sum(1 for t in transaction_store if t.get('riskCategory') == 'Low'),
            'Moderate': sum(1 for t in transaction_store if t.get('riskCategory') == 'Moderate'),
            'High': sum(1 for t in transaction_store if t.get('riskCategory') == 'High')
        }

        return jsonify({
            'totalTransactions': total_transactions,
            'highRiskTransactions': high_risk_count,
            'fraudDetectionRate': round(fraud_detection_rate, 3),
            'anomalousUsers': anomalous_users,
            'riskDistribution': risk_distribution,
            'lastUpdated': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Error getting dashboard metrics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze_transaction', methods=['POST'])
def analyze_transaction():
    """Analyze a single transaction"""
    try:
        data = request.get_json()

        # Validate input data
        required_fields = ['userId', 'transactionType', 'loginAttempts', 'transactionCount', 
                          'transactionVelocity', 'location']

        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Process transaction data
        processed_data = data_processor.process_single_transaction(data)

        # Get fraud risk score
        risk_score = fraud_model.predict_risk_score(processed_data) if fraud_model else np.random.random() * 0.5

        # Determine risk category
        if risk_score < 0.3:
            risk_category = 'Low'
        elif risk_score < 0.7:
            risk_category = 'Moderate'
        else:
            risk_category = 'High'

        # Get user behavior analysis
        user_profile = user_profiles_store.get(data['userId'])
        behavior_analysis = behavior_model.analyze_user_behavior(data['userId'], processed_data) if behavior_model else {
            'anomalyScore': np.random.random() - 0.5,
            'isAnomalous': np.random.random() > 0.8,
            'deviations': []
        }

        # Create transaction record
        transaction_record = {
            'id': f"TXN_{len(transaction_store) + 1:06d}",
            'userId': data['userId'],
            'transactionType': data['transactionType'],
            'loginAttempts': data['loginAttempts'],
            'transactionCount': data['transactionCount'],
            'transactionVelocity': data['transactionVelocity'],
            'location': data['location'],
            'timestamp': datetime.now().isoformat(),
            'riskScore': round(risk_score, 4),
            'riskCategory': risk_category,
            'isAnomaly': behavior_analysis['isAnomalous'],
            'anomalyScore': round(behavior_analysis['anomalyScore'], 4),
            'fraud': 1 if risk_score > 0.8 else 0  # Simulate actual fraud label
        }

        # Store transaction
        transaction_store.append(transaction_record)

        # Combined decision logic
        combined_decision = get_combined_decision(risk_score, behavior_analysis['isAnomalous'])

        response = {
            'transaction': transaction_record,
            'behaviorAnalysis': behavior_analysis,
            'combinedDecision': combined_decision,
            'recommendations': get_recommendations(risk_category, behavior_analysis['isAnomalous'])
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error analyzing transaction: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload_csv', methods=['POST'])
def upload_csv():
    """Process CSV file upload for bulk analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400

        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Process CSV
        df = pd.read_csv(filepath)
        processed_transactions = []

        for _, row in df.iterrows():
            # Process each transaction
            transaction_data = row.to_dict()
            processed_data = data_processor.process_single_transaction(transaction_data)

            # Get predictions
            risk_score = fraud_model.predict_risk_score(processed_data) if fraud_model else np.random.random() * 0.5

            # Determine risk category
            if risk_score < 0.3:
                risk_category = 'Low'
            elif risk_score < 0.7:
                risk_category = 'Moderate'
            else:
                risk_category = 'High'

            # Create transaction record
            transaction_record = {
                'id': transaction_data.get('TransactionId', f"TXN_{len(processed_transactions) + 1:06d}"),
                'userId': transaction_data.get('UserID', f"USER_{np.random.randint(1000, 9999)}"),
                'transactionType': transaction_data.get('Transaction Type', 'Unknown'),
                'riskScore': round(risk_score, 4),
                'riskCategory': risk_category,
                'timestamp': transaction_data.get('Time', datetime.now().isoformat()),
                'originalData': transaction_data
            }

            processed_transactions.append(transaction_record)
            transaction_store.append(transaction_record)

        # Clean up uploaded file
        os.remove(filepath)

        return jsonify({
            'message': f'Successfully processed {len(processed_transactions)} transactions',
            'transactions': processed_transactions[:100],  # Return first 100 for display
            'totalCount': len(processed_transactions)
        })

    except Exception as e:
        logger.error(f"Error processing CSV upload: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user_profile/<user_id>')
def get_user_profile(user_id):
    """Get user behavior profile"""
    try:
        # Get user transactions
        user_transactions = [t for t in transaction_store if t.get('userId') == user_id]

        if not user_transactions:
            return jsonify({'error': 'User not found'}), 404

        # Calculate user statistics
        profile = calculate_user_profile(user_transactions)
        profile['userId'] = user_id
        profile['transactionHistory'] = user_transactions[-10:]  # Last 10 transactions

        # Store/update user profile
        user_profiles_store[user_id] = profile

        return jsonify(profile)

    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions')
def get_transactions():
    """Get all transactions with optional filtering"""
    try:
        risk_filter = request.args.get('risk')
        user_filter = request.args.get('userId')
        limit = int(request.args.get('limit', 50))

        filtered_transactions = transaction_store.copy()

        # Apply filters
        if risk_filter:
            filtered_transactions = [t for t in filtered_transactions if t.get('riskCategory') == risk_filter]

        if user_filter:
            filtered_transactions = [t for t in filtered_transactions if t.get('userId') == user_filter]

        # Sort by timestamp (newest first)
        filtered_transactions.sort(key=lambda x: x.get('timestamp', ''), reverse=True)

        # Apply limit
        limited_transactions = filtered_transactions[:limit]

        return jsonify({
            'transactions': limited_transactions,
            'totalCount': len(filtered_transactions),
            'appliedFilters': {
                'risk': risk_filter,
                'userId': user_filter,
                'limit': limit
            }
        })

    except Exception as e:
        logger.error(f"Error getting transactions: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_combined_decision(risk_score, is_anomalous):
    """Get combined decision from both models"""
    if risk_score > 0.7 and is_anomalous:
        return "CRITICAL RISK - Block Transaction"
    elif risk_score > 0.7:
        return "HIGH RISK - Additional Verification Required"
    elif is_anomalous:
        return "MODERATE RISK - Monitor Transaction"
    else:
        return "LOW RISK - Approve Transaction"

def get_recommendations(risk_category, is_anomalous):
    """Get recommendations based on risk assessment"""
    recommendations = []

    if risk_category == 'High':
        recommendations.extend([
            "Block transaction immediately",
            "Contact user for verification",
            "Review recent account activity"
        ])
    elif risk_category == 'Moderate':
        recommendations.extend([
            "Request additional authentication",
            "Monitor for suspicious patterns"
        ])

    if is_anomalous:
        recommendations.extend([
            "Flag user for behavioral review",
            "Compare with historical patterns"
        ])

    return recommendations if recommendations else ["Transaction appears normal"]

def calculate_user_profile(transactions):
    """Calculate user behavior profile from transactions"""
    if not transactions:
        return {}

    df = pd.DataFrame(transactions)

    profile = {
        'transactionCount': len(transactions),
        'avgRiskScore': df['riskScore'].mean(),
        'maxRiskScore': df['riskScore'].max(),
        'riskTrend': 'increasing' if df['riskScore'].iloc[-1] > df['riskScore'].mean() else 'stable',
        'anomalyCount': sum(1 for t in transactions if t.get('isAnomaly', False)),
        'isAnomalous': any(t.get('isAnomaly', False) for t in transactions),
        'fraudRate': sum(1 for t in transactions if t.get('fraud') == 1) / len(transactions),
        'lastActivity': max(t.get('timestamp', '') for t in transactions)
    }

    return profile

if __name__ == '__main__':
    # Initialize models
    initialize_models()

    # Load sample data if available
    try:
        if os.path.exists('data/fraud_detection_dataset.csv'):
            sample_df = pd.read_csv('data/fraud_detection_dataset.csv')
            logger.info(f"Loaded sample dataset with {len(sample_df)} records")
    except Exception as e:
        logger.warning(f"Could not load sample dataset: {e}")

    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)

