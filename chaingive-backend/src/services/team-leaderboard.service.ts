import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TeamLeaderboardService {
  async getTeamLeaderboard(period: string) {
    const dateFilter = this.getDateFilter(period);
    
    const teams = await prisma.socialCircle.findMany({
      include: {
        members: {
          include: {
            user: {
              include: {
                donations: { where: dateFilter },
              },
            },
          },
        },
      },
    });

    return teams.map(team => ({
      id: team.id,
      name: team.name,
      totalDonated: team.members.reduce((sum, m) => 
        sum + m.user.donations.reduce((s, d) => s + d.amount, 0), 0
      ),
      memberCount: team.members.length,
    })).sort((a, b) => b.totalDonated - a.totalDonated);
  }

  private getDateFilter(period: string) {
    const now = new Date();
    switch (period) {
      case 'week': return { createdAt: { gte: new Date(now.setDate(now.getDate() - 7)) } };
      case 'month': return { createdAt: { gte: new Date(now.setMonth(now.getMonth() - 1)) } };
      default: return {};
    }
  }
}

export default new TeamLeaderboardService();
