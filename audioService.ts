
class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOsc: OscillatorNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.2;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = 0.5;
    this.sfxGain.connect(this.masterGain);
  }

  playSFX(type: 'whoosh' | 'damage' | 'fire' | 'win' | 'unlock') {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g);
    g.connect(this.sfxGain);

    const now = this.ctx.currentTime;

    switch (type) {
      case 'whoosh':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'damage':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
        g.gain.setValueAtTime(0.8, now);
        g.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'fire':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'win':
        [523.25, 659.25, 783.99].forEach((f, i) => {
          const o = this.ctx!.createOscillator();
          const gn = this.ctx!.createGain();
          o.frequency.value = f;
          o.connect(gn);
          gn.connect(this.sfxGain!);
          gn.gain.setValueAtTime(0.2, now + i * 0.1);
          gn.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.3);
        });
        break;
      case 'unlock':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.linearRampToValueAtTime(2000, now + 0.5);
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
    }
  }

  startMusic() {
    if (!this.ctx || !this.musicGain || this.musicOsc) return;
    this.musicOsc = this.ctx.createOscillator();
    this.musicOsc.type = 'sine';
    this.musicOsc.frequency.setValueAtTime(110, this.ctx.currentTime);
    
    // Create a simple eerie loop
    const loop = () => {
        if (!this.musicOsc || !this.ctx) return;
        const now = this.ctx.currentTime;
        this.musicOsc.frequency.linearRampToValueAtTime(110, now);
        this.musicOsc.frequency.linearRampToValueAtTime(80, now + 2);
        this.musicOsc.frequency.linearRampToValueAtTime(120, now + 4);
        setTimeout(loop, 4000);
    };
    
    this.musicOsc.connect(this.musicGain);
    this.musicOsc.start();
    loop();
  }

  stopMusic() {
    if (this.musicOsc) {
      this.musicOsc.stop();
      this.musicOsc = null;
    }
  }
}

export const audioService = new AudioService();
