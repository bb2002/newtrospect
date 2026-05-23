// 아이콘·스플래시 자동 생성. 외부 디자인 툴 없이 PNG 픽셀을 직접 그려 만든다.
//
// 디자인: 다크 배경(#1c1c20) + 중앙에 4색 가로 stripe (노랑·파랑·초록·빨강).
//   - 노랑 = context (핵심 문장)
//   - 파랑 = term (어려운 용어)
//   - 초록 = quantitative (수치)
//   - 빨강 = sensational (자극적 표현)
//
// 출력:
//   - assets/icon.png             (1024x1024, 다크 배경 포함, Play/launcher 일반 아이콘)
//   - assets/adaptive-icon.png    (1024x1024, foreground 전용, 배경 투명 — Android 어댑티브)
//   - assets/splash-icon.png      (1024x1024, 스플래시 중앙용)
//   - assets/favicon.png          (64x64, 폴백)
import { PNG } from "pngjs";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const assetsDir = path.resolve(projectRoot, "assets");

const BG = [28, 28, 32, 255]; // #1c1c20
const STRIPE_COLORS = [
  [255, 220, 90, 255], // 노랑 — context
  [90, 150, 255, 255], // 파랑 — term
  [80, 200, 120, 255], // 초록 — quantitative
  [255, 90, 90, 255], // 빨강 — sensational
];

/**
 * @param {object} o
 * @param {number} o.size
 * @param {boolean} [o.includeBg=true]  — false 면 배경을 투명으로 (adaptive foreground 용)
 * @param {number} [o.stripeWidthRatio=0.46] — foreground 안에 들어가도록 ~46%
 * @param {number} [o.stripeHeightRatio=0.06]
 * @param {number} [o.stripeGapRatio=0.018]
 */
function makeIconBuffer({
  size,
  includeBg = true,
  stripeWidthRatio = 0.46,
  stripeHeightRatio = 0.06,
  stripeGapRatio = 0.018,
}) {
  const png = new PNG({ width: size, height: size, fill: true });

  // 배경
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) << 2;
      if (includeBg) {
        png.data[i] = BG[0];
        png.data[i + 1] = BG[1];
        png.data[i + 2] = BG[2];
        png.data[i + 3] = BG[3];
      } else {
        png.data[i] = 0;
        png.data[i + 1] = 0;
        png.data[i + 2] = 0;
        png.data[i + 3] = 0;
      }
    }
  }

  // stripes — 중앙 정렬
  const stripeWidth = Math.round(size * stripeWidthRatio);
  const stripeHeight = Math.round(size * stripeHeightRatio);
  const gap = Math.round(size * stripeGapRatio);
  const totalH = STRIPE_COLORS.length * stripeHeight + (STRIPE_COLORS.length - 1) * gap;
  const startY = Math.round((size - totalH) / 2);
  const startX = Math.round((size - stripeWidth) / 2);
  const radius = Math.max(2, Math.round(stripeHeight * 0.3));

  for (let s = 0; s < STRIPE_COLORS.length; s++) {
    const [r, g, b, a] = STRIPE_COLORS[s];
    const y0 = startY + s * (stripeHeight + gap);
    for (let y = y0; y < y0 + stripeHeight; y++) {
      for (let x = startX; x < startX + stripeWidth; x++) {
        // 모서리 라운드 (단순 원형 마스크)
        const inLeft = x < startX + radius;
        const inRight = x >= startX + stripeWidth - radius;
        const inTop = y < y0 + radius;
        const inBot = y >= y0 + stripeHeight - radius;
        if ((inLeft && inTop) || (inRight && inTop) || (inLeft && inBot) || (inRight && inBot)) {
          const cx = inLeft ? startX + radius : startX + stripeWidth - radius - 1;
          const cy = inTop ? y0 + radius : y0 + stripeHeight - radius - 1;
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy > radius * radius) continue;
        }
        const idx = (y * size + x) << 2;
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }

  return PNG.sync.write(png);
}

await mkdir(assetsDir, { recursive: true });

const tasks = [
  {
    file: "icon.png",
    buf: makeIconBuffer({ size: 1024 }),
  },
  {
    // Android adaptive: foreground 만, 배경은 app.json 의 backgroundColor 사용.
    // launcher 마스크가 ~660px effective area 라 stripe 폭은 더 작게.
    file: "adaptive-icon.png",
    buf: makeIconBuffer({ size: 1024, includeBg: false, stripeWidthRatio: 0.4 }),
  },
  {
    // 스플래시 중앙. 사이즈는 expo-splash-screen 이 contain 으로 맞춤.
    file: "splash-icon.png",
    buf: makeIconBuffer({ size: 1024, stripeWidthRatio: 0.38 }),
  },
  {
    file: "favicon.png",
    buf: makeIconBuffer({ size: 64, stripeHeightRatio: 0.1, stripeGapRatio: 0.03 }),
  },
];

for (const t of tasks) {
  await writeFile(path.join(assetsDir, t.file), t.buf);
  console.log(`[icon] ${t.file}: ${t.buf.length} bytes`);
}
