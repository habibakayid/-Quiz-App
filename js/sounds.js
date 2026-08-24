class SoundManager {
    constructor() {
      this.audioCtx = null;
    }
  
    getContext() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    }
  
    playTone(frequency, startTime, duration, type = "sine", volume = 0.2) {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
  
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
  
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
  
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    }
  
    
    playCorrect() {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      this.playTone(523.25, now, 0.15, "sine", 0.25); 
      this.playTone(783.99, now + 0.12, 0.25, "sine", 0.25);
    }
  
    
    playWrong() {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      this.playTone(200, now, 0.3, "sawtooth", 0.2);
      this.playTone(150, now + 0.1, 0.3, "sawtooth", 0.2);
    }
  
    
    playTimeUp() {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      this.playTone(440, now, 0.2, "square", 0.15);
      this.playTone(330, now + 0.15, 0.3, "square", 0.15);
    }
  
   
    playTick(secondsLeft) {
      const ctx = this.getContext();
      const now = ctx.currentTime;
  
     
      const urgency = (6 - secondsLeft) / 5;
      const volume = 0.15 + urgency * 0.15;
      const frequency = 700 + urgency * 200;
  
      this.playTone(frequency, now, 0.1, "square", volume);
    }
  }
  
  const soundManager = new SoundManager();
  export default soundManager;