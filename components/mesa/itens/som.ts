// Sons da barra de itens sintetizados na hora (Web Audio), sem arquivos.
// Só tocam depois de um toque do jogador — regra dos navegadores de celular.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function ruido(a: AudioContext, segundos: number): AudioBufferSourceNode {
  const buf = a.createBuffer(1, Math.ceil(a.sampleRate * segundos), a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  return src;
}

/** Estampido de pólvora: estalo de ruído com cauda grave. */
export function somTiro() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const n = ruido(a, 0.7);
  const filtro = a.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.setValueAtTime(5000, t);
  filtro.frequency.exponentialRampToValueAtTime(300, t + 0.5);
  const g = a.createGain();
  g.gain.setValueAtTime(1, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  n.connect(filtro).connect(g).connect(a.destination);
  n.start(t);

  const o = a.createOscillator();
  o.frequency.setValueAtTime(110, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
  const go = a.createGain();
  go.gain.setValueAtTime(0.9, t);
  go.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(go).connect(a.destination);
  o.start(t);
  o.stop(t + 0.32);
}

/** Estalo metálico curto: gatilho em seco, bala encaixando, cão armando. */
export function somClique(agudo = 1) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const n = ruido(a, 0.04);
  const filtro = a.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.frequency.value = 2600 * agudo;
  filtro.Q.value = 6;
  const g = a.createGain();
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  n.connect(filtro).connect(g).connect(a.destination);
  n.start(t);
}

/** Fósforo riscando: chiado curto. */
export function somRiscar() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const n = ruido(a, 0.35);
  const filtro = a.createBiquadFilter();
  filtro.type = "highpass";
  filtro.frequency.value = 3000;
  const g = a.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  n.connect(filtro).connect(g).connect(a.destination);
  n.start(t);
}

/** Vibração (Android). O iPhone não expõe vibração ao navegador: fica só no som e no tremor. */
export function vibrar(padrao: number | number[]) {
  try {
    navigator.vibrate?.(padrao);
  } catch {
    /* sem vibração */
  }
}
