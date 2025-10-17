import { Request, Response } from 'express';

export async function generateShareImage(req: Request, res: Response) {
  const { type, data } = req.body; // type: 'badge' | 'leaderboard' | 'thermometer'
  
  const shareUrl = `${process.env.BASE_URL}/share/${type}/${data.id}`;
  const imageUrl = `${process.env.BASE_URL}/api/og-image/${type}/${data.id}`;
  
  res.json({
    shareUrl,
    imageUrl,
    text: generateShareText(type, data),
  });
}

function generateShareText(type: string, data: any): string {
  switch (type) {
    case 'badge':
      return `🎉 I just unlocked the ${data.name} badge on ChainGive! Join me in making a difference.`;
    case 'leaderboard':
      return `🏆 I'm ranked #${data.rank} on ChainGive's leaderboard! Together we've donated $${data.total}.`;
    case 'thermometer':
      return `🌡️ We're ${data.percentage}% to our goal! Help us reach $${data.goal} for ${data.title}.`;
    default:
      return 'Join me on ChainGive!';
  }
}
