-- Admin System Database Migration
-- Run this script to create the necessary tables for the admin system

-- Admin Actions Logging Table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX idx_admin_actions_admin_id (admin_id),
    INDEX idx_admin_actions_action (action),
    INDEX idx_admin_actions_created_at (created_at)
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    INDEX idx_feature_flags_feature_name (feature_name)
);

-- Insert default feature flags
INSERT INTO feature_flags (feature_name, description, is_enabled) VALUES
('donations', 'Core donation functionality', TRUE),
('marketplace', 'Charity coin marketplace', TRUE),
('leaderboard', 'User leaderboards and rankings', TRUE),
('referrals', 'Referral program', TRUE),
('disputes', 'Dispute resolution system', TRUE),
('coin_purchases', 'Coin purchase from agents', TRUE),
('agent_network', 'Agent verification network', TRUE),
('kyc_verification', 'KYC verification process', TRUE),
('push_notifications', 'Push notification system', TRUE),
('sms_notifications', 'SMS notification system', TRUE),
('email_notifications', 'Email notification system', TRUE),
('force_recycle', 'Force recycle feature', TRUE),
('match_expiration', 'Match expiration system', TRUE),
('escrow_release', 'Escrow release system', TRUE),
('analytics', 'Advanced analytics dashboard', FALSE),
('social_features', 'Social circles and posts', FALSE),
('ai_recommendations', 'AI-powered recommendations', FALSE),
('crypto_gateways', 'Crypto payment gateways', FALSE),
('merchant_services', 'Merchant payment services', FALSE),
('corporate_accounts', 'Corporate donation accounts', FALSE),
('auction_system', 'Advanced auction marketplace', FALSE),
('battle_pass', 'Battle pass gamification', FALSE)
ON CONFLICT (feature_name) DO NOTHING;

-- Create trigger for updated_at on feature_flags
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON admin_actions TO chaingive_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON feature_flags TO chaingive_app;

COMMENT ON TABLE admin_actions IS 'Audit log for all admin actions performed in the system';
COMMENT ON TABLE feature_flags IS 'Feature flags for enabling/disabling platform features dynamically';