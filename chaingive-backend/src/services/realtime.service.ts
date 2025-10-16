import websocketService, { WSEventType } from './websocket.service';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

// Real-time service for broadcasting events to connected clients
class RealTimeService {

  // Donation Cycle Events
  async notifyDonationMatched(donorId: string, recipientId: string, matchData: any): Promise<void> {
    try {
      // Notify donor
      websocketService.sendToUser(donorId, WSEventType.DONATION_MATCHED, {
        matchId: matchData.id,
        recipientId,
        amount: matchData.amount,
        deadline: matchData.deadline,
        message: 'You have been matched with a recipient. Please complete your donation within 24 hours.'
      });

      // Notify recipient
      websocketService.sendToUser(recipientId, WSEventType.DONATION_MATCHED, {
        matchId: matchData.id,
        donorId,
        amount: matchData.amount,
        message: 'A donor has been matched to you. They will complete the payment soon.'
      });

      logger.info(`Donation match notification sent: ${donorId} -> ${recipientId}`);
    } catch (error) {
      logger.error('Error sending donation match notification:', error);
    }
  }

  async notifyDonationReceived(recipientId: string, donationData: any): Promise<void> {
    try {
      websocketService.sendToUser(recipientId, WSEventType.DONATION_RECEIVED, {
        donationId: donationData.id,
        amount: donationData.amount,
        donorId: donationData.donorId,
        escrowId: donationData.escrowId,
        message: 'You have received a donation! Funds will be available after the 48-hour escrow period.'
      });

      logger.info(`Donation received notification sent to: ${recipientId}`);
    } catch (error) {
      logger.error('Error sending donation received notification:', error);
    }
  }

  async notifyDonationConfirmed(donorId: string, recipientId: string, donationData: any): Promise<void> {
    try {
      // Notify donor
      websocketService.sendToUser(donorId, WSEventType.DONATION_CONFIRMED, {
        donationId: donationData.id,
        recipientId,
        amount: donationData.amount,
        message: 'Your donation has been confirmed by the recipient.'
      });

      // Notify recipient
      websocketService.sendToUser(recipientId, WSEventType.DONATION_CONFIRMED, {
        donationId: donationData.id,
        donorId,
        amount: donationData.amount,
        message: 'Donation confirmed. Funds are now in escrow for 48 hours.'
      });

      logger.info(`Donation confirmation notification sent: ${donorId} -> ${recipientId}`);
    } catch (error) {
      logger.error('Error sending donation confirmation notification:', error);
    }
  }

  async notifyDonationReleased(recipientId: string, donationData: any): Promise<void> {
    try {
      websocketService.sendToUser(recipientId, WSEventType.DONATION_RELEASED, {
        donationId: donationData.id,
        amount: donationData.amount,
        availableBalance: donationData.newBalance,
        message: 'Your donation has been released from escrow and is now available in your wallet!'
      });

      logger.info(`Donation release notification sent to: ${recipientId}`);
    } catch (error) {
      logger.error('Error sending donation release notification:', error);
    }
  }

  async notifyDonationDefaulted(donorId: string, recipientId: string, matchData: any): Promise<void> {
    try {
      // Notify donor of default
      websocketService.sendToUser(donorId, WSEventType.DONATION_DEFAULTED, {
        matchId: matchData.id,
        recipientId,
        amount: matchData.amount,
        penalty: '24 hour account ban',
        message: 'You failed to complete your donation within 24 hours. Your account has been temporarily banned.'
      });

      // Notify recipient of rematch
      websocketService.sendToUser(recipientId, WSEventType.DONATION_DEFAULTED, {
        matchId: matchData.id,
        donorId,
        amount: matchData.amount,
        status: 'rematched',
        message: 'Your donor failed to pay within 24 hours. You have been matched with a new donor.'
      });

      logger.info(`Donation default notification sent: ${donorId} -> ${recipientId}`);
    } catch (error) {
      logger.error('Error sending donation default notification:', error);
    }
  }

  // Leaderboard Events
  async notifyLeaderboardUpdated(updatedUsers: string[]): Promise<void> {
    try {
      // Get current leaderboard data
      const leaderboard = await this.getCurrentLeaderboard();

      // Notify all connected users about leaderboard changes
      websocketService.broadcast(WSEventType.LEADERBOARD_UPDATED, {
        leaderboard: leaderboard.slice(0, 50), // Top 50 users
        updatedUsers,
        timestamp: new Date().toISOString()
      });

      // Notify specific users about their rank changes
      for (const userId of updatedUsers) {
        const userEntry = leaderboard.find(entry => entry.userId === userId);
        if (userEntry) {
          websocketService.sendToUser(userId, WSEventType.USER_RANK_CHANGED, {
            newRank: userEntry.rank,
            previousRank: userEntry.previousRank,
            score: userEntry.score,
            trend: userEntry.trend
          });
        }
      }

      logger.info(`Leaderboard update notification sent to ${updatedUsers.length} users`);
    } catch (error) {
      logger.error('Error sending leaderboard update notification:', error);
    }
  }

  // Coin System Events
  async notifyCoinBalanceUpdate(userId: string, balanceData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.COIN_BALANCE_UPDATE, {
        newBalance: balanceData.newBalance,
        previousBalance: balanceData.previousBalance,
        change: balanceData.change,
        reason: balanceData.reason,
        timestamp: new Date().toISOString()
      });

      logger.info(`Coin balance update notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending coin balance update notification:', error);
    }
  }

  async notifyCoinPurchaseSuccess(userId: string, purchaseData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.COIN_PURCHASE_SUCCESS, {
        purchaseId: purchaseData.id,
        coinsPurchased: purchaseData.coinsPurchased,
        amountPaid: purchaseData.amountPaid,
        currency: purchaseData.currency,
        newBalance: purchaseData.newBalance,
        message: `Successfully purchased ${purchaseData.coinsPurchased} coins!`
      });

      logger.info(`Coin purchase success notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending coin purchase success notification:', error);
    }
  }

  async notifyCoinRedemptionSuccess(userId: string, redemptionData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.COIN_REDEMPTION_SUCCESS, {
        redemptionId: redemptionData.id,
        coinsSpent: redemptionData.coinsSpent,
        item: redemptionData.item,
        value: redemptionData.value,
        newBalance: redemptionData.newBalance,
        message: `Successfully redeemed ${redemptionData.coinsSpent} coins for ${redemptionData.item}!`
      });

      logger.info(`Coin redemption success notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending coin redemption success notification:', error);
    }
  }

  // Gamification Events
  async notifyLevelUp(userId: string, levelData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.LEVEL_UP, {
        newLevel: levelData.newLevel,
        previousLevel: levelData.previousLevel,
        xpGained: levelData.xpGained,
        totalXp: levelData.totalXp,
        rewards: levelData.rewards,
        message: `Congratulations! You reached level ${levelData.newLevel}!`
      });

      logger.info(`Level up notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending level up notification:', error);
    }
  }

  async notifyXpAwarded(userId: string, xpData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.XP_AWARDED, {
        amount: xpData.amount,
        reason: xpData.reason,
        totalXp: xpData.totalXp,
        levelProgress: xpData.levelProgress,
        message: `You earned ${xpData.amount} XP for ${xpData.reason}!`
      });

      logger.info(`XP awarded notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending XP awarded notification:', error);
    }
  }

  async notifyBadgeUnlocked(userId: string, badgeData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.BADGE_UNLOCKED, {
        badgeId: badgeData.id,
        badgeName: badgeData.name,
        badgeDescription: badgeData.description,
        rarity: badgeData.rarity,
        icon: badgeData.icon,
        message: `New badge unlocked: ${badgeData.name}!`
      });

      logger.info(`Badge unlocked notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending badge unlocked notification:', error);
    }
  }

  async notifyMissionCompleted(userId: string, missionData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.MISSION_COMPLETED, {
        missionId: missionData.id,
        missionName: missionData.name,
        rewards: missionData.rewards,
        completedAt: missionData.completedAt,
        message: `Mission completed: ${missionData.name}!`
      });

      logger.info(`Mission completed notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending mission completed notification:', error);
    }
  }

  async notifyChallengeCompleted(userId: string, challengeData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.CHALLENGE_COMPLETED, {
        challengeId: challengeData.id,
        challengeName: challengeData.name,
        rewards: challengeData.rewards,
        completedAt: challengeData.completedAt,
        message: `Challenge completed: ${challengeData.name}!`
      });

      logger.info(`Challenge completed notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending challenge completed notification:', error);
    }
  }

  async notifyBattlePassProgress(userId: string, progressData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.BATTLE_PASS_PROGRESS, {
        currentLevel: progressData.currentLevel,
        progressPercent: progressData.progressPercent,
        nextReward: progressData.nextReward,
        message: `Battle Pass progress: ${progressData.progressPercent}% to next reward!`
      });

      logger.info(`Battle Pass progress notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending Battle Pass progress notification:', error);
    }
  }

  // System Events
  async notifySystemMaintenance(message: string, estimatedDowntime?: string): Promise<void> {
    try {
      websocketService.broadcast(WSEventType.SYSTEM_MAINTENANCE, {
        message,
        estimatedDowntime,
        timestamp: new Date().toISOString()
      });

      logger.info('System maintenance notification broadcasted');
    } catch (error) {
      logger.error('Error sending system maintenance notification:', error);
    }
  }

  async notifySystemAlert(alertType: string, message: string, details?: any): Promise<void> {
    try {
      websocketService.broadcast(WSEventType.SYSTEM_ALERT, {
        alertType,
        message,
        details,
        timestamp: new Date().toISOString()
      });

      logger.info(`System alert notification broadcasted: ${alertType}`);
    } catch (error) {
      logger.error('Error sending system alert notification:', error);
    }
  }

  // Notification Events
  async notifyUserNotification(userId: string, notificationData: any): Promise<void> {
    try {
      websocketService.sendToUser(userId, WSEventType.NOTIFICATION_RECEIVED, {
        notificationId: notificationData.id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        timestamp: new Date().toISOString()
      });

      logger.info(`User notification sent to: ${userId}`);
    } catch (error) {
      logger.error('Error sending user notification:', error);
    }
  }

  // Helper method to get current leaderboard
  private async getCurrentLeaderboard(): Promise<any[]> {
    try {
      // This would integrate with your leaderboard service
      // For now, return a placeholder
      return [];
    } catch (error) {
      logger.error('Error getting current leaderboard:', error);
      return [];
    }
  }
}

// Create singleton instance
export const realtimeService = new RealTimeService();

export default realtimeService;