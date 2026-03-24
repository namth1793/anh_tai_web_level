/**
 * ChibiQuestScene — Quest-tree scene (10 levels).
 * The chibi climbs up to the player's current level.
 */
import { useEffect, useRef } from 'react';
import { celebrate } from '../lib/chibiDraw';

// Canvas: 160 wide × 580 tall — 55px spacing between levels
const CANVAS_W = 160;
const CANVAS_H = 580;
const PATH_X   = 32;
const CHIBI_X  = 82;

const LEVEL_Y = {
  1: 545, 2: 490, 3: 435, 4: 380, 5: 325,
  6: 270, 7: 215, 8: 160, 9: 105, 10: 55,
};
const LEVEL_NAME = {
  1:  'Tân Binh',
  2:  'Thám Hiểm',
  3:  'Chiến Binh',
  4:  'Dũng Sĩ',
  5:  'Anh Hùng',
  6:  'Huyền Thoại',
  7:  'Chiến Thần',
  8:  'Thiên Long',
  9:  'Bất Bại',
  10: '⚔️ Bá Vương',
};

export default function ChibiQuestScene({ level = 1 }) {
  const wrapRef    = useRef(null);
  const gameRef    = useRef(null);
  const setLevelFn = useRef(null);
  const initLevel  = useRef(level);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let alive = true;

    (async () => {
      const { default: Phaser } = await import('phaser');
      if (!alive || !wrapRef.current || gameRef.current) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.CANVAS,
        width:  CANVAS_W,
        height: CANVAS_H,
        transparent: true,
        parent: wrapRef.current,
        banner: false,
        audio: { noAudio: true },
        scene: {
          preload() { this.load.image('chibi', '/chibi.png'); },
          create() {
            const { setLevel } = buildScene(this, initLevel.current);
            setLevelFn.current = setLevel;
            if (initLevel.current > 1) setLevel(initLevel.current);
          },
        },
      });
    })();

    return () => {
      alive = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    initLevel.current = level;
    setLevelFn.current?.(level);
  }, [level]);

  // Auto-scroll so current level is visible
  useEffect(() => {
    if (!wrapRef.current) return;
    const targetY = LEVEL_Y[Math.max(1, Math.min(10, level))];
    const scrollTop = targetY - CANVAS_H / 2 + 40;
    wrapRef.current.parentElement?.scrollTo?.({ top: Math.max(0, scrollTop), behavior: 'smooth' });
  }, [level]);

  return (
    <div
      ref={wrapRef}
      suppressHydrationWarning
      style={{ width: CANVAS_W, height: CANVAS_H, background: 'transparent', flexShrink: 0 }}
    />
  );
}

/* ─── Phaser scene builder ─── */
function buildScene(scene, initLv) {
  // Dotted path from level 10 up to level 1
  const pathG = scene.add.graphics();
  for (let y = LEVEL_Y[10] + 12; y < LEVEL_Y[1]; y += 14) {
    pathG.fillStyle(0xFFD4A8, 0.55);
    pathG.fillRect(PATH_X - 1, y, 2, 8);
  }

  // Level markers & labels
  const markerGfx = {};
  for (let lv = 1; lv <= 10; lv++) {
    const y = LEVEL_Y[lv];
    const g = scene.add.graphics();
    markerGfx[lv] = g;
    drawMarker(g, lv, y, lv <= initLv);

    scene.add.text(PATH_X + 14, y - 10, `Lv.${lv}`, {
      fontSize: '9px', color: '#FF7A00',
      fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
      fontStyle: 'bold',
    });
    scene.add.text(PATH_X + 14, y + 1, LEVEL_NAME[lv], {
      fontSize: lv === 10 ? '7px' : '7.5px', color: lv === 10 ? '#FF4500' : '#AAAAAA',
      fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
      fontStyle: lv === 10 ? 'bold' : 'normal',
    });
  }

  // Chibi image
  const chibi = scene.add.image(CHIBI_X, LEVEL_Y[1], 'chibi');
  chibi.setOrigin(0.5, 1);
  const baseScale = 50 / chibi.height;
  chibi.setScale(baseScale);
  chibi.scaleX = -baseScale;

  let bobTween = scene.tweens.add({
    targets: chibi,
    y: LEVEL_Y[1] - 3,
    duration: 850,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });

  let currentLv = 1;
  let busy = false;

  function climbTo(targetLv, onDone) {
    if (targetLv <= currentLv) { onDone?.(); return; }
    const nextLv = currentLv + 1;
    const fromY  = LEVEL_Y[currentLv];
    const toY    = LEVEL_Y[nextLv];

    scene.tweens.add({
      targets: chibi,
      y: toY,
      duration: Math.abs(toY - fromY) * 11,
      ease: 'Power1.easeOut',
      onComplete() {
        drawMarker(markerGfx[nextLv], nextLv, LEVEL_Y[nextLv], true);
        currentLv = nextLv;
        if (nextLv < targetLv) {
          scene.time.delayedCall(120, () => climbTo(targetLv, onDone));
        } else {
          onDone?.();
        }
      },
    });
  }

  function setLevel(newLv) {
    newLv = Math.max(1, Math.min(10, newLv));
    if (busy || newLv === currentLv) return;
    busy = true;

    bobTween.stop();
    scene.tweens.killTweensOf(chibi);
    drawMarker(markerGfx[currentLv], currentLv, LEVEL_Y[currentLv], true);

    climbTo(newLv, () => {
      celebrate(scene, CHIBI_X, LEVEL_Y[newLv] - 20);
      bobTween = scene.tweens.add({
        targets: chibi,
        y: LEVEL_Y[newLv] - 3,
        duration: 850,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
      busy = false;
    });
  }

  if (initLv > 1) {
    scene.time.delayedCall(600, () => setLevel(initLv));
  }

  return { setLevel };
}

function drawMarker(g, lv, y, active) {
  g.clear();
  const isBoss = lv === 10;
  if (active) {
    g.fillStyle(isBoss ? 0xFF4500 : 0xFF7A00);
    g.fillCircle(PATH_X, y, isBoss ? 11 : 9);
    g.lineStyle(isBoss ? 3 : 2.5, 0xFFFFFF, 0.9);
    g.strokeCircle(PATH_X, y, isBoss ? 11 : 9);
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillCircle(PATH_X, y, 3);
  } else {
    g.fillStyle(0xFFE8CC);
    g.fillCircle(PATH_X, y, 6);
    g.lineStyle(1.5, 0xFFD4A8, 0.8);
    g.strokeCircle(PATH_X, y, 6);
  }
}
