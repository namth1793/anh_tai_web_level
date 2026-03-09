/**
 * ChibiQuestScene — Quest-tree scene.
 * Shows a vertical 5-level path. The chibi starts at Lv.1 then runs up to
 * the player's current level on mount. When the `level` prop increases,
 * the chibi runs up to the new level with a celebration.
 */
import { useEffect, useRef } from 'react';
import { makeChibi, celebrate } from '../lib/chibiDraw';

// Level y positions inside 320px canvas (level 1 at bottom → level 5 at top)
const LEVEL_Y   = { 1: 280, 2: 220, 3: 160, 4: 100, 5: 48 };
const LEVEL_NAME = {
  1: 'Tân Binh',
  2: 'Chiến Binh',
  3: 'Dũng Sĩ',
  4: 'Huyền Thoại',
  5: '⚔️ HERO',
};
const PATH_X  = 32; // x of the vertical dotted path
const CHIBI_X = 75; // x of the character (right of the path)

export default function ChibiQuestScene({ level = 1 }) {
  const wrapRef    = useRef(null);
  const gameRef    = useRef(null);
  const setLevelFn = useRef(null);   // callback exposed by the Phaser scene
  const initLevel  = useRef(level);  // level at mount time

  /* ── Mount: create Phaser game ── */
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
          create() {
            const { setLevel } = buildScene(this, initLevel.current);
            setLevelFn.current = setLevel;
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

  /* ── When level prop changes after mount ── */
  useEffect(() => {
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

    // Lv.N text
    scene.add.text(PATH_X + 14, y - 9, `Lv.${lv}`, {
      fontSize: '9px', color: '#FF7A00',
      fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
      fontStyle: 'bold',
    });
    // Name text
    scene.add.text(PATH_X + 14, y + 2, LEVEL_NAME[lv], {
      fontSize: '7.5px', color: '#AAAAAA',
      fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
    });
  }

  /* Highlight the starting level marker */
  drawMarker(markerGfx[initLv], initLv, LEVEL_Y[initLv], true);

  /* Character — starts at level 1 */
  const chibi = makeChibi(scene, CHIBI_X, LEVEL_Y[1]);
  chibi.c.scaleX = -1; // face left (toward the path)

  // Idle bob tween (replaced when climbing)
  let bobTween = scene.tweens.add({
    targets: chibi.c,
    y: LEVEL_Y[1] - 3,
    duration: 850,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });

  let currentLv = 1;
  let busy = false;

  /* Animate chibi from currentLv up to targetLv */
  function climbTo(targetLv, onDone) {
    if (targetLv <= currentLv) { onDone?.(); return; }

    // Walk up one level at a time for a stair-step effect
    const nextLv = currentLv + 1;
    const fromY  = LEVEL_Y[currentLv];
    const toY    = LEVEL_Y[nextLv];

    // Walking leg animation during climb
    let frame = 0;
    const legTimer = scene.time.addEvent({
      delay: 180, loop: true,
      callback() { chibi.legs(frame ^= 1); },
    });

    scene.tweens.add({
      targets: chibi.c, y: toY,
      duration: Math.abs(toY - fromY) * 11,
      ease: 'Power1.easeOut',
      onComplete() {
        legTimer.destroy();
        chibi.legs(0);
        drawMarker(markerGfx[nextLv], nextLv, LEVEL_Y[nextLv], true);
        currentLv = nextLv;

        if (nextLv < targetLv) {
          // Continue climbing
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

    // Stop bob
    bobTween.stop();
    scene.tweens.killTweensOf(chibi.c);

    // Dim old marker if going to a different level
    if (newLv !== currentLv) {
      drawMarker(markerGfx[currentLv], currentLv, LEVEL_Y[currentLv], false);
    }

    climbTo(newLv, () => {
      // Celebrate at new level
      celebrate(scene, CHIBI_X, LEVEL_Y[newLv] - 10);

      // Resume idle bob at new position
      bobTween = scene.tweens.add({
        targets: chibi.c,
        y: LEVEL_Y[newLv] - 3,
        duration: 850,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });

      busy = false;
    });
  }

  /* On mount: animate from level 1 up to initLv after a short delay */
  if (initLv > 1) {
    scene.time.delayedCall(600, () => setLevel(initLv));
  }

  return { setLevel };
}

/* Draw / redraw a single level-marker circle */
function drawMarker(g, lv, y, active) {
  g.clear();
  if (active) {
    g.fillStyle(0xFF7A00);
    g.fillCircle(PATH_X, y, 9);
    g.lineStyle(2.5, 0xFFFFFF, 0.85);
    g.strokeCircle(PATH_X, y, 9);
    // Inner star dot
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillCircle(PATH_X, y, 3);
  } else {
    g.fillStyle(0xFFE8CC);
    g.fillCircle(PATH_X, y, 6);
    g.lineStyle(1.5, 0xFFD4A8, 0.8);
    g.strokeCircle(PATH_X, y, 6);
  }
}