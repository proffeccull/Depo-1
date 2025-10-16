import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { featureFlagService } from '../../services/featureFlagService';
import { FeatureFlag, FlagAnalytics, FlagEnvironment } from '../../types/featureFlags';
import { useTranslation } from 'react-i18next';

// Components
import Button from '../../components/ui/Button';
import Input from '../../components/common/Input';
import Card from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';

// Environment colors
const ENVIRONMENT_COLORS = {
  development: '#10B981',
  staging: '#F59E0B',
  production: '#EF4444',
};

type FeatureFlagManagementScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'FeatureFlagManagement'
>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FeatureFlagManagementScreen: React.FC = () => {
  const navigation = useNavigation<FeatureFlagManagementScreenNavigationProp>();
  const { t } = useTranslation();

  // State
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<'development' | 'staging' | 'production'>('development');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [analytics, setAnalytics] = useState<Map<string, FlagAnalytics>>(new Map());

  // Load flags
  const loadFlags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await featureFlagService.getFlags();
      setFlags(response.flags);

      // Load analytics for each flag
      const analyticsMap = new Map<string, FlagAnalytics>();
      for (const flag of response.flags) {
        const flagAnalytics = featureFlagService.getFlagAnalytics(flag.key, selectedEnvironment);
        if (flagAnalytics) {
          analyticsMap.set(flag.key, flagAnalytics);
        }
      }
      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Error loading flags:', error);
      Alert.alert(t('error'), t('failed_to_load_flags'));
    } finally {
      setLoading(false);
    }
  }, [selectedEnvironment, t]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFlags();
    setRefreshing(false);
  }, [loadFlags]);

  // Toggle flag for environment
  const toggleFlag = useCallback(async (flag: FeatureFlag, environment: keyof typeof flag.environments) => {
    try {
      const env = flag.environments[environment];
      await featureFlagService.updateEnvironment(flag.key, environment, {
        enabled: !env.enabled,
        value: env.value,
        rules: env.rules,
        prerequisites: env.prerequisites,
        rolloutPercentage: env.rolloutPercentage,
      });
      await loadFlags();
    } catch (error) {
      console.error('Error toggling flag:', error);
      Alert.alert(t('error'), t('failed_to_toggle_flag'));
    }
  }, [loadFlags, t]);

  // Delete flag
  const deleteFlag = useCallback(async (flagKey: string) => {
    Alert.alert(
      t('confirm_delete'),
      t('delete_flag_confirmation'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await featureFlagService.deleteFlag(flagKey);
              await loadFlags();
            } catch (error) {
              console.error('Error deleting flag:', error);
              Alert.alert(t('error'), t('failed_to_delete_flag'));
            }
          },
        },
      ]
    );
  }, [loadFlags, t]);

  // Initialize
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // Render environment selector
  const renderEnvironmentSelector = () => (
    <View style={styles.environmentSelector}>
      {(['development', 'staging', 'production'] as const).map((env) => (
        <TouchableOpacity
          key={env}
          style={[
            styles.environmentButton,
            selectedEnvironment === env && styles.selectedEnvironmentButton,
            { borderColor: ENVIRONMENT_COLORS[env] },
          ]}
          onPress={() => setSelectedEnvironment(env)}
        >
          <View
            style={[
              styles.environmentIndicator,
              { backgroundColor: ENVIRONMENT_COLORS[env] },
            ]}
          />
          <Text
            style={[
              styles.environmentText,
              selectedEnvironment === env && styles.selectedEnvironmentText,
            ]}
          >
            {t(env)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render flag card
  const renderFlagCard = (flag: FeatureFlag) => {
    const env = flag.environments[selectedEnvironment as keyof typeof flag.environments];
    const flagAnalytics = analytics.get(flag.key);

    return (
      <Card key={flag.key} style={styles.flagCard}>
        <View style={styles.flagHeader}>
          <View style={styles.flagInfo}>
            <Text style={[styles.flagName, { color: colors.text.primary }]}>
              {flag.name}
            </Text>
            <Text style={[styles.flagKey, { color: colors.text.secondary }]}>
              {flag.key}
            </Text>
            <Text style={[styles.flagDescription, { color: colors.text.secondary }]}>
              {flag.description}
            </Text>
          </View>
          <View style={styles.flagActions}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                env.enabled && { backgroundColor: ENVIRONMENT_COLORS[selectedEnvironment as keyof typeof ENVIRONMENT_COLORS] },
              ]}
              onPress={() => toggleFlag(flag, selectedEnvironment)}
            >
              <Icon
                name={env.enabled ? 'toggle-on' : 'toggle-off'}
                size={24}
                color={env.enabled ? '#FFFFFF' : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSelectedFlag(flag)}
            >
              <Icon name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteFlag(flag.key)}
            >
              <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Flag Status */}
        <View style={styles.flagStatus}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.text.secondary }]}>
              {t('status')}:
            </Text>
            <Text
              style={[
                styles.statusValue,
                { color: env.enabled ? colors.success : colors.text.secondary },
              ]}
            >
              {env.enabled ? t('enabled') : t('disabled')}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: colors.text.secondary }]}>
              {t('value')}:
            </Text>
            <Text style={[styles.statusValue, { color: colors.text.primary }]}>
              {JSON.stringify(env.value)}
            </Text>
          </View>
          {flagAnalytics && (
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colors.text.secondary }]}>
                {t('evaluations')}:
              </Text>
              <Text style={[styles.statusValue, { color: colors.text.primary }]}>
                {flagAnalytics.totalEvaluations}
              </Text>
            </View>
          )}
        </View>

        {/* Targeting Rules */}
        {env.rules.length > 0 && (
          <View style={styles.targetingSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              {t('targeting_rules')} ({env.rules.length})
            </Text>
            {env.rules.slice(0, 2).map((rule: any, index: number) => (
              <View key={rule.id} style={styles.ruleItem}>
                <Text style={[styles.ruleName, { color: colors.text.primary }]}>
                  {rule.name}
                </Text>
                <Text style={[styles.ruleDescription, { color: colors.text.secondary }]}>
                  {rule.conditions.length} {t('conditions')}
                </Text>
              </View>
            ))}
            {env.rules.length > 2 && (
              <Text style={[styles.moreRules, { color: colors.primary }]}>
                +{env.rules.length - 2} {t('more_rules')}
              </Text>
            )}
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <LoadingSpinner visible={true} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.medium }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {t('feature_flags')}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Environment Selector */}
      {renderEnvironmentSelector()}

      {/* Flags List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {flags.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="flag" size={64} color={colors.text.secondary} />
            <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
              {t('no_flags_found')}
            </Text>
            <Button
              label={t('create_first_flag')}
              onPress={() => setShowCreateModal(true)}
              className="mt-4"
            />
          </View>
        ) : (
          flags.map(renderFlagCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  environmentSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  environmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  selectedEnvironmentButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  environmentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  environmentText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  selectedEnvironmentText: {
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flagCard: {
    marginVertical: 8,
    padding: 16,
  },
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  flagInfo: {
    flex: 1,
    marginRight: 12,
  },
  flagName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  flagKey: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 14,
  },
  flagActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    padding: 8,
  },
  flagStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  targetingSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  ruleItem: {
    marginBottom: 8,
  },
  ruleName: {
    fontSize: 13,
    fontWeight: '500',
  },
  ruleDescription: {
    fontSize: 12,
  },
  moreRules: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    minWidth: 200,
  },
});

export default FeatureFlagManagementScreen;