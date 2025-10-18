# ChainGive Data Migration Guide

## Overview

This guide provides detailed procedures for migrating user data, donation histories, AI insights, and other critical data from the existing React Native/Next.js platform to the new Flutter implementation.

## Migration Scope

### Data Categories to Migrate

1. **User Accounts & Profiles**
   - Authentication data (Firebase Auth handles this)
   - Profile information (name, location, preferences)
   - KYC status and verification documents
   - Trust scores and user metrics

2. **Donation History**
   - All donation records with relationships
   - P2P transaction data
   - Payment processing information
   - AI insights and recommendations

3. **Coin Economy Data**
   - Coin balances and transaction history
   - Escrow records and pending transactions
   - Achievement and gamification data
   - Purchase history and redemptions

4. **AI & Analytics Data**
   - User behavior patterns and insights
   - AI recommendation models and feedback
   - Fraud detection data and risk assessments
   - Performance analytics and metrics

5. **Social Features**
   - Community posts and interactions
   - Social circles and memberships
   - Comments, likes, and engagement data

## Migration Strategy

### Approach: Incremental Migration with Validation

**Phase 1: Data Export & Preparation**
- Extract data from source databases
- Clean and validate data integrity
- Transform data structures for Flutter backend
- Create migration metadata and audit trails

**Phase 2: Parallel Operation**
- Run both React Native and Flutter apps
- Gradual user migration with feature flags
- Real-time data synchronization
- Rollback capabilities

**Phase 3: Full Migration & Validation**
- Complete user migration
- Data integrity verification
- Performance validation
- Legacy system decommissioning

## Technical Implementation

### ETL Pipeline Architecture

```dart:migration_pipeline.dart
class MigrationPipeline {
  final SourceDatabase _sourceDb;
  final TargetApiClient _targetApi;
  final ValidationService _validator;
  final RollbackService _rollback;

  Future<MigrationResult> executeMigration() async {
    try {
      // Phase 1: Export and validate
      final exportResult = await _exportData();
      final validationResult = await _validator.validateExport(exportResult);

      if (!validationResult.isValid) {
        throw MigrationException('Data validation failed: ${validationResult.issues}');
      }

      // Phase 2: Transform and import
      final transformedData = await _transformData(exportResult);
      final importResult = await _importData(transformedData);

      // Phase 3: Verify and cleanup
      final verificationResult = await _verifyMigration(importResult);
      await _cleanupMigrationArtifacts();

      return MigrationResult.success(
        migratedRecords: importResult.totalRecords,
        validationResults: verificationResult,
      );

    } catch (e) {
      await _rollback.executeRollback();
      return MigrationResult.failure(error: e.toString());
    }
  }
}
```

### User Data Migration

#### Source Data Structure (React Native)
```sql
-- Source: chaingive-mobile database
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phoneNumber TEXT,
  firstName TEXT,
  lastName TEXT,
  trustScore REAL DEFAULT 5.0,
  totalDonated REAL DEFAULT 0,
  totalReceived REAL DEFAULT 0,
  charityCoinsBalance REAL DEFAULT 0,
  kycStatus TEXT DEFAULT 'pending',
  locationCity TEXT,
  locationState TEXT,
  lastLoginAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Target Data Structure (Flutter)
```sql
-- Target: chaingive-backend (Prisma schema)
model User {
  id                       String                   @id @default(cuid())
  email                    String?                  @unique
  passwordHash             String?
  phoneNumber              String?                  @unique
  firstName                String?
  lastName                 String?
  role                     String                   @default("Donor")
  tier                     Int                      @default(1)
  trustScore               Float                    @default(5.0)
  totalCyclesCompleted     Int                      @default(0)
  totalDonated             Float                    @default(0)
  totalReceived            Float                    @default(0)
  charityCoinsBalance      Float                    @default(0)
  kycStatus                String                   @default("pending")
  isActive                 Boolean                  @default(true)
  isBanned                 Boolean                  @default(false)
  locationCity             String?
  locationState            String?
  lastLoginAt              DateTime?
  createdAt                DateTime                 @default(now())
  updatedAt                DateTime                 @updatedAt
}
```

#### Migration Script
```dart:user_migration.dart
class UserMigrationService {
  Future<List<MigratedUser>> migrateUsers() async {
    final users = await _sourceDb.query('''
      SELECT id, email, phoneNumber, firstName, lastName,
             trustScore, totalDonated, totalReceived, charityCoinsBalance,
             kycStatus, locationCity, locationState, lastLoginAt, createdAt
      FROM users
      WHERE isActive = 1
      ORDER BY createdAt ASC
    ''');

    final migratedUsers = <MigratedUser>[];

    for (final user in users) {
      try {
        // Data cleansing and validation
        final cleanedUser = await _cleanseUserData(user);

        // AI-powered location validation
        final validatedLocation = await _validateAfricanLocation(
          cleanedUser.locationCity,
          cleanedUser.locationState,
        );

        // Create user in target system
        final targetUser = await _targetApi.post('/admin/migrate/user', data: {
          'legacyId': user['id'],
          'user': {
            ...cleanedUser.toJson(),
            'locationValidated': validatedLocation,
            'migrationMetadata': {
              'source': 'react_native_app',
              'migratedAt': DateTime.now().toIso8601String(),
              'dataQuality': await _assessDataQuality(user),
            },
          },
        });

        migratedUsers.add(MigratedUser(
          legacyId: user['id'],
          newId: targetUser.data['id'],
          status: 'completed',
        ));

        print('Migrated user: ${cleanedUser.email}');

      } catch (e) {
        print('Failed to migrate user ${user['id']}: $e');
        await _logMigrationError(user['id'], e.toString());

        migratedUsers.add(MigratedUser(
          legacyId: user['id'],
          status: 'failed',
          error: e.toString(),
        ));
      }
    }

    return migratedUsers;
  }

  Future<UserData> _cleanseUserData(Map<String, dynamic> user) async {
    return UserData(
      email: user['email']?.toString().toLowerCase().trim(),
      phoneNumber: _cleanPhoneNumber(user['phoneNumber']),
      firstName: _capitalizeName(user['firstName']),
      lastName: _capitalizeName(user['lastName']),
      trustScore: user['trustScore'] ?? 5.0,
      totalDonated: user['totalDonated'] ?? 0.0,
      totalReceived: user['totalReceived'] ?? 0.0,
      charityCoinsBalance: user['charityCoinsBalance'] ?? 0.0,
      kycStatus: user['kycStatus'] ?? 'pending',
      locationCity: user['locationCity'],
      locationState: user['locationState'],
      lastLoginAt: user['lastLoginAt'] != null
          ? DateTime.parse(user['lastLoginAt'])
          : null,
      createdAt: DateTime.parse(user['createdAt']),
    );
  }

  String? _cleanPhoneNumber(String? phone) {
    if (phone == null) return null;

    final cleaned = phone.replaceAll(RegExp(r'[^\d]'), '');

    // Add Nigerian prefix if missing
    if (cleaned.length == 10 && cleaned.startsWith('0')) {
      return '+234${cleaned.substring(1)}';
    }

    return phone; // Return original if can't clean
  }

  String? _capitalizeName(String? name) {
    if (name == null) return null;
    return name.split(' ').map((word) =>
      word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1).toLowerCase()}' : word
    ).join(' ');
  }

  Future<bool> _validateAfricanLocation(String? city, String? state) async {
    if (city == null) return false;

    try {
      final response = await _targetApi.get('/geocode/validate', queryParameters: {
        'city': city,
        'state': state,
        'continent': 'Africa'
      });

      return response.data['isValid'] ?? false;
    } catch (e) {
      return false;
    }
  }

  Future<double> _assessDataQuality(Map<String, dynamic> user) async {
    double quality = 1.0;

    // Reduce quality for missing critical fields
    if (user['email'] == null) quality -= 0.3;
    if (user['firstName'] == null) quality -= 0.2;
    if (user['kycStatus'] != 'verified') quality -= 0.1;

    // Assess completeness
    final completeness = [user['email'], user['firstName'], user['lastName'],
                         user['locationCity'], user['locationState']]
        .where((field) => field != null).length / 5;

    return (quality * completeness).clamp(0.0, 1.0);
  }

  Future<void> _logMigrationError(String userId, String error) async {
    await _targetApi.post('/admin/migration-error', data: {
      'userId': userId,
      'error': error,
      'timestamp': DateTime.now().toIso8601String(),
      'phase': 'user_migration',
    });
  }
}
```

### Donation Data Migration

#### Complex Relationship Preservation
```dart:donation_migration.dart
class DonationMigrationService {
  Future<List<MigratedDonation>> migrateDonations() async {
    // Migrate donations with all relationships intact
    final donations = await _sourceDb.query('''
      SELECT d.id, d.userId, d.amount, d.categoryId, d.cycleId,
             d.createdAt, u.email as userEmail, c.name as categoryName
      FROM donations d
      JOIN users u ON d.userId = u.id
      JOIN donation_categories c ON d.categoryId = c.id
      ORDER BY d.createdAt ASC
    ''');

    for (final donation in donations) {
      try {
        // Extract AI insights from historical data
        final aiInsights = await _extractHistoricalAIInsights(donation);

        // Fraud detection on historical data
        final fraudCheck = await _targetApi.post('/ai/historical-fraud-check', data: {
          'donation': {
            'id': donation['id'],
            'userId': donation['userId'],
            'amount': donation['amount'],
            'category': donation['categoryName'],
            'createdAt': donation['createdAt'],
          }
        });

        if (fraudCheck.data['isFraudulent']) {
          await _flagSuspiciousDonation(donation['id'], fraudCheck.data);
          continue;
        }

        // Migrate donation with enhanced data
        await _targetApi.post('/admin/migrate/donation', data: {
          'legacyId': donation['id'],
          'userId': donation['userId'],
          'amount': donation['amount'],
          'categoryId': donation['categoryId'],
          'cycleId': donation['cycleId'],
          'createdAt': donation['createdAt'],
          'aiInsights': aiInsights,
          'fraudCheck': fraudCheck.data,
          'migrationMetadata': {
            'source': 'react_native_app',
            'dataQuality': 'high',
            'relationshipsPreserved': true,
          },
        });

      } catch (e) {
        print('Failed to migrate donation ${donation['id']}: $e');
      }
    }
  }

  Future<Map<String, dynamic>> _extractHistoricalAIInsights(Map<String, dynamic> donation) async {
    // Extract patterns from historical donation data
    final userHistory = await _sourceDb.query('''
      SELECT amount, createdAt, categoryId
      FROM donations
      WHERE userId = ?
      ORDER BY createdAt DESC
      LIMIT 50
    ''', [donation['userId']]);

    return {
      'donationPattern': _analyzeDonationPattern(userHistory),
      'amountPreference': _analyzeAmountPreferences(userHistory),
      'timingInsights': _analyzeTimingPatterns(userHistory),
      'categoryPreferences': _analyzeCategoryPreferences(userHistory),
    };
  }
}
```

### AI Data Migration

#### Preserving ML Model Insights
```dart:ai_data_migration.dart
class AIDataMigrationService {
  Future<void> migrateAIData() async {
    // Migrate user behavior models
    final userModels = await _sourceDb.query('SELECT * FROM ai_user_models');
    for (final model in userModels) {
      await _migrateUserModel(model);
    }

    // Migrate recommendation feedback
    final feedback = await _sourceDb.query('SELECT * FROM ai_feedback');
    for (final item in feedback) {
      await _migrateFeedback(item);
    }

    // Migrate fraud detection data
    final fraudData = await _sourceDb.query('SELECT * FROM fraud_assessments');
    for (final assessment in fraudData) {
      await _migrateFraudAssessment(assessment);
    }
  }

  Future<void> _migrateUserModel(Map<String, dynamic> model) async {
    // Transform and enhance user model for Flutter AI system
    final enhancedModel = {
      'userId': model['userId'],
      'behaviorPatterns': jsonDecode(model['patterns']),
      'recommendationPreferences': jsonDecode(model['preferences']),
      'riskProfile': _calculateRiskProfile(model),
      'engagementMetrics': _calculateEngagementMetrics(model),
      'migratedAt': DateTime.now().toIso8601String(),
      'modelVersion': 'flutter_v1',
    };

    await _targetApi.post('/ai/models/migrate', data: enhancedModel);
  }
}
```

## Validation & Verification

### Data Integrity Checks
```dart:validation_service.dart
class MigrationValidationService {
  Future<ValidationReport> validateMigration() async {
    final reports = <ValidationCheck>[];

    // User count validation
    reports.add(await _validateUserCounts());

    // Donation relationship validation
    reports.add(await _validateDonationRelationships());

    // Financial data integrity
    reports.add(await _validateFinancialData());

    // AI data consistency
    reports.add(await _validateAIData());

    return ValidationReport(
      checks: reports,
      overallStatus: reports.every((r) => r.passed) ? 'PASSED' : 'FAILED',
      timestamp: DateTime.now(),
    );
  }

  Future<ValidationCheck> _validateUserCounts() async {
    final sourceCount = await _sourceDb.query('SELECT COUNT(*) as count FROM users');
    final targetCount = await _targetApi.get('/admin/stats/users');

    final passed = (sourceCount[0]['count'] - targetCount.data['count']).abs() <= 10; // Allow 10 record tolerance

    return ValidationCheck(
      name: 'User Count Validation',
      passed: passed,
      sourceCount: sourceCount[0]['count'],
      targetCount: targetCount.data['count'],
      tolerance: 10,
    );
  }

  Future<ValidationCheck> _validateDonationRelationships() async {
    // Complex validation of donation relationships
    final sampleDonations = await _sourceDb.query('SELECT id, userId FROM donations LIMIT 100');

    bool allValid = true;
    for (final donation in sampleDonations) {
      final targetDonation = await _targetApi.get('/donations/${donation['id']}');
      if (targetDonation.data['userId'] != donation['userId']) {
        allValid = false;
        break;
      }
    }

    return ValidationCheck(
      name: 'Donation Relationship Validation',
      passed: allValid,
      details: 'Validated donation-to-user relationships',
    );
  }
}
```

## Rollback Procedures

### Emergency Rollback
```dart:rollback_service.dart
class RollbackService {
  Future<void> executeEmergencyRollback() async {
    // 1. Restore database from backup
    await _restoreDatabaseBackup();

    // 2. Revert API endpoints
    await _revertApiEndpoints();

    // 3. Restore app store versions
    await _restoreAppStoreVersions();

    // 4. Notify users of rollback
    await _notifyUsersOfRollback();

    // 5. Update monitoring and alerting
    await _updateMonitoringConfiguration();
  }

  Future<void> executePartialRollback({
    required List<String> featuresToDisable,
  }) async {
    // Disable problematic features via feature flags
    for (final feature in featuresToDisable) {
      await _featureFlagService.disable(feature);
    }

    // Roll back specific data if needed
    await _rollbackSpecificData(featuresToDisable);

    // Update user communications
    await _notifyUsersOfPartialRollback(featuresToDisable);
  }
}
```

## Migration Timeline

### Phase 1: Preparation (Week 1)
- Database backups and snapshots
- Migration scripts development and testing
- Data validation rules establishment
- Rollback procedures documentation

### Phase 2: Dry Run (Week 2)
- Test migration on staging environment
- Performance benchmarking
- Data validation testing
- Issue identification and fixes

### Phase 3: Production Migration (Week 3)
- Incremental user migration (10% → 50% → 100%)
- Real-time monitoring and alerting
- Support team readiness
- User communication campaigns

### Phase 4: Post-Migration (Week 4)
- Data integrity verification
- Performance optimization
- User feedback collection
- Legacy system decommissioning

## Risk Mitigation

### Critical Risks
1. **Data Loss**: Multiple backup strategies, validation checks
2. **Downtime**: Incremental migration, feature flags
3. **User Impact**: Beta testing, gradual rollout
4. **Performance**: Load testing, optimization

### Monitoring & Alerting
- Real-time migration progress dashboard
- Automated validation checks
- Performance monitoring
- User impact assessment

## Success Criteria

### Technical Success
- ✅ 100% user data migration with <0.1% data loss
- ✅ All donation relationships preserved
- ✅ AI insights and models transferred
- ✅ System performance maintained or improved

### Business Success
- ✅ User retention >95% during migration
- ✅ No critical functionality downtime
- ✅ Positive user feedback on new features
- ✅ Enhanced platform capabilities demonstrated

## Support & Communication

### User Communication Plan
- Pre-migration: Feature announcements and benefits
- During migration: Progress updates and support channels
- Post-migration: New feature guides and feedback collection

### Support Team Preparation
- Training on Flutter app features
- Migration troubleshooting guides
- User communication templates
- Escalation procedures

This comprehensive data migration guide ensures a smooth transition from React Native to Flutter while preserving all critical data relationships and enhancing the platform with AI-driven insights.