// Estúdio de gravação da abertura: roda a cena em modo de gravação (passo fixo,
// qualidade máxima). O script scripts/gravar-abertura.mjs avança quadro a quadro.
import { startIntro } from '../src/scripts/intro-scene';

const canvas = document.getElementById('c') as HTMLCanvasElement;
const state = window as unknown as { __introReady: boolean; __introReveal: number; __introStage: string };
state.__introReveal = -1;
startIntro(
  canvas,
  {
    onReady: () => (state.__introReady = true),
    onStage: (s) => (state.__introStage = s),
    // guarda a linha de revelação como fração da altura do quadro
    onReveal: (px) => (state.__introReveal = px / window.innerHeight),
  },
  { record: { fps: 30 } },
);
