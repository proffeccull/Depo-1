-- ChainGive Database Schema Expansion
-- Phase 1: Foundation Infrastructure
-- Priority: Critical - All other features depend on this

-- Analytics Events Table
CREATE TABLE analytics_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    event_type VARCHAR(100) NOT NULL,
    event_data JSON,
    user_id VARCHAR(36),
    session_id VARCHAR(100),
    device_info JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_event_type_created (event_type, created_at),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_session_created (session_id, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Social Circles Table
CREATE TABLE social_circles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id VARCHAR(36) NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    member_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_creator_created (creator_id, created_at),
    INDEX idx_private_created (is_private, created_at),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Social Circle Members Table
CREATE TABLE social_circle_members (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    circle_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('member', 'moderator', 'admin') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_circle_member (circle_id, user_id),
    INDEX idx_user_circles (user_id),
    FOREIGN KEY (circle_id) REFERENCES social_circles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Social Posts Table
CREATE TABLE social_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    circle_id VARCHAR(36),
    author_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    media_urls JSON,
    post_type ENUM('text', 'image', 'video', 'donation_story') DEFAULT 'text',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_circle_created (circle_id, created_at),
    INDEX idx_author_created (author_id, created_at),
    INDEX idx_type_created (post_type, created_at),
    FOREIGN KEY (circle_id) REFERENCES social_circles(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Recommendations Table
CREATE TABLE ai_recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    recommendation_type ENUM('donation_timing', 'amount_suggestion', 'recipient_match', 'coin_purchase') NOT NULL,
    recommendation_data JSON NOT NULL,
    confidence_score DECIMAL(3,2),
    is_accepted BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    INDEX idx_user_type_created (user_id, recommendation_type, created_at),
    INDEX idx_expires (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Merchant Accounts Table
CREATE TABLE merchant_accounts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    business_type VARCHAR(100),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address JSON,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    commission_rate DECIMAL(5,4) DEFAULT 0.0300,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_merchant (user_id),
    INDEX idx_verification_status (verification_status),
    INDEX idx_business_name (business_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Corporate Accounts Table
CREATE TABLE corporate_accounts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    employee_count INT,
    annual_revenue BIGINT,
    csr_budget BIGINT,
    contact_person VARCHAR(200),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    address JSON,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    subscription_tier ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_corporate (user_id),
    INDEX idx_verification_status (verification_status),
    INDEX idx_company_name (company_name),
    INDEX idx_subscription_tier (subscription_tier),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crypto Gateways Table
CREATE TABLE crypto_gateways (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    provider ENUM('btcpay', 'coinbase', 'cryptomus', 'binance', 'paypal') NOT NULL,
    supported_currencies JSON NOT NULL,
    api_endpoint VARCHAR(500),
    webhook_endpoint VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_provider (provider),
    INDEX idx_active (is_active)
);

-- Crypto Transactions Table
CREATE TABLE crypto_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    gateway_id VARCHAR(36) NOT NULL,
    external_id VARCHAR(200),
    transaction_type ENUM('coin_purchase', 'donation', 'withdrawal') NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    usd_equivalent DECIMAL(15,2),
    status ENUM('pending', 'confirmed', 'failed', 'cancelled') DEFAULT 'pending',
    blockchain_hash VARCHAR(200),
    confirmations INT DEFAULT 0,
    webhook_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_gateway_status (gateway_id, status),
    INDEX idx_external_id (external_id),
    INDEX idx_blockchain_hash (blockchain_hash),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gateway_id) REFERENCES crypto_gateways(id) ON DELETE RESTRICT
);

-- Auction Listings Table
CREATE TABLE auction_listings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    starting_price DECIMAL(15,2) NOT NULL,
    current_price DECIMAL(15,2),
    reserve_price DECIMAL(15,2),
    buy_now_price DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'USD',
    auction_type ENUM('standard', 'reserve', 'buy_now') DEFAULT 'standard',
    status ENUM('draft', 'active', 'ended', 'cancelled') DEFAULT 'draft',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    bid_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_seller_status (seller_id, status),
    INDEX idx_category_status (category, status),
    INDEX idx_end_time (end_time),
    INDEX idx_current_price (current_price),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Auction Bids Table
CREATE TABLE auction_bids (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    auction_id VARCHAR(36) NOT NULL,
    bidder_id VARCHAR(36) NOT NULL,
    bid_amount DECIMAL(15,2) NOT NULL,
    is_winning BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_auction_amount (auction_id, bid_amount DESC),
    INDEX idx_bidder_created (bidder_id, created_at),
    INDEX idx_winning_bids (is_winning),
    FOREIGN KEY (auction_id) REFERENCES auction_listings(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Battle Pass Seasons Table
CREATE TABLE battle_pass_seasons (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    max_tier INT DEFAULT 100,
    xp_per_tier INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT FALSE,
    rewards_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_active_dates (is_active, start_date, end_date),
    INDEX idx_end_date (end_date)
);

-- Battle Pass Progress Table
CREATE TABLE battle_pass_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    season_id VARCHAR(36) NOT NULL,
    current_tier INT DEFAULT 1,
    current_xp INT DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    claimed_rewards JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_season (user_id, season_id),
    INDEX idx_season_tier (season_id, current_tier),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES battle_pass_seasons(id) ON DELETE CASCADE
);

-- Seasonal Challenges Table
CREATE TABLE seasonal_challenges (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    season_id VARCHAR(36),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    challenge_type ENUM('donation_count', 'donation_amount', 'referral_count', 'social_activity') NOT NULL,
    target_value INT NOT NULL,
    reward_type ENUM('xp', 'coins', 'badge', 'item') NOT NULL,
    reward_value INT,
    reward_data JSON,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_season_active (season_id, is_active),
    INDEX idx_type_active (challenge_type, is_active),
    INDEX idx_end_date (end_date),
    FOREIGN KEY (season_id) REFERENCES battle_pass_seasons(id) ON DELETE CASCADE
);

-- Challenge Progress Table
CREATE TABLE challenge_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    challenge_id VARCHAR(36) NOT NULL,
    current_progress INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    reward_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_challenge (user_id, challenge_id),
    INDEX idx_user_completed (user_id, is_completed),
    INDEX idx_challenge_completed (challenge_id, is_completed),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES seasonal_challenges(id) ON DELETE CASCADE
);

-- Feature Flags Table
CREATE TABLE feature_flags (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    flag_name VARCHAR(100) NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    target_audience ENUM('all', 'premium', 'beta', 'admin') DEFAULT 'all',
    rollout_percentage INT DEFAULT 0,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_flag_name (flag_name),
    INDEX idx_enabled (is_enabled),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default feature flags for premium features
INSERT INTO feature_flags (flag_name, is_enabled, description, target_audience) VALUES
('analytics_dashboard', FALSE, 'Enable analytics dashboard for users', 'premium'),
('social_circles', FALSE, 'Enable social circles functionality', 'all'),
('ai_recommendations', FALSE, 'Enable AI-powered recommendations', 'premium'),
('crypto_payments', FALSE, 'Enable cryptocurrency payment gateways', 'all'),
('auction_system', FALSE, 'Enable auction marketplace', 'premium'),
('battle_pass', FALSE, 'Enable battle pass gamification', 'all'),
('merchant_accounts', FALSE, 'Enable merchant account features', 'all'),
('corporate_accounts', FALSE, 'Enable corporate account features', 'all'),
('live_events', FALSE, 'Enable live social events', 'premium'),
('advanced_gamification', FALSE, 'Enable advanced gamification features', 'all');

-- Admin Actions Audit Table
CREATE TABLE admin_actions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    admin_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_admin_created (admin_id, created_at),
    INDEX idx_action_created (action, created_at),
    INDEX idx_target (target_type, target_id),
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);