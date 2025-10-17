import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@chaingive.com',
        phoneNumber: '+2348012345678',
        passwordHash: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
        tier: 3,
        trustScore: 5.0,
        totalCyclesCompleted: 50,
        totalDonated: 150000,
        totalReceived: 0,
        kycStatus: 'approved',
        isActive: true,
        locationCity: 'Lagos',
        locationState: 'Lagos',
        charityCoinsBalance: 1000,
        lastLoginAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        phoneNumber: '+2348023456789',
        passwordHash: await bcrypt.hash('user123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'Donor',
        tier: 2,
        trustScore: 4.5,
        totalCyclesCompleted: 12,
        totalDonated: 25000,
        totalReceived: 18000,
        kycStatus: 'approved',
        isActive: true,
        charityCoinsBalance: 150,
        locationCity: 'Abuja',
        locationState: 'FCT',
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'mary.jane@example.com',
        phoneNumber: '+2348056789012',
        passwordHash: await bcrypt.hash('donor123', 10),
        firstName: 'Mary',
        lastName: 'Jane',
        role: 'Donor',
        tier: 1,
        trustScore: 4.2,
        totalCyclesCompleted: 5,
        totalDonated: 10000,
        totalReceived: 8000,
        kycStatus: 'pending',
        isActive: true,
        charityCoinsBalance: 75,
        locationCity: 'Ibadan',
        locationState: 'Oyo',
        lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    prisma.user.create({
      data: {
        phoneNumber: '+2348034567890',
        email: 'agent@chaingive.com',
        passwordHash: await bcrypt.hash('agent123', 10),
        firstName: 'Sarah',
        lastName: 'Williams',
        role: 'Agent',
        tier: 2,
        trustScore: 4.8,
        totalCyclesCompleted: 30,
        totalDonated: 45000,
        totalReceived: 35000,
        kycStatus: 'approved',
        isActive: true,
        charityCoinsBalance: 500,
        locationCity: 'Port Harcourt',
        locationState: 'Rivers',
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Profiles
  await prisma.profile.create({
    data: {
      userId: users[0].id,
      firstName: 'Admin',
      lastName: 'User',
      bio: 'Platform administrator',
    },
  });

  // Donation Categories
  const categories = await Promise.all([
    prisma.donationCategory.create({ data: { name: 'Education' } }),
    prisma.donationCategory.create({ data: { name: 'Healthcare' } }),
    prisma.donationCategory.create({ data: { name: 'Food Security' } }),
  ]);

  // Donation Cycles
  const cycle = await prisma.donationCycle.create({
    data: {
      name: 'January 2025',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    },
  });

  // Donations
  await Promise.all([
    prisma.donation.create({
      data: {
        userId: users[1].id,
        amount: 5000,
        categoryId: categories[0].id,
        cycleId: cycle.id,
      },
    }),
    prisma.donation.create({
      data: {
        userId: users[2].id,
        amount: 3000,
        categoryId: categories[1].id,
        cycleId: cycle.id,
      },
    }),
    prisma.donation.create({
      data: {
        userId: users[3].id,
        amount: 7500,
        categoryId: categories[2].id,
        cycleId: cycle.id,
      },
    }),
  ]);

  // Wallets
  await Promise.all(
    users.map((user) =>
      prisma.userWallet.create({
        data: { userId: user.id, balance: user.charityCoinsBalance },
      })
    )
  );

  // Transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        fromId: users[1].id,
        toId: users[2].id,
        amount: 2000,
        status: 'completed',
      },
    }),
    prisma.transaction.create({
      data: {
        fromId: users[3].id,
        toId: users[1].id,
        amount: 1500,
        status: 'completed',
      },
    }),
    prisma.transaction.create({
      data: {
        fromId: users[0].id,
        toId: users[2].id,
        amount: 5000,
        status: 'completed',
      },
    }),
  ]);

  // Agent
  const agent = await prisma.agent.create({
    data: {
      userId: users[3].id,
      location: 'Port Harcourt Market',
      phoneNumber: users[3].phoneNumber!,
      isActive: true,
    },
  });

  // KYC Records
  await Promise.all([
    prisma.kYCRecord.create({
      data: {
        userId: users[1].id,
        verificationType: 'bvn',
        status: 'approved',
        verifiedByUserId: users[0].id,
        verifiedAt: new Date(),
      },
    }),
    prisma.kYCRecord.create({
      data: {
        userId: users[2].id,
        verificationType: 'nin',
        status: 'pending',
      },
    }),
    prisma.kYCRecord.create({
      data: {
        userId: users[3].id,
        verificationType: 'bvn',
        status: 'approved',
        verifiedByUserId: users[0].id,
        verifiedAt: new Date(),
      },
    }),
  ]);

  // Merchant
  const merchant = await prisma.merchant.create({
    data: {
      userId: users[3].id,
      businessName: 'Sarah\'s Store',
      businessType: 'retail',
      description: 'Local retail store',
      contactInfo: { email: 'agent@chaingive.com', phone: '+2348034567890' },
      isVerified: true,
      status: 'active',
    },
  });

  // Merchant Payment Request
  const paymentRequest = await prisma.merchantPaymentRequest.create({
    data: {
      merchantId: merchant.id,
      userId: users[1].id,
      amount: 1500,
      currency: 'NGN',
      description: 'Purchase of goods',
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Merchant Payment
  await prisma.merchantPayment.create({
    data: {
      paymentRequestId: paymentRequest.id,
      userId: users[1].id,
      amount: 1500,
      status: 'completed',
      processedAt: new Date(),
    },
  });

  // Sponsor (Corporate)
  const sponsor = await prisma.user.create({
    data: {
      email: 'sponsor@chaingive.com',
      phoneNumber: '+2348045678901',
      passwordHash: await bcrypt.hash('sponsor123', 10),
      firstName: 'TechCorp',
      lastName: 'Nigeria',
      role: 'Sponsor',
      tier: 3,
      trustScore: 5.0,
      kycStatus: 'approved',
      isActive: true,
      locationCity: 'Lagos',
      locationState: 'Lagos',
      charityCoinsBalance: 5000,
    },
  });

  const corporate = await prisma.corporate.create({
    data: {
      userId: sponsor.id,
      companyName: 'TechCorp Nigeria',
      companySize: 'medium',
      industry: 'Technology',
      contactPerson: 'TechCorp Nigeria',
      contactInfo: { email: 'sponsor@chaingive.com', phone: '+2348045678901' },
      csrBudget: 5000000,
      isVerified: true,
      status: 'active',
    },
  });

  // Corporate Bulk Donation
  await prisma.corporateBulkDonation.create({
    data: {
      corporateId: corporate.id,
      totalAmount: 100000,
      totalRecipients: 50,
      donations: [{ amount: 2000, recipient: 'Community A' }],
      status: 'completed',
      processedAt: new Date(),
    },
  });

  // Social Circle
  const circle = await prisma.socialCircle.create({
    data: {
      name: 'Lagos Givers',
      description: 'Community of givers in Lagos',
      creatorId: users[0].id,
      isPrivate: false,
      memberCount: 2,
    },
  });

  // Social Circle Members
  await Promise.all([
    prisma.socialCircleMember.create({
      data: { circleId: circle.id, userId: users[0].id, role: 'admin' },
    }),
    prisma.socialCircleMember.create({
      data: { circleId: circle.id, userId: users[1].id, role: 'member' },
    }),
  ]);

  // Social Post
  const post = await prisma.socialPost.create({
    data: {
      circleId: circle.id,
      authorId: users[0].id,
      content: 'Welcome to Lagos Givers! Let\'s make a difference together.',
      postType: 'text',
      likesCount: 1,
    },
  });

  // Social Comment
  await prisma.socialComment.create({
    data: {
      postId: post.id,
      authorId: users[1].id,
      content: 'Excited to be part of this community!',
    },
  });

  // Social Like
  await prisma.socialLike.create({
    data: { postId: post.id, userId: users[1].id },
  });

  // AI Recommendation
  await prisma.aIRecommendation.create({
    data: {
      userId: users[1].id,
      type: 'donation_timing',
      title: 'Best time to donate',
      description: 'Based on your pattern, donating on weekends yields better matches',
      confidence: 0.85,
      data: { suggestedDay: 'Saturday', suggestedTime: '10:00' },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Analytics Event
  await prisma.analyticsEvent.create({
    data: {
      eventType: 'user_login',
      userId: users[1].id,
      eventData: { platform: 'mobile', version: '1.0.0' },
      deviceInfo: { os: 'Android', model: 'Samsung Galaxy' },
      ipAddress: '192.168.1.1',
    },
  });

  // Challenges
  const challenge = await prisma.challenge.create({
    data: {
      name: 'First Donation',
      description: 'Complete your first donation',
      points: 100,
    },
  });

  // User Challenge
  await prisma.userChallenge.create({
    data: {
      userId: users[1].id,
      challengeId: challenge.id,
      completed: true,
      completedAt: new Date(),
    },
  });

  // Rewards
  const reward = await prisma.reward.create({
    data: {
      name: 'Bronze Badge',
      description: 'Complete 5 donations',
      points: 50,
    },
  });

  // User Reward
  await prisma.userReward.create({
    data: {
      userId: users[1].id,
      rewardId: reward.id,
      claimed: true,
      claimedAt: new Date(),
    },
  });

  // Leaderboard
  await Promise.all(
    users.map((user, idx) =>
      prisma.leaderboard.create({
        data: {
          userId: user.id,
          points: (3 - idx) * 100,
          rank: idx + 1,
        },
      })
    )
  );

  // Subscriptions
  const subscription = await prisma.subscription.create({
    data: {
      name: 'Premium',
      price: 5000,
      features: ['AI Recommendations', 'Priority Support', 'Analytics'],
    },
  });

  // User Subscription
  await prisma.userSubscription.create({
    data: {
      userId: users[0].id,
      subscriptionId: subscription.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
    },
  });

  // Feature Flags
  await Promise.all([
    prisma.featureFlag.create({
      data: { name: 'ai_recommendations', isEnabled: true, description: 'AI-powered recommendations' },
    }),
    prisma.featureFlag.create({
      data: { name: 'social_features', isEnabled: true, description: 'Social circles and posts' },
    }),
  ]);

  // Notifications
  await prisma.notification.create({
    data: {
      userId: users[1].id,
      message: 'Your donation was successful!',
      read: false,
    },
  });

  // Coin Purchase
  await prisma.coinPurchase.create({
    data: {
      userId: users[1].id,
      agentId: agent.id,
      amount: 50,
      status: 'completed',
    },
  });

  // Referral
  await prisma.referral.create({
    data: {
      referrerId: users[0].id,
      referredUserId: users[1].id,
    },
  });

  // Cycles
  await Promise.all([
    prisma.cycle.create({
      data: {
        userId: users[1].id,
        status: 'fulfilled',
      },
    }),
    prisma.cycle.create({
      data: {
        userId: users[2].id,
        status: 'active',
      },
    }),
    prisma.cycle.create({
      data: {
        userId: users[3].id,
        status: 'fulfilled',
      },
    }),
  ]);

  // Admin Actions
  await Promise.all([
    prisma.adminAction.create({
      data: {
        adminId: users[0].id,
        action: 'approve_kyc',
        targetId: users[1].id,
        details: 'KYC approved for John Doe',
      },
    }),
    prisma.adminAction.create({
      data: {
        adminId: users[0].id,
        action: 'approve_kyc',
        targetId: users[3].id,
        details: 'KYC approved for Sarah Williams',
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`   - 5 users (1 Admin, 2 Donors, 1 Sponsor, 1 Agent)`);
  console.log(`   - 1 merchant with payment requests`);
  console.log(`   - 1 sponsor with bulk donation`);
  console.log(`   - 1 social circle with posts`);
  console.log(`   - AI recommendations & analytics`);
  console.log(`   - Challenges, rewards & leaderboard`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
