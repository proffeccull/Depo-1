-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'beginner',
    "tier" INTEGER NOT NULL DEFAULT 1,
    "trust_score" DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    "total_cycles_completed" INTEGER NOT NULL DEFAULT 0,
    "total_donated" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_received" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "charity_coins_balance" INTEGER NOT NULL DEFAULT 0,
    "kyc_status" TEXT NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" TEXT,
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "location_city" TEXT,
    "location_state" TEXT,
    "location_country" TEXT NOT NULL DEFAULT 'NG',
    "fcm_token" TEXT,
    "device_platform" TEXT,
    "profile_picture_url" TEXT,
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "referral_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fiat_balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "receivable_balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "pending_obligations" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_inflows" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_outflows" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "transaction_ref" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "from_user_id" TEXT,
    "to_user_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "fee" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "payment_provider_ref" TEXT,
    "cycle_id" TEXT,
    "metadata" JSONB,
    "blockchain_tx_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrows" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'holding',
    "hold_until" TIMESTAMP(3) NOT NULL,
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "refund_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "received_from_user_id" TEXT,
    "given_to_user_id" TEXT,
    "received_transaction_id" TEXT,
    "given_transaction_id" TEXT,
    "due_date" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "fulfilled_at" TIMESTAMP(3),
    "days_to_fulfill" INTEGER,
    "charity_coins_earned" INTEGER NOT NULL DEFAULT 0,
    "cycle_number" INTEGER NOT NULL DEFAULT 1,
    "is_second_donation" BOOLEAN NOT NULL DEFAULT false,
    "qualifies_for_receipt" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "donor_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority_score" DECIMAL(5,2),
    "matched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verification_type" TEXT NOT NULL,
    "verification_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verified_by_user_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agent_code" TEXT NOT NULL,
    "coin_balance" INTEGER NOT NULL DEFAULT 0,
    "total_coins_stocked" INTEGER NOT NULL DEFAULT 0,
    "total_coins_sold" INTEGER NOT NULL DEFAULT 0,
    "lifetime_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total_verifications" INTEGER NOT NULL DEFAULT 0,
    "total_commissions" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "suspended_until" TIMESTAMP(3),
    "suspension_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_listings" (
    "id" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "coin_price" INTEGER NOT NULL,
    "real_value" DECIMAL(12,2) NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_in_stock" BOOLEAN NOT NULL DEFAULT true,
    "payment_methods" TEXT[],
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "total_ratings" INTEGER NOT NULL DEFAULT 0,
    "total_redemptions" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redemptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "coins_spent" INTEGER NOT NULL,
    "real_value" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "delivery_method" TEXT,
    "delivery_data" JSONB,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_logs" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL DEFAULT 'polygon',
    "tx_hash" TEXT NOT NULL,
    "block_number" BIGINT,
    "gas_used" BIGINT,
    "gas_price" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "blockchain_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_wallets" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "qr_code_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_purchases_from_admin" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_coin" DECIMAL(10,4) NOT NULL,
    "total_amount" DECIMAL(12,4) NOT NULL,
    "cryptocurrency" TEXT NOT NULL,
    "crypto_network" TEXT NOT NULL,
    "payment_address" TEXT NOT NULL,
    "tx_hash" TEXT,
    "tx_proof_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "admin_approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coin_purchases_from_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_sales_to_users" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_per_coin" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "coins_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "payment_proof" TEXT,
    "paid_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "agent_commission" DECIMAL(12,2),
    "platform_revenue" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coin_sales_to_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_donations" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cycles_completed" INTEGER NOT NULL DEFAULT 0,
    "coins_earned" INTEGER NOT NULL DEFAULT 0,
    "avg_completion_days" INTEGER NOT NULL DEFAULT 0,
    "visibility_boost" INTEGER NOT NULL DEFAULT 0,
    "multiplier_boost" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "position_boost" INTEGER NOT NULL DEFAULT 0,
    "total_score" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_boosts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "leaderboard_id" TEXT NOT NULL,
    "boost_type" TEXT NOT NULL,
    "coins_spent" INTEGER NOT NULL,
    "boost_value" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_boosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_user_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "coins_earned" INTEGER NOT NULL DEFAULT 0,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "first_cycle_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "responder_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolution" TEXT,
    "resolution_type" TEXT,
    "mediator_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_messages" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_evidence" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_id" TEXT,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "feature_name" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamification_config" (
    "id" TEXT NOT NULL,
    "missionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "missionBonusReward" INTEGER NOT NULL DEFAULT 50,
    "weekendMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "streakEnabled" BOOLEAN NOT NULL DEFAULT true,
    "streakRewards" JSONB NOT NULL DEFAULT '{"1":10,"2":15,"3":20,"4":25,"5":30,"6":40,"7":50,"14":100,"30":250,"60":500,"90":1000}',
    "ringsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ringPerfectDayBonus" INTEGER NOT NULL DEFAULT 100,
    "giveGoal" INTEGER NOT NULL DEFAULT 1,
    "earnGoal" INTEGER NOT NULL DEFAULT 50,
    "engageGoal" INTEGER NOT NULL DEFAULT 3,
    "challengesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "achievementsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "gamification_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_templates" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reward" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'check-circle',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "daysOfWeek" JSONB NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "mission_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_missions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mission1Type" TEXT NOT NULL,
    "mission1Name" TEXT NOT NULL,
    "mission1Desc" TEXT NOT NULL,
    "mission1Done" BOOLEAN NOT NULL DEFAULT false,
    "mission1Reward" INTEGER NOT NULL DEFAULT 50,
    "mission2Type" TEXT NOT NULL,
    "mission2Name" TEXT NOT NULL,
    "mission2Desc" TEXT NOT NULL,
    "mission2Done" BOOLEAN NOT NULL DEFAULT false,
    "mission2Reward" INTEGER NOT NULL DEFAULT 30,
    "mission3Type" TEXT NOT NULL,
    "mission3Name" TEXT NOT NULL,
    "mission3Desc" TEXT NOT NULL,
    "mission3Done" BOOLEAN NOT NULL DEFAULT false,
    "mission3Reward" INTEGER NOT NULL DEFAULT 20,
    "allCompleted" BOOLEAN NOT NULL DEFAULT false,
    "bonusReward" INTEGER NOT NULL DEFAULT 50,
    "totalCoinsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "daily_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginDate" TIMESTAMP(3),
    "totalCoinsEarned" INTEGER NOT NULL DEFAULT 0,
    "streakLevel" TEXT NOT NULL DEFAULT 'bronze',
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "giveGoal" INTEGER NOT NULL DEFAULT 1,
    "giveProgress" INTEGER NOT NULL DEFAULT 0,
    "giveClosed" BOOLEAN NOT NULL DEFAULT false,
    "earnGoal" INTEGER NOT NULL DEFAULT 50,
    "earnProgress" INTEGER NOT NULL DEFAULT 0,
    "earnClosed" BOOLEAN NOT NULL DEFAULT false,
    "engageGoal" INTEGER NOT NULL DEFAULT 3,
    "engageProgress" INTEGER NOT NULL DEFAULT 0,
    "engageClosed" BOOLEAN NOT NULL DEFAULT false,
    "allRingsClosed" BOOLEAN NOT NULL DEFAULT false,
    "bonusAwarded" BOOLEAN NOT NULL DEFAULT false,
    "bonusAmount" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "rewardCoins" INTEGER NOT NULL DEFAULT 500,
    "rewardType" TEXT,
    "rewardValue" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_challenge_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "targetValue" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_challenge_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementValue" INTEGER NOT NULL,
    "rewardCoins" INTEGER NOT NULL DEFAULT 0,
    "rewardBadge" TEXT,
    "tier" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FFD700',
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "maxProgress" INTEGER NOT NULL,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "viewedAt" TIMESTAMP(3),

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gamification_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalCoinsEarned" INTEGER NOT NULL DEFAULT 0,
    "totalMissionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalPerfectDays" INTEGER NOT NULL DEFAULT 0,
    "totalAchievements" INTEGER NOT NULL DEFAULT 0,
    "weeklyMissionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "weeklyPerfectDays" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "nextLevelXP" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gamification_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_payment_configs" (
    "id" TEXT NOT NULL,
    "btcpayServerUrl" TEXT NOT NULL,
    "btcpayApiKey" TEXT NOT NULL,
    "btcpayStoreId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_coins" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "minAmount" DECIMAL(12,2) NOT NULL DEFAULT 10,
    "maxAmount" DECIMAL(12,2) NOT NULL DEFAULT 1000000,
    "confirmationsRequired" INTEGER NOT NULL DEFAULT 3,
    "icon" TEXT NOT NULL DEFAULT 'currency-btc',
    "color" TEXT NOT NULL DEFAULT '#F7931A',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_coins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_payments" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "cryptoCoinId" TEXT NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "ngnAmount" DECIMAL(12,2) NOT NULL,
    "cryptoAmount" DECIMAL(18,8) NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "transactionHash" TEXT,
    "confirmations" INTEGER,
    "adminNotes" TEXT,
    "confirmedBy" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "btcpayInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_payment_logs" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'termii',
    "cost" DECIMAL(8,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_reset_token_key" ON "users"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_trust_score_idx" ON "users"("trust_score");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "wallets_user_id_idx" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transaction_ref_key" ON "transactions"("transaction_ref");

-- CreateIndex
CREATE INDEX "transactions_transaction_ref_idx" ON "transactions"("transaction_ref");

-- CreateIndex
CREATE INDEX "transactions_from_user_id_idx" ON "transactions"("from_user_id");

-- CreateIndex
CREATE INDEX "transactions_to_user_id_idx" ON "transactions"("to_user_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "escrows_transaction_id_idx" ON "escrows"("transaction_id");

-- CreateIndex
CREATE INDEX "escrows_status_idx" ON "escrows"("status");

-- CreateIndex
CREATE INDEX "escrows_hold_until_idx" ON "escrows"("hold_until");

-- CreateIndex
CREATE INDEX "cycles_user_id_idx" ON "cycles"("user_id");

-- CreateIndex
CREATE INDEX "cycles_status_idx" ON "cycles"("status");

-- CreateIndex
CREATE INDEX "cycles_due_date_idx" ON "cycles"("due_date");

-- CreateIndex
CREATE INDEX "cycles_cycle_number_idx" ON "cycles"("cycle_number");

-- CreateIndex
CREATE INDEX "cycles_qualifies_for_receipt_idx" ON "cycles"("qualifies_for_receipt");

-- CreateIndex
CREATE INDEX "matches_donor_id_idx" ON "matches"("donor_id");

-- CreateIndex
CREATE INDEX "matches_recipient_id_idx" ON "matches"("recipient_id");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "kyc_records_user_id_idx" ON "kyc_records"("user_id");

-- CreateIndex
CREATE INDEX "kyc_records_status_idx" ON "kyc_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_records_user_id_verification_type_key" ON "kyc_records"("user_id", "verification_type");

-- CreateIndex
CREATE UNIQUE INDEX "agents_user_id_key" ON "agents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_agent_code_key" ON "agents"("agent_code");

-- CreateIndex
CREATE INDEX "agents_user_id_idx" ON "agents"("user_id");

-- CreateIndex
CREATE INDEX "agents_agent_code_idx" ON "agents"("agent_code");

-- CreateIndex
CREATE INDEX "agents_coin_balance_idx" ON "agents"("coin_balance");

-- CreateIndex
CREATE INDEX "marketplace_listings_category_idx" ON "marketplace_listings"("category");

-- CreateIndex
CREATE INDEX "marketplace_listings_is_active_idx" ON "marketplace_listings"("is_active");

-- CreateIndex
CREATE INDEX "redemptions_user_id_idx" ON "redemptions"("user_id");

-- CreateIndex
CREATE INDEX "redemptions_listing_id_idx" ON "redemptions"("listing_id");

-- CreateIndex
CREATE INDEX "redemptions_status_idx" ON "redemptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_logs_transaction_id_key" ON "blockchain_logs"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_logs_tx_hash_key" ON "blockchain_logs"("tx_hash");

-- CreateIndex
CREATE INDEX "blockchain_logs_transaction_id_idx" ON "blockchain_logs"("transaction_id");

-- CreateIndex
CREATE INDEX "blockchain_logs_tx_hash_idx" ON "blockchain_logs"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_wallets_address_key" ON "crypto_wallets"("address");

-- CreateIndex
CREATE INDEX "crypto_wallets_currency_idx" ON "crypto_wallets"("currency");

-- CreateIndex
CREATE INDEX "crypto_wallets_is_active_idx" ON "crypto_wallets"("is_active");

-- CreateIndex
CREATE INDEX "coin_purchases_from_admin_agent_id_idx" ON "coin_purchases_from_admin"("agent_id");

-- CreateIndex
CREATE INDEX "coin_purchases_from_admin_status_idx" ON "coin_purchases_from_admin"("status");

-- CreateIndex
CREATE INDEX "coin_purchases_from_admin_created_at_idx" ON "coin_purchases_from_admin"("created_at");

-- CreateIndex
CREATE INDEX "coin_sales_to_users_agent_id_idx" ON "coin_sales_to_users"("agent_id");

-- CreateIndex
CREATE INDEX "coin_sales_to_users_user_id_idx" ON "coin_sales_to_users"("user_id");

-- CreateIndex
CREATE INDEX "coin_sales_to_users_status_idx" ON "coin_sales_to_users"("status");

-- CreateIndex
CREATE INDEX "coin_sales_to_users_coins_locked_idx" ON "coin_sales_to_users"("coins_locked");

-- CreateIndex
CREATE INDEX "coin_sales_to_users_expires_at_idx" ON "coin_sales_to_users"("expires_at");

-- CreateIndex
CREATE INDEX "coin_sales_to_users_created_at_idx" ON "coin_sales_to_users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboards_user_id_key" ON "leaderboards"("user_id");

-- CreateIndex
CREATE INDEX "leaderboards_total_score_idx" ON "leaderboards"("total_score");

-- CreateIndex
CREATE INDEX "leaderboards_rank_idx" ON "leaderboards"("rank");

-- CreateIndex
CREATE INDEX "leaderboard_boosts_user_id_idx" ON "leaderboard_boosts"("user_id");

-- CreateIndex
CREATE INDEX "leaderboard_boosts_leaderboard_id_idx" ON "leaderboard_boosts"("leaderboard_id");

-- CreateIndex
CREATE INDEX "leaderboard_boosts_is_active_idx" ON "leaderboard_boosts"("is_active");

-- CreateIndex
CREATE INDEX "leaderboard_boosts_expires_at_idx" ON "leaderboard_boosts"("expires_at");

-- CreateIndex
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");

-- CreateIndex
CREATE INDEX "referrals_referred_user_id_idx" ON "referrals"("referred_user_id");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "disputes_reporter_id_idx" ON "disputes"("reporter_id");

-- CreateIndex
CREATE INDEX "disputes_responder_id_idx" ON "disputes"("responder_id");

-- CreateIndex
CREATE INDEX "disputes_transaction_id_idx" ON "disputes"("transaction_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "dispute_messages_dispute_id_idx" ON "dispute_messages"("dispute_id");

-- CreateIndex
CREATE INDEX "dispute_evidence_dispute_id_idx" ON "dispute_evidence"("dispute_id");

-- CreateIndex
CREATE INDEX "admin_actions_admin_id_idx" ON "admin_actions"("admin_id");

-- CreateIndex
CREATE INDEX "admin_actions_action_idx" ON "admin_actions"("action");

-- CreateIndex
CREATE INDEX "admin_actions_created_at_idx" ON "admin_actions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_feature_name_key" ON "feature_flags"("feature_name");

-- CreateIndex
CREATE INDEX "feature_flags_feature_name_idx" ON "feature_flags"("feature_name");

-- CreateIndex
CREATE INDEX "mission_templates_type_idx" ON "mission_templates"("type");

-- CreateIndex
CREATE INDEX "mission_templates_isActive_idx" ON "mission_templates"("isActive");

-- CreateIndex
CREATE INDEX "daily_missions_userId_idx" ON "daily_missions"("userId");

-- CreateIndex
CREATE INDEX "daily_missions_date_idx" ON "daily_missions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_missions_userId_date_key" ON "daily_missions"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_streaks_userId_key" ON "daily_streaks"("userId");

-- CreateIndex
CREATE INDEX "daily_progress_userId_idx" ON "daily_progress"("userId");

-- CreateIndex
CREATE INDEX "daily_progress_date_idx" ON "daily_progress"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_progress_userId_date_key" ON "daily_progress"("userId", "date");

-- CreateIndex
CREATE INDEX "weekly_challenges_isActive_idx" ON "weekly_challenges"("isActive");

-- CreateIndex
CREATE INDEX "weekly_challenges_startDate_endDate_idx" ON "weekly_challenges"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "weekly_challenge_progress_userId_idx" ON "weekly_challenge_progress"("userId");

-- CreateIndex
CREATE INDEX "weekly_challenge_progress_challengeId_idx" ON "weekly_challenge_progress"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_challenge_progress_userId_challengeId_key" ON "weekly_challenge_progress"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE INDEX "achievements_category_idx" ON "achievements"("category");

-- CreateIndex
CREATE INDEX "achievements_tier_idx" ON "achievements"("tier");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE INDEX "user_achievements_unlockedAt_idx" ON "user_achievements"("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "gamification_stats_userId_key" ON "gamification_stats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_coins_symbol_network_key" ON "crypto_coins"("symbol", "network");

-- CreateIndex
CREATE UNIQUE INDEX "crypto_payments_btcpayInvoiceId_key" ON "crypto_payments"("btcpayInvoiceId");

-- CreateIndex
CREATE INDEX "crypto_payments_agentId_idx" ON "crypto_payments"("agentId");

-- CreateIndex
CREATE INDEX "crypto_payments_status_idx" ON "crypto_payments"("status");

-- CreateIndex
CREATE INDEX "crypto_payment_logs_paymentId_idx" ON "crypto_payment_logs"("paymentId");

-- CreateIndex
CREATE INDEX "sms_logs_userId_idx" ON "sms_logs"("userId");

-- CreateIndex
CREATE INDEX "sms_logs_phoneNumber_idx" ON "sms_logs"("phoneNumber");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "marketplace_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_logs" ADD CONSTRAINT "blockchain_logs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_purchases_from_admin" ADD CONSTRAINT "coin_purchases_from_admin_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_sales_to_users" ADD CONSTRAINT "coin_sales_to_users_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_sales_to_users" ADD CONSTRAINT "coin_sales_to_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_boosts" ADD CONSTRAINT "leaderboard_boosts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_boosts" ADD CONSTRAINT "leaderboard_boosts_leaderboard_id_fkey" FOREIGN KEY ("leaderboard_id") REFERENCES "leaderboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_mediator_id_fkey" FOREIGN KEY ("mediator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_evidence" ADD CONSTRAINT "dispute_evidence_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_evidence" ADD CONSTRAINT "dispute_evidence_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_missions" ADD CONSTRAINT "daily_missions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_streaks" ADD CONSTRAINT "daily_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_progress" ADD CONSTRAINT "daily_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_challenge_progress" ADD CONSTRAINT "weekly_challenge_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_challenge_progress" ADD CONSTRAINT "weekly_challenge_progress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "weekly_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gamification_stats" ADD CONSTRAINT "gamification_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_payments" ADD CONSTRAINT "crypto_payments_cryptoCoinId_fkey" FOREIGN KEY ("cryptoCoinId") REFERENCES "crypto_coins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crypto_payment_logs" ADD CONSTRAINT "crypto_payment_logs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "crypto_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "device_info" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_circles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creator_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "member_count" INTEGER NOT NULL DEFAULT 1,
    "max_members" INTEGER,
    "rules" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "circle_id" TEXT,
    "content" TEXT NOT NULL,
    "media_urls" TEXT[],
    "post_type" TEXT NOT NULL DEFAULT 'text',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "shares_count" INTEGER NOT NULL DEFAULT 0,
    "boost_coins" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recommendation_type" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "is_viewed" BOOLEAN NOT NULL DEFAULT false,
    "is_applied" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_accounts" (
    "id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "business_type" TEXT NOT NULL,
    "registration_number" TEXT,
    "tax_id" TEXT,
    "address" JSONB,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_documents" TEXT[],
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "total_transactions" INTEGER NOT NULL DEFAULT 0,
    "total_volume" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.02,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_accounts" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "company_type" TEXT NOT NULL,
    "registration_number" TEXT,
    "tax_id" TEXT,
    "address" JSONB,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "employee_count" INTEGER,
    "industry" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_documents" TEXT[],
    "total_donations" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "active_campaigns" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_gateways" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "api_endpoint" TEXT NOT NULL,
    "api_key" TEXT,
    "webhook_secret" TEXT,
    "supported_currencies" TEXT[],
    "min_amount" DECIMAL(12,2),
    "max_amount" DECIMAL(12,2),
    "fee_percentage" DECIMAL(5,4),
    "fee_fixed" DECIMAL(8,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_health_check" TIMESTAMP(3),
    "health_status" TEXT DEFAULT 'unknown',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crypto_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_listings" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "starting_price" INTEGER NOT NULL,
    "current_price" INTEGER NOT NULL,
    "buy_now_price" INTEGER,
    "min_increment" INTEGER NOT NULL DEFAULT 10,
    "auction_type" TEXT NOT NULL DEFAULT 'english',
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "winner_id" TEXT,
    "final_price" INTEGER,
    "images" TEXT[],
    "condition" TEXT,
    "location" TEXT,
    "shipping_info" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_pass_seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "total_tiers" INTEGER NOT NULL,
    "base_xp_requirement" INTEGER NOT NULL,
    "xp_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "premium_multiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_pass_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_challenges" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target_value" INTEGER NOT NULL,
    "reward_coins" INTEGER NOT NULL,
    "reward_type" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "completion_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasonal_challenges_pkey" PRIMARY KEY ("id")
);

-- Add indexes for premium features
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events"("event_type");
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events"("user_id");
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");

CREATE INDEX "social_circles_creator_id_idx" ON "social_circles"("creator_id");
CREATE INDEX "social_circles_category_idx" ON "social_circles"("category");
CREATE INDEX "social_circles_is_private_idx" ON "social_circles"("is_private");

CREATE INDEX "social_posts_author_id_idx" ON "social_posts"("author_id");
CREATE INDEX "social_posts_circle_id_idx" ON "social_posts"("circle_id");
CREATE INDEX "social_posts_created_at_idx" ON "social_posts"("created_at");

CREATE INDEX "ai_recommendations_user_id_idx" ON "ai_recommendations"("user_id");
CREATE INDEX "ai_recommendations_recommendation_type_idx" ON "ai_recommendations"("recommendation_type");

CREATE INDEX "merchant_accounts_owner_id_idx" ON "merchant_accounts"("owner_id");
CREATE INDEX "merchant_accounts_business_type_idx" ON "merchant_accounts"("business_type");
CREATE INDEX "merchant_accounts_is_verified_idx" ON "merchant_accounts"("is_verified");

CREATE INDEX "corporate_accounts_admin_id_idx" ON "corporate_accounts"("admin_id");
CREATE INDEX "corporate_accounts_company_type_idx" ON "corporate_accounts"("company_type");
CREATE INDEX "corporate_accounts_is_verified_idx" ON "corporate_accounts"("is_verified");

CREATE INDEX "crypto_gateways_provider_idx" ON "crypto_gateways"("provider");
CREATE INDEX "crypto_gateways_is_active_idx" ON "crypto_gateways"("is_active");

CREATE INDEX "auction_listings_seller_id_idx" ON "auction_listings"("seller_id");
CREATE INDEX "auction_listings_category_idx" ON "auction_listings"("category");
CREATE INDEX "auction_listings_status_idx" ON "auction_listings"("status");
CREATE INDEX "auction_listings_end_time_idx" ON "auction_listings"("end_time");

CREATE INDEX "battle_pass_seasons_is_active_idx" ON "battle_pass_seasons"("is_active");
CREATE INDEX "battle_pass_seasons_start_date_end_date_idx" ON "battle_pass_seasons"("start_date", "end_date");

CREATE INDEX "seasonal_challenges_season_id_idx" ON "seasonal_challenges"("season_id");
CREATE INDEX "seasonal_challenges_is_active_idx" ON "seasonal_challenges"("is_active");
CREATE INDEX "seasonal_challenges_start_date_end_date_idx" ON "seasonal_challenges"("start_date", "end_date");

-- Add foreign keys for premium features
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "social_circles" ADD CONSTRAINT "social_circles_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_circle_id_fkey" FOREIGN KEY ("circle_id") REFERENCES "social_circles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "merchant_accounts" ADD CONSTRAINT "merchant_accounts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "corporate_accounts" ADD CONSTRAINT "corporate_accounts_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "auction_listings" ADD CONSTRAINT "auction_listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "auction_listings" ADD CONSTRAINT "auction_listings_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "seasonal_challenges" ADD CONSTRAINT "seasonal_challenges_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "battle_pass_seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
