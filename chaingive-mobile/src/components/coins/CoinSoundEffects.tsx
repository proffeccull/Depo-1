import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class CoinSoundEffects {
  private static instance: CoinSoundEffects;
  private sounds: Map<string, Audio.Sound> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): CoinSoundEffects {
    if (!CoinSoundEffects.instance) {
      CoinSoundEffects.instance = new CoinSoundEffects();
    }
    return CoinSoundEffects.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Preload common coin sounds
      await this.preloadSounds();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize coin sound effects:', error);
    }
  }

  private async preloadSounds() {
    const soundFiles = {
      coin_collect: require('../../../assets/sounds/coin_collect.mp3'),
      coin_drop: require('../../../assets/sounds/coin_drop.mp3'),
      coin_rain: require('../../../assets/sounds/coin_rain.mp3'),
      achievement_unlock: require('../../../assets/sounds/achievement_unlock.mp3'),
      milestone_reach: require('../../../assets/sounds/milestone_reach.mp3'),
      level_up: require('../../../assets/sounds/level_up.mp3'),
      button_press: require('../../../assets/sounds/button_press.mp3'),
      coin_purchase: require('../../../assets/sounds/coin_purchase.mp3'),
      streak_bonus: require('../../../assets/sounds/streak_bonus.mp3'),
      nft_mint: require('../../../assets/sounds/nft_mint.mp3'),
    };

    for (const [key, file] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(file);
        this.sounds.set(key, sound);
      } catch (error) {
        console.warn(`Failed to load sound ${key}:`, error);
      }
    }
  }

  async play(soundName: string, options: {
    volume?: number;
    rate?: number;
    haptic?: boolean;
    hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'error';
  } = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      volume = 0.7,
      rate = 1.0,
      haptic = true,
      hapticType = 'light'
    } = options;

    try {
      const sound = this.sounds.get(soundName);
      if (sound) {
        await sound.setVolumeAsync(volume);
        await sound.setRateAsync(rate, false);
        await sound.replayAsync();

        // Play haptic feedback
        if (haptic) {
          this.playHaptic(hapticType);
        }
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  private playHaptic(type: string) {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }

  // Specific coin sound methods
  async playCoinCollect(volume = 0.8) {
    await this.play('coin_collect', { volume, hapticType: 'light' });
  }

  async playCoinDrop(volume = 0.6) {
    await this.play('coin_drop', { volume, hapticType: 'medium' });
  }

  async playCoinRain(volume = 0.9) {
    await this.play('coin_rain', { volume, hapticType: 'success' });
  }

  async playAchievementUnlock(volume = 1.0) {
    await this.play('achievement_unlock', { volume, hapticType: 'success' });
  }

  async playMilestoneReach(volume = 0.9) {
    await this.play('milestone_reach', { volume, hapticType: 'heavy' });
  }

  async playLevelUp(volume = 1.0) {
    await this.play('level_up', { volume, hapticType: 'success' });
  }

  async playButtonPress(volume = 0.5) {
    await this.play('button_press', { volume, hapticType: 'light' });
  }

  async playCoinPurchase(volume = 0.8) {
    await this.play('coin_purchase', { volume, hapticType: 'medium' });
  }

  async playStreakBonus(volume = 0.9) {
    await this.play('streak_bonus', { volume, hapticType: 'success' });
  }

  async playNFTMint(volume = 1.0) {
    await this.play('nft_mint', { volume, hapticType: 'heavy' });
  }

  // Utility methods
  async playCoinSequence(amount: number) {
    // Play multiple coin sounds in sequence for large earnings
    const delay = 100;
    for (let i = 0; i < Math.min(amount, 10); i++) {
      setTimeout(() => {
        this.playCoinCollect(0.6);
      }, i * delay);
    }
  }

  async playCelebration() {
    // Play a celebration sequence
    await this.playCoinRain();
    setTimeout(() => this.playAchievementUnlock(), 300);
    setTimeout(() => this.playMilestoneReach(), 600);
  }

  async dispose() {
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Failed to unload sound:', error);
      }
    }
    this.sounds.clear();
    this.isInitialized = false;
  }
}

export default CoinSoundEffects;
export const coinSounds = CoinSoundEffects.getInstance();