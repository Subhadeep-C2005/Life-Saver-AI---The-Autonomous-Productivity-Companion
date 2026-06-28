export function playSuccessSound() {
  try {
    const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';

    // Start frequency at 880Hz (A5)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    // Quickly ramp up to 1760Hz (A6) over 0.1 seconds for a crisp pop/ding
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    // Fade out volume smoothly over 0.3 seconds
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    // Silent catch so autoplay blocks or Web Audio failures don't crash the application
    console.warn('Audio feedback blocked or failed:', err);
  }
}
