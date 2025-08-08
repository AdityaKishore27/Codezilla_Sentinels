#!/usr/bin/env python3
"""
Setup script for Fraud Detection System
This script trains the models and prepares the system for use
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
import logging

# Add backend to path
sys.path.append('backend')

from models.fraud_model import FraudDetectionModel
from models.behavior_model import BehaviorProfilingModel
from utils.data_processor import DataProcessor, generate_sample_data

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def setup_directories():
    """Create necessary directories"""
    directories = [
        'backend/data',
        'backend/data/uploads',
        'backend/models',
        'backend/utils',
        'frontend'
    ]

    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")

def create_sample_dataset():
    """Create sample dataset for training and testing"""
    logger.info("Generating sample dataset...")

    # Generate sample data
    transactions = generate_sample_data(20000)
    df = pd.DataFrame(transactions)

    # Save dataset
    dataset_path = 'backend/data/fraud_detection_dataset.csv'
    df.to_csv(dataset_path, index=False)
    logger.info(f"Sample dataset saved to: {dataset_path}")

    return df

def train_models():
    """Train both fraud detection models"""
    logger.info("Training machine learning models...")

    # Load or create dataset
    dataset_path = 'backend/data/fraud_detection_dataset.csv'
    if os.path.exists(dataset_path):
        df = pd.read_csv(dataset_path)
        logger.info(f"Loaded existing dataset: {len(df)} records")
    else:
        df = create_sample_dataset()

    # Initialize data processor
    data_processor = DataProcessor()

    # Process data for training
    processed_transactions = []
    for _, row in df.iterrows():
        processed = data_processor.process_single_transaction(row.to_dict())
        processed_transactions.append(processed)

    # Convert to DataFrame for training
    processed_df = pd.DataFrame(processed_transactions)

    # Prepare features and labels
    feature_columns = [
        'loginAttempts', 'transactionCount', 'lastTransactionTime',
        'transactionVelocity', 'hour', 'dayOfWeek', 'month',
        'transactionType', 'lastTransaction', 'utility', 'location', 'ipSubnet'
    ]

    X = processed_df[feature_columns].fillna(0)
    y = df['fraud'].values

    # Train XGBoost model
    logger.info("Training XGBoost fraud detection model...")
    fraud_model = FraudDetectionModel()
    fraud_model.train(X, y)
    fraud_model.save_model('backend/data/trained_xgb_model.pkl')

    # Create user behavior data for Isolation Forest
    logger.info("Creating user behavior profiles...")
    user_groups = df.groupby('userId')

    user_behavior_data = []
    for user_id, group in user_groups:
        if len(group) >= 3:  # Only users with multiple transactions
            profile = {
                'userId': user_id,
                'avg_login_attempts': group['loginAttempts'].mean(),
                'std_login_attempts': group['loginAttempts'].std() if len(group) > 1 else 0,
                'avg_transaction_count': group['transactionCount'].mean(),
                'std_transaction_count': group['transactionCount'].std() if len(group) > 1 else 0,
                'avg_transaction_velocity': group['transactionVelocity'].mean(),
                'std_transaction_velocity': group['transactionVelocity'].std() if len(group) > 1 else 0,
                'preferred_transaction_type': group['transactionType'].mode().iloc[0] if len(group) > 0 else 'Credit Card',
                'preferred_location': group['location'].mode().iloc[0] if len(group) > 0 else 'Mumbai',
                'preferred_hour': 12,  # Default
                'unique_locations': group['location'].nunique(),
                'unique_ip_subnets': 1,  # Simplified
                'transaction_frequency': len(group)
            }
            user_behavior_data.append(profile)

    user_behavior_df = pd.DataFrame(user_behavior_data)

    # Encode categorical data for behavior model
    for col in ['preferred_transaction_type', 'preferred_location']:
        if col in user_behavior_df.columns:
            user_behavior_df[col] = pd.Categorical(user_behavior_df[col]).codes

    # Train Isolation Forest model
    logger.info("Training Isolation Forest behavior model...")
    behavior_model = BehaviorProfilingModel()
    behavior_model.train(user_behavior_df)
    behavior_model.save_model('backend/data/trained_isolation_model.pkl')

    logger.info("✅ Model training completed successfully!")

def verify_setup():
    """Verify that all components are set up correctly"""
    logger.info("Verifying setup...")

    required_files = [
        'backend/app.py',
        'backend/models/fraud_model.py',
        'backend/models/behavior_model.py',
        'backend/utils/data_processor.py',
        'backend/data/fraud_detection_dataset.csv',
        'backend/data/trained_xgb_model.pkl',
        'backend/data/trained_isolation_model.pkl'
    ]

    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)

    if missing_files:
        logger.error("❌ Setup incomplete. Missing files:")
        for file_path in missing_files:
            logger.error(f"  - {file_path}")
        return False

    logger.info("✅ Setup verification completed successfully!")
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Fraud Detection System...")
    print("=" * 50)

    try:
        # Setup directories
        setup_directories()

        # Create sample dataset
        create_sample_dataset()

        # Train models
        train_models()

        # Verify setup
        if verify_setup():
            print("\n✅ Setup completed successfully!")
            print("\n🎯 Next steps:")
            print("1. Run: python run_local.py")
            print("2. Open browser: http://localhost:5000")
            print("3. Start analyzing transactions!")
        else:
            print("\n❌ Setup failed. Please check the logs above.")
            return 1

    except Exception as e:
        logger.error(f"Setup failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
