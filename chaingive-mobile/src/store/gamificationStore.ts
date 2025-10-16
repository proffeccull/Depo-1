import { create } from 'zustand';

interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

interface GamificationState {
  level: number;
  xp: number;
  xpToNext: number;
  achievements: Achievement[];
  streakDays: number;
  totalDonations: number;
  setLevel: (level: number) => void;
  addXP: (xp: number) => void;
  unlockAchievement: (achievementId: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  level: 1,
  xp: 0,
  xpToNext: 100,
  achievements: [],
  streakDays: 0,
  totalDonations: 0,
  
  setLevel: (level) => set({ level }),
  
  addXP: (xp) => {
    const current = get();
    const newXP = current.xp + xp;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    set({
      xp: newXP,
      level: newLevel,
      xpToNext: (newLevel * 100) - newXP,
    });
  },
  
  unlockAchievement: (achievementId) => {
    set((state) => ({
      achievements: state.achievements.map(a =>
        a.id === achievementId
          ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() }
          : a
      ),
    }));
  },
  
  incrementStreak: () => set((state) => ({ streakDays: state.streakDays + 1 })),
  resetStreak: () => set({ streakDays: 0 }),
}));