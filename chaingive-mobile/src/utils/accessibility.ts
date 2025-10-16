import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility utilities for ChainGive mobile app

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private screenReaderEnabled = false;
  private highContrastEnabled = false;
  private largerTextEnabled = false;

  private constructor() {
    this.initializeAccessibility();
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  private async initializeAccessibility() {
    // Check if screen reader is enabled
    const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
    this.screenReaderEnabled = screenReaderEnabled;

    // Listen for screen reader changes
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      this.screenReaderEnabled = enabled;
      this.handleAccessibilityChange();
    });

    // Initialize other accessibility settings
    this.checkHighContrast();
    this.checkLargerText();
  }

  private checkHighContrast() {
    // Platform-specific high contrast detection
    if (Platform.OS === 'ios') {
      // iOS high contrast detection
      this.highContrastEnabled = false; // Implement iOS-specific check
    } else if (Platform.OS === 'android') {
      // Android high contrast detection
      this.highContrastEnabled = false; // Implement Android-specific check
    }
  }

  private checkLargerText() {
    // Check for larger text settings
    // This would typically involve checking system font scale
    this.largerTextEnabled = false; // Implement system font scale check
  }

  private handleAccessibilityChange() {
    // Handle accessibility changes globally
    console.log('Accessibility settings changed:', {
      screenReader: this.screenReaderEnabled,
      highContrast: this.highContrastEnabled,
      largerText: this.largerTextEnabled,
    });
  }

  // Public methods
  isScreenReaderEnabled(): boolean {
    return this.screenReaderEnabled;
  }

  isHighContrastEnabled(): boolean {
    return this.highContrastEnabled;
  }

  isLargerTextEnabled(): boolean {
    return this.largerTextEnabled;
  }

  // Announce content to screen readers
  announceForAccessibility(message: string) {
    if (this.screenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  // Set accessibility focus
  setAccessibilityFocus(ref: any) {
    if (this.screenReaderEnabled && ref?.current) {
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  }
}

// Accessibility helper functions
export const accessibilityHelpers = {
  // Generate accessibility labels
  generateAccessibilityLabel(component: string, action?: string, state?: string): string {
    const parts = [component];
    if (action) parts.push(action);
    if (state) parts.push(state);
    return parts.join(', ');
  },

  // Get accessibility role
  getAccessibilityRole(type: 'button' | 'header' | 'image' | 'text' | 'list' | 'listitem'): string {
    return type;
  },

  // Get accessibility hint
  getAccessibilityHint(action: string, result?: string): string {
    if (result) {
      return `${action} to ${result}`;
    }
    return action;
  },

  // Color blind friendly color palette
  colorBlindPalette: {
    primary: '#1F77B4',    // Blue
    secondary: '#FF7F0E',  // Orange
    success: '#2CA02C',    // Green
    error: '#D62728',      // Red
    warning: '#9467BD',    // Purple
    info: '#8C564B',       // Brown
    gray: '#7F7F7F',       // Gray
  },

  // High contrast color palette
  highContrastPalette: {
    primary: '#FFFFFF',    // White
    secondary: '#000000',  // Black
    success: '#00FF00',    // Bright Green
    error: '#FF0000',      // Bright Red
    warning: '#FFFF00',    // Bright Yellow
    info: '#00FFFF',       // Bright Cyan
    background: '#000000', // Black
    surface: '#FFFFFF',    // White
  },
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Focus management
  focusNext(refs: any[], currentIndex: number) {
    const nextIndex = (currentIndex + 1) % refs.length;
    if (refs[nextIndex]?.current) {
      refs[nextIndex].current.focus();
    }
  },

  focusPrevious(refs: any[], currentIndex: number) {
    const prevIndex = currentIndex === 0 ? refs.length - 1 : currentIndex - 1;
    if (refs[prevIndex]?.current) {
      refs[prevIndex].current.focus();
    }
  },

  // Skip links for screen readers
  skipToContent(ref: any) {
    if (ref?.current) {
      ref.current.focus();
      AccessibilityManager.getInstance().announceForAccessibility('Skipped to main content');
    }
  },
};

// Audio cues system
export class AudioCuesManager {
  private static instance: AudioCuesManager;
  private audioEnabled = true;

  private constructor() {}

  static getInstance(): AudioCuesManager {
    if (!AudioCuesManager.instance) {
      AudioCuesManager.instance = new AudioCuesManager();
    }
    return AudioCuesManager.instance;
  }

  setAudioEnabled(enabled: boolean) {
    this.audioEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  // Play audio cues (implement actual audio playback)
  playSuccessCue() {
    if (this.audioEnabled) {
      // Play success sound
      console.log('Playing success audio cue');
    }
  }

  playErrorCue() {
    if (this.audioEnabled) {
      // Play error sound
      console.log('Playing error audio cue');
    }
  }

  playNavigationCue() {
    if (this.audioEnabled) {
      // Play navigation sound
      console.log('Playing navigation audio cue');
    }
  }

  playAchievementCue() {
    if (this.audioEnabled) {
      // Play achievement unlocked sound
      console.log('Playing achievement audio cue');
    }
  }
}

// Text scaling utilities
export const textScaling = {
  // Get scaled font size based on system settings
  getScaledFontSize(baseSize: number): number {
    // Implement system font scale detection
    const scale = 1; // Replace with actual system scale
    return baseSize * scale;
  },

  // Minimum and maximum font scales
  minScale: 0.8,
  maxScale: 2.0,

  // Check if text should be scaled
  shouldScaleText(): boolean {
    return AccessibilityManager.getInstance().isLargerTextEnabled();
  },
};

// Focus management hooks
export const focusManagement = {
  // Auto-focus management
  autoFocus: {
    onMount(ref: any) {
      if (ref?.current) {
        setTimeout(() => ref.current.focus(), 100);
      }
    },

    onUpdate(ref: any, condition: boolean) {
      if (condition && ref?.current) {
        ref.current.focus();
      }
    },
  },

  // Focus trapping for modals
  trapFocus: {
    focusableElements: [] as any[],

    setFocusableElements(containerRef: any) {
      if (containerRef?.current) {
        const elements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        this.focusableElements = Array.from(elements) as any[];
      }
    },

    handleKeyDown(event: any, containerRef: any) {
      if (event.key === 'Tab') {
        if (this.focusableElements.length === 0) {
          this.setFocusableElements(containerRef);
        }

        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];
        const currentIndex = this.focusableElements.indexOf(event.target);

        if (event.shiftKey) {
          if (currentIndex === 0) {
            event.preventDefault();
            (lastElement as any).focus();
          }
        } else {
          if (currentIndex === this.focusableElements.length - 1) {
            event.preventDefault();
            (firstElement as any).focus();
          }
        }
      }
    },
  },
};

// Export singleton instances
export const accessibilityManager = AccessibilityManager.getInstance();
export const audioCuesManager = AudioCuesManager.getInstance();