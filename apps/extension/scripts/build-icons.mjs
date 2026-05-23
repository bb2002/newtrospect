// 익스텐션 아이콘 자동 생성. mobile 의 build-icons.mjs 와 같은 4색 stripe 디자인.
// Chrome MV3 manifest 가 요구하는 사이즈(16/48/128) 를 한 번에 생성.
//
// 작은 사이즈(16px)에서 stripe 가 보이도록 ratio 가 아닌 *절대 픽셀* 로 정의.
// mobile 과 같은 색이지만 사이즈별 통제가 필요해 별도 스크립트로 둔다.
//
// 출력: public/icons/icon-{16,48,128}.png
import { PNG } from "pngjs";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const outDir = path.resolve(projectRoot, "public/icons");

const BG = [28, 28, 32, 255]; // #1c1c20 — mobile 과 동일
const STRIPE_COLORS = [
  [255, 220, 90, 255], // 노랑 — context
  [90, 150, 255, 255], // 파랑 — term
  [80, 200, 120, 255], // 초록 — quantitative
  [255, 90, 90, 255], // 빨강 — sensational
];

// 사이즈별 디자인 파라미터 (절대 픽셀).
// 작은 사이즈일수록 stripe 와 gap 의 균형이 까다로워 ratio 대신 직접 지정.
const PRESETS = {
  16: { width: 12, stripeH: 2, gap: 1, radius: 0 },
  48: { width: 36, stripeH: 5, gap: 2, radius: 1 },
  128: { width: 92, stripeH: 12, gap: 4, radius: 3 },
};

function makeIcon(size) {
  const cfg = PRESETS[size];
  if (!cfg) throw new Error(`No preset for size ${size}`);
  const { width, stripeH, gap, radius } = cfg;

  const png = new PNG({ width: size, height: size, fill: true });

  // 배경 채우기
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) << 2;
      png.data[i] = BG[0];
      png.data[i + 1] = BG[1];
      png.data[i + 2] = BG[2];
      png.data[i + 3] = BG[3];
    }
  }

  const totalH = STRIPE_COLORS.length * stripeH + (STRIPE_COLORS.length - 1) * gap;
  const startY = Math.round((size - totalH) / 2);
  const startX = Math.round((size - width) / 2);

  for (let s = 0; s < STRIPE_COLORS.length; s++) {
    const [r, g, b, a] = STRIPE_COLORS[s];
    const y0 = startY + s * (stripeH + gap);
    for (let y = y0; y < y0 + stripeH; y++) {
      for (let x = startX; x < startX + width; x++) {
        // 모서리 라운드 마스크 (작은 사이즈는 radius=0 → 효과 없음)
        if (radius > 0) {
          const inLeft = x < startX + radius;
          const inRight = x >= startX + width - radius;
          const inTop = y < y0 + radius;
          const inBot = y >= y0 + stripeH - radius;
          if ((inLeft && inTop) || (inRight && inTop) || (inLeft && inBot) || (inRight && inBot)) {
            const cx = inLeft ? startX + radius : startX + width - radius - 1;
            const cy = inTop ? y0 + radius : y0 + stripeH - radius - 1;
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy > radius * radius) continue;
          }
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

await mkdir(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const buf = makeIcon(size);
  const file = path.join(outDir, `icon-${size}.png`);
  await writeFile(file, buf);
  console.log(`[icon] icon-${size}.png: ${buf.length} bytes`);
}
