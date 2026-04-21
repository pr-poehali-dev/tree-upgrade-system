import { useRef, useEffect, useCallback } from 'react';

export function useGameAudio(soundEnabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicStartedRef = useRef(false);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Звук клика — весёлый "leaf pop"
  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Основной тон
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.12);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.18);

    // Шорох листика (шум)
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
  }, [soundEnabled, getCtx]);

  // Звук покупки — радостный "ding ding"
  const playBuy = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    const t = ctx.currentTime;

    [0, 0.1, 0.2].forEach((delay, i) => {
      const freqs = [523, 659, 784];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freqs[i], t + delay);
      gain.gain.setValueAtTime(0.15, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.3);
      osc.start(t + delay);
      osc.stop(t + delay + 0.3);
    });
  }, [soundEnabled, getCtx]);

  // Звук достижения — торжественный аккорд
  const playAchievement = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getCtx();
    const t = ctx.currentTime;

    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.12, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.6);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.6);
    });
  }, [soundEnabled, getCtx]);

  // Фоновая музыка — простая лесная мелодия
  const startMusic = useCallback(() => {
    if (!soundEnabled || musicStartedRef.current) return;
    musicStartedRef.current = true;

    const ctx = getCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
    masterGain.connect(ctx.destination);
    musicGainRef.current = masterGain;

    // Мелодия — простая лесная тема (ноты Do-Re-Mi-Fa-Sol)
    const melody = [
      [523, 0.4], [587, 0.4], [659, 0.4], [698, 0.4],
      [784, 0.8], [698, 0.4], [659, 0.4],
      [587, 0.8], [523, 0.8],
      [659, 0.4], [784, 0.4], [880, 0.8],
      [784, 0.4], [698, 0.4], [659, 0.8],
      [587, 0.4], [523, 0.4], [587, 0.4], [659, 0.4],
      [523, 1.2],
    ] as [number, number][];

    // Бас — педаль
    const bassNotes = [
      [130, 1.6], [146, 1.6], [165, 1.6], [130, 1.6],
      [146, 1.6], [165, 1.6], [130, 1.6], [146, 1.6],
    ] as [number, number][];

    const playLoop = (startTime: number) => {
      let t = startTime;
      const oscs: OscillatorNode[] = [];

      melody.forEach(([freq, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.6, t + 0.05);
        gain.gain.setValueAtTime(0.5, t + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + dur);
        oscs.push(osc);
        t += dur;
      });

      let bt = startTime;
      bassNotes.forEach(([freq, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, bt);
        gain.gain.setValueAtTime(0.3, bt);
        gain.gain.exponentialRampToValueAtTime(0.001, bt + dur - 0.05);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(bt);
        osc.stop(bt + dur);
        oscs.push(osc);
        bt += dur;
      });

      oscillatorsRef.current = oscs;

      // Повторяем мелодию
      const totalDur = melody.reduce((s, [, d]) => s + d, 0);
      setTimeout(() => {
        if (musicStartedRef.current && musicGainRef.current) {
          playLoop(ctx.currentTime);
        }
      }, (totalDur - 0.2) * 1000);
    };

    playLoop(ctx.currentTime + 0.1);
  }, [soundEnabled, getCtx]);

  const stopMusic = useCallback(() => {
    musicStartedRef.current = false;
    if (musicGainRef.current) {
      try {
        musicGainRef.current.gain.exponentialRampToValueAtTime(0.001, (ctxRef.current?.currentTime ?? 0) + 0.5);
      } catch {
        // ignore
      }
    }
    oscillatorsRef.current.forEach(o => { try { o.stop(); } catch { /* ignore */ } });
    oscillatorsRef.current = [];
    musicGainRef.current = null;
  }, []);

  // Следим за переключением звука
  useEffect(() => {
    if (soundEnabled) {
      startMusic();
    } else {
      stopMusic();
    }
  }, [soundEnabled, startMusic, stopMusic]);

  // Чистим при unmount
  useEffect(() => {
    return () => {
      stopMusic();
      ctxRef.current?.close();
    };
  }, [stopMusic]);

  return { playClick, playBuy, playAchievement, startMusic };
}
