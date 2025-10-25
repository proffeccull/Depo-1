#!/usr/bin/env python3
"""
ChainGive AI Matching Service
Uses scikit-learn for optimal donor-recipient matching
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import redis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class AIMatchingService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )

        # Matching weights as per spec
        self.weights = {
            'location_proximity': 0.30,
            'trust_score': 0.25,
            'urgency_time': 0.20,
            'donor_preferences': 0.15,
            'randomization': 0.10
        }

        self.load_model()

    def load_model(self):
        """Load or train the matching model"""
        try:
            # Try to load existing model
            self.model = joblib.load('models/matching_model.pkl')
            self.scaler = joblib.load('models/scaler.pkl')
            logger.info("Loaded existing matching model")
        except FileNotFoundError:
            logger.info("No existing model found, initializing with default logic")
            # Will use rule-based matching until model is trained

    def calculate_location_proximity(self, donor_location: str, recipient_location: str) -> float:
        """Calculate location proximity score (0-1)"""
        if donor_location == recipient_location:
            return 1.0

        # Simple distance calculation - in production, use actual geolocation
        # For now, same city = 1.0, same state = 0.7, different state = 0.3
        donor_parts = donor_location.split(',')
        recipient_parts = recipient_location.split(',')

        if len(donor_parts) >= 2 and len(recipient_parts) >= 2:
            if donor_parts[1].strip() == recipient_parts[1].strip():  # Same state
                return 0.7
            elif donor_parts[0].strip() == recipient_parts[0].strip():  # Same city
                return 1.0

        return 0.3  # Default for different locations

    def calculate_urgency_score(self, request_age_hours: int) -> float:
        """Calculate urgency based on how long the request has been waiting"""
        if request_age_hours < 1:
            return 1.0  # Very urgent
        elif request_age_hours < 24:
            return 0.8  # Urgent
        elif request_age_hours < 72:
            return 0.6  # Moderate
        elif request_age_hours < 168:  # 1 week
            return 0.4  # Low urgency
        else:
            return 0.2  # Not urgent

    def calculate_match_score(self, donor: Dict, recipient: Dict) -> float:
        """Calculate overall match score using weighted factors"""
        scores = {}

        # Location proximity
        donor_location = f"{donor.get('city', '')},{donor.get('state', '')}"
        recipient_location = f"{recipient.get('city', '')},{recipient.get('state', '')}"
        scores['location'] = self.calculate_location_proximity(donor_location, recipient_location)

        # Trust score (normalized 0-1)
        donor_trust = min(donor.get('trust_score', 50) / 100.0, 1.0)
        recipient_trust = min(recipient.get('trust_score', 50) / 100.0, 1.0)
        scores['trust'] = (donor_trust + recipient_trust) / 2

        # Urgency based on request age
        request_created = datetime.fromisoformat(recipient.get('request_created', datetime.now().isoformat()))
        age_hours = (datetime.now() - request_created).total_seconds() / 3600
        scores['urgency'] = self.calculate_urgency_score(age_hours)

        # Donor preferences (simplified - category matching)
        donor_preferences = donor.get('preferences', {})
        recipient_category = recipient.get('category', '')
        preferred_categories = donor_preferences.get('categories', [])
        scores['preferences'] = 1.0 if recipient_category in preferred_categories else 0.5

        # Randomization factor
        scores['randomization'] = np.random.uniform(0.8, 1.0)

        # Calculate weighted score
        final_score = sum(
            scores[factor] * weight
            for factor, weight in self.weights.items()
        )

        return min(final_score, 1.0)

    def find_best_matches(self, donor: Dict, available_recipients: List[Dict], limit: int = 5) -> List[Dict]:
        """Find the best recipient matches for a donor"""
        matches = []

        for recipient in available_recipients:
            score = self.calculate_match_score(donor, recipient)
            matches.append({
                'recipient': recipient,
                'score': score,
                'factors': {
                    'location_match': self.calculate_location_proximity(
                        f"{donor.get('city', '')},{donor.get('state', '')}",
                        f"{recipient.get('city', '')},{recipient.get('state', '')}"
                    ),
                    'trust_score': (donor.get('trust_score', 50) + recipient.get('trust_score', 50)) / 200.0,
                    'urgency': self.calculate_urgency_score(
                        (datetime.now() - datetime.fromisoformat(recipient.get('request_created', datetime.now().isoformat()))).total_seconds() / 3600
                    )
                }
            })

        # Sort by score descending and return top matches
        matches.sort(key=lambda x: x['score'], reverse=True)
        return matches[:limit]

    def train_model(self, historical_matches: List[Dict]):
        """Train the matching model using historical data"""
        if len(historical_matches) < 10:
            logger.warning("Not enough data to train model")
            return

        # Prepare training data
        features = []
        targets = []

        for match in historical_matches:
            donor = match['donor']
            recipient = match['recipient']
            success_score = match.get('success_score', 0.5)  # 0-1 based on completion

            feature_vector = [
                self.calculate_location_proximity(
                    f"{donor.get('city', '')},{donor.get('state', '')}",
                    f"{recipient.get('city', '')},{recipient.get('state', '')}"
                ),
                (donor.get('trust_score', 50) + recipient.get('trust_score', 50)) / 200.0,
                self.calculate_urgency_score(
                    (datetime.now() - datetime.fromisoformat(recipient.get('request_created', datetime.now().isoformat()))).total_seconds() / 3600
                ),
                1.0 if recipient.get('category') in donor.get('preferences', {}).get('categories', []) else 0.0,
                np.random.uniform(0.8, 1.0)  # Randomization factor
            ]

            features.append(feature_vector)
            targets.append(success_score)

        # Train model
        X = np.array(features)
        y = np.array(targets)

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_scaled, y)

        # Save model
        os.makedirs('models', exist_ok=True)
        joblib.dump(self.model, 'models/matching_model.pkl')
        joblib.dump(self.scaler, 'models/scaler.pkl')

        logger.info(f"Trained matching model with {len(features)} samples")

# Global service instance
matching_service = AIMatchingService()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'ai-matching'})

@app.route('/match', methods=['POST'])
def find_matches():
    try:
        data = request.get_json()

        donor = data.get('donor', {})
        available_recipients = data.get('recipients', [])
        limit = data.get('limit', 5)

        if not donor or not available_recipients:
            return jsonify({'error': 'Missing donor or recipients data'}), 400

        matches = matching_service.find_best_matches(donor, available_recipients, limit)

        return jsonify({
            'matches': matches,
            'total_available': len(available_recipients),
            'algorithm_version': 'v2.2'
        })

    except Exception as e:
        logger.error(f"Error in matching: {str(e)}")
        return jsonify({'error': 'Matching service error'}), 500

@app.route('/train', methods=['POST'])
def train_model():
    try:
        data = request.get_json()
        historical_matches = data.get('matches', [])

        matching_service.train_model(historical_matches)

        return jsonify({'status': 'training_completed'})

    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        return jsonify({'error': 'Training failed'}), 500

@app.route('/fraud/analyze', methods=['POST'])
def analyze_fraud():
    """Simple fraud detection endpoint"""
    try:
        data = request.get_json()
        transaction = data.get('transaction', {})

        # Simple rule-based fraud scoring
        score = 0
        reasons = []

        amount = transaction.get('amount', 0)
        if amount > 50000:
            score += 30
            reasons.append('High transaction amount')

        location = transaction.get('location', {})
        if location.get('country') != 'NG':
            score += 20
            reasons.append('International transaction')

        user_history = transaction.get('userHistory', {})
        if user_history.get('trustScore', 100) < 50:
            score += 25
            reasons.append('Low trust score')

        risk = 'low'
        if score > 60:
            risk = 'high'
        elif score > 30:
            risk = 'medium'

        action = 'allow'
        if score > 80:
            action = 'block'
        elif score > 40:
            action = 'review'

        return jsonify({
            'score': min(score, 100),
            'reasons': reasons,
            'confidence': 0.8
        })

    except Exception as e:
        logger.error(f"Error in fraud analysis: {str(e)}")
        return jsonify({'error': 'Fraud analysis failed'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'false').lower() == 'true')