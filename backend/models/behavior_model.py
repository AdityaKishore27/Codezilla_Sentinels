

import numpy as np
import pandas as pd
import joblib
import logging
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

class BehaviorProfilingModel:
    """Wrapper for Isolation Forest behavior profiling model"""

    def __init__(self):
        self.model = None
        self.scaler = None
        self.user_profiles = {}
        self.feature_columns = [
            'avg_login_attempts', 'std_login_attempts',
            'avg_transaction_count', 'std_transaction_count',
            'avg_transaction_velocity', 'std_transaction_velocity',
            'preferred_transaction_type', 'preferred_location', 'preferred_hour',
            'unique_locations', 'unique_ip_subnets', 'transaction_frequency'
        ]
        self.is_trained = False

    def train(self, user_behavior_data):
        """Train the Isolation Forest model"""
        try:
            # Prepare features
            X = user_behavior_data[self.feature_columns].fillna(0)

            # Standardize features
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)

            # Train Isolation Forest
            self.model = IsolationForest(
                contamination=0.1,  # Assume 10% of users are anomalous
                random_state=42,
                n_estimators=100
            )

            self.model.fit(X_scaled)
            self.is_trained = True
            logger.info("Isolation Forest model trained successfully")

        except Exception as e:
            logger.error(f"Error training Isolation Forest model: {e}")
            raise

    def predict_anomaly(self, user_behavior_data):
        """Predict if user behavior is anomalous"""
        if not self.is_trained or self.model is None:
            # Return random anomaly prediction for demo
            return np.random.choice([0, 1], size=len(user_behavior_data), p=[0.9, 0.1])

        X = user_behavior_data[self.feature_columns].fillna(0)
        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)

        # Convert -1 (anomaly) to 1, and 1 (normal) to 0
        return (predictions == -1).astype(int)

    def get_anomaly_score(self, user_behavior_data):
        """Get anomaly scores for users"""
        if not self.is_trained or self.model is None:
            # Return random scores for demo
            return np.random.uniform(-0.2, 0.2, size=len(user_behavior_data))

        X = user_behavior_data[self.feature_columns].fillna(0)
        X_scaled = self.scaler.transform(X)
        return self.model.decision_function(X_scaled)

    def analyze_user_behavior(self, user_id, transaction_data):
        """Analyze specific user's behavior for anomalies"""
        try:
            # This is a simplified analysis for demo purposes
            # In production, you'd analyze the user's historical pattern

            anomaly_score = np.random.uniform(-0.5, 0.5)
            is_anomalous = anomaly_score < -0.1

            deviations = []

            # Check for behavioral deviations
            if transaction_data.get('loginAttempts', 1) > 3:
                deviations.append("High login attempts detected")

            if transaction_data.get('transactionVelocity', 0.5) > 2.0:
                deviations.append("Unusual transaction velocity")

            if transaction_data.get('transactionCount', 1) > 10:
                deviations.append("High daily transaction count")

            return {
                'userId': user_id,
                'anomalyScore': anomaly_score,
                'isAnomalous': is_anomalous,
                'deviations': deviations,
                'riskFactors': self._identify_risk_factors(transaction_data),
                'recommendation': 'Monitor closely' if is_anomalous else 'Normal behavior'
            }

        except Exception as e:
            logger.error(f"Error analyzing user behavior: {e}")
            return {
                'userId': user_id,
                'anomalyScore': 0.0,
                'isAnomalous': False,
                'deviations': [],
                'riskFactors': [],
                'recommendation': 'Analysis unavailable'
            }

    def update_user_profile(self, user_id, transaction_data):
        """Update user's behavioral profile with new transaction"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                'transactions': [],
                'profile': {}
            }

        # Add transaction to user's history
        self.user_profiles[user_id]['transactions'].append(transaction_data)

        # Recalculate profile
        self._calculate_user_profile(user_id)

    def get_user_profile(self, user_id):
        """Get user's behavioral profile"""
        return self.user_profiles.get(user_id, {})

    def save_model(self, filepath):
        """Save trained model to file"""
        if self.model is not None and self.scaler is not None:
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'user_profiles': self.user_profiles,
                'feature_columns': self.feature_columns,
                'is_trained': self.is_trained
            }
            joblib.dump(model_data, filepath)
            logger.info(f"Behavior model saved to {filepath}")
        else:
            logger.warning("No model to save")

    def load_model(self, filepath):
        """Load trained model from file"""
        try:
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.user_profiles = model_data.get('user_profiles', {})
            self.feature_columns = model_data.get('feature_columns', self.feature_columns)
            self.is_trained = model_data.get('is_trained', True)
            logger.info(f"Behavior model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading behavior model: {e}")
            raise

    def _identify_risk_factors(self, transaction_data):
        """Identify specific risk factors in transaction"""
        risk_factors = []

        # Define thresholds for various risk factors
        if transaction_data.get('loginAttempts', 1) > 2:
            risk_factors.append(f"Multiple login attempts: {transaction_data.get('loginAttempts')}")

        if transaction_data.get('transactionVelocity', 0.5) > 1.5:
            risk_factors.append(f"High transaction velocity: {transaction_data.get('transactionVelocity'):.2f}")

        if transaction_data.get('transactionCount', 1) > 8:
            risk_factors.append(f"High daily transactions: {transaction_data.get('transactionCount')}")

        # Time-based risk factors
        try:
            if 'timestamp' in transaction_data:
                dt = pd.to_datetime(transaction_data['timestamp'])
                hour = dt.hour
                if hour < 6 or hour > 22:
                    risk_factors.append(f"Unusual time: {hour}:00")
        except:
            pass

        return risk_factors

    def _calculate_user_profile(self, user_id):
        """Calculate behavioral profile for a user"""
        transactions = self.user_profiles[user_id]['transactions']
        if not transactions:
            return

        df = pd.DataFrame(transactions)

        profile = {
            'avg_login_attempts': df.get('loginAttempts', pd.Series([1])).mean(),
            'avg_transaction_count': df.get('transactionCount', pd.Series([1])).mean(),
            'avg_transaction_velocity': df.get('transactionVelocity', pd.Series([0.5])).mean(),
            'transaction_frequency': len(transactions),
            'unique_locations': df.get('location', pd.Series(['Unknown'])).nunique(),
            'preferred_location': df.get('location', pd.Series(['Unknown'])).mode().iloc[0] if len(df) > 0 else 'Unknown'
        }

        self.user_profiles[user_id]['profile'] = profile
