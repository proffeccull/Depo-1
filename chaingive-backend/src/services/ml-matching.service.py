#!/usr/bin/env python3
"""
AI Matching Algorithm using scikit-learn
Implements a weighted scoring model for donor-recipient matching in ChainGive
"""

import sys
import json
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import numpy as np

class AIMatchingService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_path = os.path.join(os.path.dirname(__file__), 'ai_matching_model.pkl')
        self.scaler_path = os.path.join(os.path.dirname(__file__), 'ai_matching_scaler.pkl')
        self.load_or_train_model()

    def load_or_train_model(self):
        """Load existing model or train a new one"""
        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(self.scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            print("Loaded existing AI matching model", file=sys.stderr)
        except FileNotFoundError:
            print("Training new AI matching model", file=sys.stderr)
            self.train_initial_model()

    def train_initial_model(self):
        """Train initial model with synthetic data"""
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000

        # Features: trustScore, locationProximity, timeWaiting, completedCycles, donationHistory, categoryPreference, age, accountAge
        X = np.random.rand(n_samples, 8)
        X[:, 0] = np.random.beta(2, 2, n_samples)  # trustScore: beta distribution
        X[:, 1] = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])  # locationProximity: mostly 0
        X[:, 2] = np.random.exponential(7, n_samples)  # timeWaiting: exponential
        X[:, 3] = np.random.poisson(2, n_samples)  # completedCycles: poisson
        X[:, 4] = np.random.poisson(5, n_samples)  # donationHistory: poisson
        X[:, 5] = np.random.rand(n_samples)  # categoryPreference: uniform
        X[:, 6] = 25 + np.random.exponential(10, n_samples)  # age: shifted exponential
        X[:, 7] = np.random.exponential(100, n_samples)  # accountAge: exponential

        # Target: match score (weighted combination)
        weights = [0.3, 0.25, 0.2, 0.15, 0.05, 0.025, 0.025, 0.1]
        y = np.dot(X, weights) + np.random.normal(0, 0.1, n_samples)
        y = np.clip(y, 0, 1)  # Clamp to [0, 1]

        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Train model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_scaled, y)

        # Save model
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)

        print("Trained and saved new AI matching model", file=sys.stderr)

    def predict_score(self, features, amount):
        """Predict match score for given features and amount"""
        try:
            # Extract features in correct order
            feature_vector = np.array([
                features.get('trustScore', 0.5),
                features.get('locationProximity', 0),
                features.get('timeWaiting', 0),
                features.get('completedCycles', 0),
                features.get('donationHistory', 0),
                features.get('categoryPreference', 0),
                features.get('age', 25),
                features.get('accountAge', 0)
            ]).reshape(1, -1)

            # Scale features
            if self.scaler:
                feature_vector = self.scaler.transform(feature_vector)

            # Predict score
            score = self.model.predict(feature_vector)[0]

            # Adjust based on amount (higher amounts get slightly higher priority)
            amount_factor = min(amount / 10000, 1) * 0.1
            score = min(score + amount_factor, 1.0)

            return max(0.0, min(1.0, score))

        except Exception as e:
            print(f"AI prediction failed: {e}", file=sys.stderr)
            # Fallback to rule-based scoring
            return self.rule_based_score(features, amount)

    def rule_based_score(self, features, amount):
        """Fallback rule-based scoring"""
        score = 0.0

        # Trust score (30%)
        score += features.get('trustScore', 0.5) * 0.3

        # Location proximity (25%)
        score += features.get('locationProximity', 0) * 0.25

        # Time waiting (20%) - normalize to max 30 days
        time_score = min(features.get('timeWaiting', 0) / 30.0, 1.0)
        score += time_score * 0.2

        # Donation history (15%) - normalize to max 10
        history_score = min(features.get('donationHistory', 0) / 10.0, 1.0)
        score += history_score * 0.15

        # Completed cycles (10%) - normalize to max 5
        cycle_score = min(features.get('completedCycles', 0) / 5.0, 1.0)
        score += cycle_score * 0.1

        # Randomization for fairness (10%)
        score += np.random.random() * 0.1

        return max(0.0, min(1.0, score))

def main():
    if len(sys.argv) < 3:
        print("Usage: python ml-matching.service.py <features_json> <amount>", file=sys.stderr)
        sys.exit(1)

    try:
        features_json = sys.argv[1]
        amount = float(sys.argv[2])

        features = json.loads(features_json)

        service = AIMatchingService()
        score = service.predict_score(features, amount)

        print(f"{score:.6f}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        # Return fallback score
        print("0.500000")
        sys.exit(1)

if __name__ == "__main__":
    main()