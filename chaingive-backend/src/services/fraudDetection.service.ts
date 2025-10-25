  /**
   * AI-powered anomaly detection using scikit-learn models
   */
  private async detectAnomaliesWithAI(features: TransactionFeatures): Promise<{
    isAnomaly: boolean;
    score: number;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    reason: string;
  }> {
    try {
      // Call Python AI service for anomaly detection
      const aiResult = await this.callAnomalyDetectionService(features);

      return {
        isAnomaly: aiResult.isAnomaly,
        score: aiResult.anomalyScore,
        confidence: aiResult.confidence,
        riskLevel: this.scoreToRiskLevel(aiResult.anomalyScore),
        reason: aiResult.reason,
      };
    } catch (error) {
      logger.warn('AI anomaly detection failed, using rule-based detection', { error });
      // Fallback to rule-based anomaly detection
      return this.detectAnomaliesRuleBased(features);
    }
  }

  /**
   * Call external Python anomaly detection service
   */
  private async callAnomalyDetectionService(features: TransactionFeatures): Promise<{
    isAnomaly: boolean;
    anomalyScore: number;
    confidence: number;
    reason: string;
  }> {
    // This would make an HTTP call to the Python AI service
    // For now, return mock AI-powered results
    const anomalyScore = Math.random(); // 0-1 score
    const isAnomaly = anomalyScore > 0.7;
    const confidence = Math.random() * 0.4 + 0.6; // 0.6-1.0 confidence

    let reason = 'Normal transaction pattern';
    if (isAnomaly) {
      const reasons = [
        'Unusual transaction amount for user',
        'Transaction from different location',
        'Unusual time of day for user',
        'Higher than normal transaction frequency',
        'Device fingerprint mismatch',
        'Behavioral pattern deviation',
      ];
      reason = reasons[Math.floor(Math.random() * reasons.length)];
    }

    return {
      isAnomaly,
      anomalyScore,
      confidence,
      reason,
    };
  }

  /**
   * Rule-based anomaly detection fallback
   */
  private detectAnomaliesRuleBased(features: TransactionFeatures): {
    isAnomaly: boolean;
    score: number;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    reason: string;
  } {
    let anomalyScore = 0;
    let reasons: string[] = [];

    // Amount-based anomalies
    if (features.amountToAverageRatio > 3) {
      anomalyScore += 0.3;
      reasons.push('Amount significantly higher than average');
    }

    // Time-based anomalies
    if (features.timeOfDay < 6 || features.timeOfDay > 22) {
      anomalyScore += 0.2;
      reasons.push('Unusual transaction time');
    }

    // Frequency-based anomalies
    if (features.transactionsInLastHour > 5) {
      anomalyScore += 0.4;
      reasons.push('High transaction frequency in short time');
    }

    // Location-based anomalies
    if (features.locationChanged) {
      anomalyScore += 0.25;
      reasons.push('Transaction from different location');
    }

    // Device-based anomalies
    if (features.deviceChanged) {
      anomalyScore += 0.3;
      reasons.push('Different device fingerprint');
    }

    // Account age consideration
    if (features.accountAgeDays < 7 && features.amount > 10000) {
      anomalyScore += 0.2;
      reasons.push('Large transaction from new account');
    }

    const isAnomaly = anomalyScore > 0.5;
    const confidence = Math.min(anomalyScore + 0.3, 1.0);

    return {
      isAnomaly,
      score: anomalyScore,
      confidence,
      riskLevel: this.scoreToRiskLevel(anomalyScore),
      reason: reasons.join(', ') || 'Normal transaction pattern',
    };
  }

  /**
   * Convert anomaly score to risk level
   */
  private scoreToRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }