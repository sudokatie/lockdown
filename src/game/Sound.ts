// Web Audio API synthesized sound effects for Lockdown

type SoundName = 
  | 'doorOpen'
  | 'doorClose'
  | 'fightAlert'
  | 'lockdownSiren'
  | 'inmateAdmit'
  | 'staffHired'
  | 'zoneBuilt'
  | 'mealBell'
  | 'dayStart'
  | 'nightStart';

interface SoundConfig {
  enabled: boolean;
  volume: number;
}

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private config: SoundConfig = { enabled: true, volume: 0.3 };

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || 
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getVolume(): number {
    return this.config.volume;
  }

  play(sound: SoundName): void {
    if (!this.config.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    switch (sound) {
      case 'doorOpen':
        this.playDoorOpen(ctx);
        break;
      case 'doorClose':
        this.playDoorClose(ctx);
        break;
      case 'fightAlert':
        this.playFightAlert(ctx);
        break;
      case 'lockdownSiren':
        this.playLockdownSiren(ctx);
        break;
      case 'inmateAdmit':
        this.playInmateAdmit(ctx);
        break;
      case 'staffHired':
        this.playStaffHired(ctx);
        break;
      case 'zoneBuilt':
        this.playZoneBuilt(ctx);
        break;
      case 'mealBell':
        this.playMealBell(ctx);
        break;
      case 'dayStart':
        this.playDayStart(ctx);
        break;
      case 'nightStart':
        this.playNightStart(ctx);
        break;
    }
  }

  // Mechanical click for door open
  private playDoorOpen(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
    gain.gain.setValueAtTime(this.config.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Lower thud for door close
  private playDoorClose(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
    gain.gain.setValueAtTime(this.config.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Urgent alarm for fights
  private playFightAlert(ctx: AudioContext): void {
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(this.config.volume * 0.35, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.1);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.1);
    }
  }

  // Wailing siren for lockdown
  private playLockdownSiren(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.3);
    osc.frequency.linearRampToValueAtTime(400, now + 0.6);
    gain.gain.setValueAtTime(this.config.volume * 0.3, now);
    gain.gain.setValueAtTime(this.config.volume * 0.3, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Buzzer for new inmate
  private playInmateAdmit(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.value = 220;
    gain.gain.setValueAtTime(this.config.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Positive chime for staff hired
  private playStaffHired(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [523, 659]; // C5, E5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(this.config.volume * 0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.15);
    });
  }

  // Construction sound for zone
  private playZoneBuilt(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    gain.gain.setValueAtTime(this.config.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Bell sound for meals
  private playMealBell(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(this.config.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Bright tone for day start
  private playDayStart(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    gain.gain.setValueAtTime(this.config.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Descending tone for night
  private playNightStart(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
    gain.gain.setValueAtTime(this.config.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

// Singleton instance
export const soundSystem = new SoundSystem();
