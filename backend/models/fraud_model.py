
import numpy as np
import pandas as pd
import joblib
import logging
from sklearn.preprocessing import LabelEncoder
from datetime import datetime

logger = logging.getLogger(__name__)

class FraudDetectionModel:
    """Wrapper for XGBoost fraud detection model"""

    def __init__(self):
        self.model = None
        self.encoders = {}
        self.feature_columns = [
            'LoginAttempt', 'TransactionCount', 'LastTransaction Time',
            'TransactionVelocity', 'Hour', 'DayOfWeek', 'Month',
            'Transaction_Type_Encoded', 'LastTransaction_Encoded',
            'Utility_Encoded', 'Location_Encoded', 'IP_Subnet_Encoded'
        ]
        self.is_trained = False

    def train(self, X, y):
        """Train the XGBoost model"""
        try:
            import xgboost as xgb

            # Calculate scale_pos_weight for imbalanced data
            scale_pos_weight = len(y[y == 0]) / len(y[y == 1]) if sum(y == 1) > 0 else 1

            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                scale_pos_weight=scale_pos_weight,
                random_state=42,
                eval_metric='auc'
            )

            self.model.fit(X, y)
            self.is_trained = True
            logger.info("XGBoost model trained successfully")

        except Exception as e:
            logger.error(f"Error training XGBoost model: {e}")
            raise

    def predict(self, X):
        """Predict fraud labels"""
        if not self.is_trained or self.model is None:
            logger.warning("Model not trained, returning random predictions")
            return np.random.choice([0, 1], size=len(X), p=[0.95, 0.05])

        return self.model.predict(X)

    def predict_risk_score(self, X):
        """Predict fraud risk probability"""
        if not self.is_trained or self.model is None:
            # Return realistic random risk score for demo
            base_risk = 0.1
            if isinstance(X, dict):
                # Increase risk based on login attempts and velocity
                login_factor = X.get('loginAttempts', 1) / 10.0
                velocity_factor = X.get('transactionVelocity', 0.5) / 5.0
                return min(base_risk + login_factor + velocity_factor, 0.95)
            return base_risk + np.random.random() * 0.3

        if isinstance(X, dict):
            # Convert single transaction dict to array
            X_array = self._dict_to_array(X)
            return self.model.predict_proba(X_array.reshape(1, -1))[0, 1]

        return self.model.predict_proba(X)[:, 1]

    def get_feature_importance(self):
        """Get feature importance scores"""
        if not self.is_trained or self.model is None:
            return {}

        importance_dict = {}
        for feature, importance in zip(self.feature_columns, self.model.feature_importances_):
            importance_dict[feature] = float(importance)

        return importance_dict

    def save_model(self, filepath):
        """Save trained model to file"""
        if self.model is not None:
            model_data = {
                'model': self.model,
                'encoders': self.encoders,
                'feature_columns': self.feature_columns,
                'is_trained': self.is_trained
            }
            joblib.dump(model_data, filepath)
            logger.info(f"Model saved to {filepath}")
        else:
            logger.warning("No model to save")

    def load_model(self, filepath):
        """Load trained model from file"""
        try:
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.encoders = model_data.get('encoders', {})
            self.feature_columns = model_data.get('feature_columns', self.feature_columns)
            self.is_trained = model_data.get('is_trained', True)
            logger.info(f"Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise

    def _dict_to_array(self, transaction_dict):
        """Convert transaction dictionary to feature array"""
        # This is a simplified version - in production, you'd want proper feature engineering
        features = []

        # Extract datetime features if timestamp is available
        if 'timestamp' in transaction_dict:
            try:
                dt = pd.to_datetime(transaction_dict['timestamp'])
                hour = dt.hour
                day_of_week = dt.dayofweek
                month = dt.month
            except:
                hour = 12  # default
                day_of_week = 1  # default
                month = 1  # default
        else:
            hour = 12
            day_of_week = 1
            month = 1

        # Map feature values
        feature_values = {
            'LoginAttempt': transaction_dict.get('loginAttempts', 1),
            'TransactionCount': transaction_dict.get('transactionCount', 1),
            'LastTransaction Time': transaction_dict.get('lastTransactionTime', 24),
            'TransactionVelocity': transaction_dict.get('transactionVelocity', 0.5),
            'Hour': hour,
            'DayOfWeek': day_of_week,
            'Month': month,
            'Transaction_Type_Encoded': self._encode_categorical('transactionType', transaction_dict.get('transactionType', 'Credit Card')),
            'LastTransaction_Encoded': self._encode_categorical('lastTransaction', transaction_dict.get('lastTransaction', 'Shopping')),
            'Utility_Encoded': self._encode_categorical('utility', transaction_dict.get('utility', 'Payment')),
            'Location_Encoded': self._encode_categorical('location', transaction_dict.get('location', 'Mumbai')),
            'IP_Subnet_Encoded': self._encode_categorical('ipSubnet', transaction_dict.get('ipAddress', '192.168.1.1')[:7])
        }

        # Create feature array in correct order
        features = [feature_values[col] for col in self.feature_columns]
        return np.array(features)

    def _encode_categorical(self, feature_name, value):
        """Simple categorical encoding"""
        encodings = {
            'transactionType': {'Credit Card': 0, 'Debit Card': 1, 'UPI': 2},
            'lastTransaction': {'Shopping': 0, 'Medical': 1, 'Bills': 2, 'Food': 3, 'Entertainment': 4, 'Travel': 5},
            'utility': {'Payment': 0, 'Purchase': 1, 'Transfer': 2, 'Withdrawal': 3},
            'location': {'Mumbai': 0, 'Delhi': 1, 'Bangalore': 2, 'Chennai': 3, 'Kolkata': 4},
            'ipSubnet': {'192.168': 0, '10.0': 1, '172.16': 2, '203.0': 3}
        }

        return encodings.get(feature_name, {}).get(value, 0)
