/**
 * ChibiQuestScene — Quest-tree scene.
 * Shows a vertical 5-level path. The chibi runs up to the player's level.
 * Uses the PNG image loaded via Phaser preload.
 */
import { useEffect, useRef } from 'react';
import { celebrate } from '../lib/chibiDraw';

const LEVEL_Y    = { 1: 280, 2: 220, 3: 160, 4: 100, 5: 48 };
const LEVEL_NAME = {
  1: 'Tân Binh',
  2: 'Chiến Binh',
  3: 'Dũng Sĩ',
  4: 'Huyền Thoại',
  5: '⚔️ HERO',
};
const PATH_X  = 32;
const CHIBI_X = 78;

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
        width: 160,
        height: 320,
        transparent: true,
        parent: wrapRef.current,
        banner: false,
        audio: { noAudio: true },
        scene: {
          preload() {
            this.load.image('chibi', '/chibi.png');
          },
          create() {
            const { setLevel } = buildScene(this, initLevel.current);
            setLevelFn.current = setLevel;
            // If level prop updated while Phaser was loading, climb now
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
    // Keep initLevel in sync so Phaser uses the latest value even if game creates after level updates
    initLevel.current = level;
    setLevelFn.current?.(level);
  }, [level]);

  return (
    <div
      ref={wrapRef}
      suppressHydrationWarning
      style={{ width: 160, height: 320, background: 'transparent', flexShrink: 0 }}
    />
  );
}

/* ─── Phaser scene builder ─── */
function buildScene(scene, initLv) {
  /* Dotted path */
  const pathG = scene.add.graphics();
  for (let y = LEVEL_Y[5] + 18; y < LEVEL_Y[1]; y += 14) {
    pathG.fillStyle(0xFFD4A8, 0.55);
    pathG.fillRect(PATH_X - 1, y, 2, 8);
  }

  /* Level markers & labels */
  const markerGfx = {};
  for (let lv = 1; lv <= 5; lv++) {
    const y = LEVEL_Y[lv];
    const g = scene.add.graphics();
    markerGfx[lv] = g;
    drawMarker(g, lv, y, false);

    scene.add.text(PATH_X + 14, y - 9, `Lv.${lv}`, {
      fontSize: '9px', color: '#FF7A00',
      fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
      fontStyle: 'bold',
    });
    scene.add.text(PATH_X + 14, y + 2, LEVEL_NAME[lv], {
      fontSize: '7.5px', color: '#AAAAAA',
      fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
    });
  }

  drawMarker(markerGfx[initLv], initLv, LEVEL_Y[initLv], true);

  /* Chibi image — anchored at bottom-center, scaled to ~55px tall */
  const chibi = scene.add.image(CHIBI_X, LEVEL_Y[1], 'chibi');
  chibi.setOrigin(0.5, 1);
  const baseScale = 55 / chibi.height;
  chibi.setScale(baseScale);
  chibi.scaleX = -baseScale; // face left toward the path

  // Idle bob
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
    const nextLv  = currentLv + 1;
    const fromY   = LEVEL_Y[currentLv];
    const toY     = LEVEL_Y[nextLv];

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
    newLv = Math.max(1, Math.min(5, newLv));
    if (busy || newLv === currentLv) return;
    busy = true;

    bobTween.stop();
    scene.tweens.killTweensOf(chibi);

    if (newLv !== currentLv) {
      drawMarker(markerGfx[currentLv], currentLv, LEVEL_Y[currentLv], false);
    }

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
  if (active) {
    g.fillStyle(0xFF7A00);
    g.fillCircle(PATH_X, y, 9);
    g.lineStyle(2.5, 0xFFFFFF, 0.85);
    g.strokeCircle(PATH_X, y, 9);
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillCircle(PATH_X, y, 3);
  } else {
    g.fillStyle(0xFFE8CC);
    g.fillCircle(PATH_X, y, 6);
    g.lineStyle(1.5, 0xFFD4A8, 0.8);
    g.strokeCircle(PATH_X, y, 6);
  }
}
