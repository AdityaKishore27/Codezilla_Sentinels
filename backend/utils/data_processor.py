"""
Data processing utilities for fraud detection
"""

import pandas as pd
import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DataProcessor:
    """Utility class for processing transaction data"""

    def __init__(self):
        self.categorical_mappings = {
            'transactionType': {'Credit Card': 0, 'Debit Card': 1, 'UPI': 2},
            'lastTransaction': {
                'Shopping': 0, 'Medical': 1, 'Bills': 2, 'Food': 3,
                'Entertainment': 4, 'Travel': 5, 'Institutional': 6, 'Transfer': 7
            },
            'utility': {
                'Payment': 0, 'Purchase': 1, 'Transfer': 2, 'Withdrawal': 3,
                'Deposit': 4, 'Bill Payment': 5, 'Online Shopping': 6
            },
            'location': {
                'Mumbai': 0, 'Delhi': 1, 'Bangalore': 2, 'Chennai': 3, 'Kolkata': 4,
                'Hyderabad': 5, 'Pune': 6, 'Ahmedabad': 7, 'Jaipur': 8, 'Lucknow': 9
            }
        }

    def process_single_transaction(self, transaction_data):
        """Process a single transaction for model input"""
        try:
            processed = {}

            # Copy basic fields
            processed['loginAttempts'] = int(transaction_data.get('loginAttempts', 1))
            processed['transactionCount'] = int(transaction_data.get('transactionCount', 1))
            processed['transactionVelocity'] = float(transaction_data.get('transactionVelocity', 0.5))
            processed['lastTransactionTime'] = int(transaction_data.get('lastTransactionTime', 24))

            # Process timestamp if available
            if 'timestamp' in transaction_data:
                dt = self._parse_datetime(transaction_data['timestamp'])
                processed['hour'] = dt.hour
                processed['dayOfWeek'] = dt.weekday()
                processed['month'] = dt.month
            else:
                # Use current time as default
                now = datetime.now()
                processed['hour'] = now.hour
                processed['dayOfWeek'] = now.weekday()
                processed['month'] = now.month

            # Encode categorical variables
            processed['transactionType'] = self._encode_categorical(
                'transactionType', transaction_data.get('transactionType', 'Credit Card')
            )
            processed['lastTransaction'] = self._encode_categorical(
                'lastTransaction', transaction_data.get('lastTransaction', 'Shopping')
            )
            processed['utility'] = self._encode_categorical(
                'utility', transaction_data.get('utility', 'Payment')
            )
            processed['location'] = self._encode_categorical(
                'location', transaction_data.get('location', 'Mumbai')
            )

            # Process IP address to subnet
            ip_address = transaction_data.get('ipAddress', '192.168.1.1')
            ip_subnet = '.'.join(ip_address.split('.')[:2])
            processed['ipSubnet'] = self._encode_ip_subnet(ip_subnet)

            return processed

        except Exception as e:
            logger.error(f"Error processing transaction: {e}")
            # Return default values on error
            return self._get_default_transaction()

    def process_csv_data(self, csv_path):
        """Process CSV file containing multiple transactions"""
        try:
            df = pd.read_csv(csv_path)
            processed_transactions = []

            for _, row in df.iterrows():
                transaction_dict = row.to_dict()
                processed = self.process_single_transaction(transaction_dict)
                processed['original'] = transaction_dict
                processed_transactions.append(processed)

            logger.info(f"Processed {len(processed_transactions)} transactions from CSV")
            return processed_transactions

        except Exception as e:
            logger.error(f"Error processing CSV data: {e}")
            raise

    def validate_transaction_data(self, transaction_data):
        """Validate transaction data format and required fields"""
        required_fields = ['userId', 'transactionType']
        errors = []

        # Check required fields
        for field in required_fields:
            if field not in transaction_data or transaction_data[field] is None:
                errors.append(f"Missing required field: {field}")

        # Validate data types and ranges
        numeric_validations = {
            'loginAttempts': (1, 10),
            'transactionCount': (1, 50),
            'transactionVelocity': (0.01, 10.0),
            'lastTransactionTime': (1, 48)
        }

        for field, (min_val, max_val) in numeric_validations.items():
            if field in transaction_data:
                try:
                    val = float(transaction_data[field])
                    if not (min_val <= val <= max_val):
                        errors.append(f"{field} must be between {min_val} and {max_val}")
                except (ValueError, TypeError):
                    errors.append(f"{field} must be a valid number")

        # Validate categorical fields
        categorical_validations = {
            'transactionType': ['Credit Card', 'Debit Card', 'UPI'],
            'location': list(self.categorical_mappings['location'].keys())
        }

        for field, valid_values in categorical_validations.items():
            if field in transaction_data:
                if transaction_data[field] not in valid_values:
                    errors.append(f"{field} must be one of: {', '.join(valid_values)}")

        return errors

    def create_feature_vector(self, processed_transaction):
        """Create feature vector for model input"""
        feature_order = [
            'loginAttempts', 'transactionCount', 'lastTransactionTime',
            'transactionVelocity', 'hour', 'dayOfWeek', 'month',
            'transactionType', 'lastTransaction', 'utility', 'location', 'ipSubnet'
        ]

        return np.array([processed_transaction.get(field, 0) for field in feature_order])

    def _parse_datetime(self, timestamp_str):
        """Parse various datetime formats"""
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%d %H:%M:%S.%f',
            '%Y-%m-%dT%H:%M:%S.%f',
            '%d/%m/%Y %H:%M:%S'
        ]

        for fmt in formats:
            try:
                return datetime.strptime(str(timestamp_str), fmt)
            except ValueError:
                continue

        # If all formats fail, return current time
        logger.warning(f"Could not parse timestamp: {timestamp_str}")
        return datetime.now()

    def _encode_categorical(self, category, value):
        """Encode categorical value using predefined mappings"""
        mapping = self.categorical_mappings.get(category, {})
        return mapping.get(value, 0)  # Return 0 as default for unknown values

    def _encode_ip_subnet(self, ip_subnet):
        """Encode IP subnet"""
        subnet_mapping = {
            '192.168': 0, '10.0': 1, '172.16': 2, '203.0': 3,
            '115.240': 4, '49.36': 5, '106.51': 6
        }
        return subnet_mapping.get(ip_subnet, 0)

    def _get_default_transaction(self):
        """Return default transaction data for error cases"""
        return {
            'loginAttempts': 1,
            'transactionCount': 1,
            'transactionVelocity': 0.5,
            'lastTransactionTime': 24,
            'hour': 12,
            'dayOfWeek': 1,
            'month': 1,
            'transactionType': 0,
            'lastTransaction': 0,
            'utility': 0,
            'location': 0,
            'ipSubnet': 0
        }

def generate_sample_data(n_transactions=1000):
    """Generate sample transaction data for testing"""
    np.random.seed(42)

    transactions = []
    transaction_types = ['Credit Card', 'Debit Card', 'UPI']
    locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']

    for i in range(n_transactions):
        # Generate realistic transaction data
        is_fraud = np.random.random() < 0.05  # 5% fraud rate

        transaction = {
            'userId': f"USER_{np.random.randint(1000, 9999)}",
            'transactionId': f"TXN_{i+1:06d}",
            'transactionType': np.random.choice(transaction_types),
            'loginAttempts': np.random.randint(3, 8) if is_fraud else np.random.randint(1, 3),
            'transactionCount': np.random.randint(8, 20) if is_fraud else np.random.randint(1, 10),
            'transactionVelocity': np.random.uniform(0.5, 5.0) if is_fraud else np.random.uniform(0.1, 1.5),
            'location': np.random.choice(locations),
            'timestamp': datetime.now().isoformat(),
            'lastTransactionTime': np.random.randint(1, 48),
            'lastTransaction': 'Shopping',
            'utility': 'Payment',
            'ipAddress': f"192.168.{np.random.randint(1, 255)}.{np.random.randint(1, 255)}",
            'fraud': 1 if is_fraud else 0
        }

        transactions.append(transaction)

    return transactions
