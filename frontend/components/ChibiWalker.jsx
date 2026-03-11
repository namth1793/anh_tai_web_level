/**
 * ChibiWalker — Dashboard scene.
 * Chibi walks left ↔ right, jumps & shows a speech bubble, then repeats.
 * Uses the PNG image loaded via Phaser preload.
 */
import { useEffect, useRef } from 'react';
import { showBubble } from '../lib/chibiDraw';

const MESSAGES = [
  'Chào bạn! 👋',
  'Cố lên! 💪',
  'F-QUEST! ⚔️',
  'Nhiệm vụ đang chờ!',
  'Bạn làm được! ✨',
  'Level up thôi! 🌟',
  'Chiến thôi nào! 🔥',
];

export default function ChibiWalker() {
  const wrapRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let alive = true;

    (async () => {
      const { default: Phaser } = await import('phaser');
      if (!alive || !wrapRef.current || gameRef.current) return;

      const W = wrapRef.current.offsetWidth || 400;

      gameRef.current = new Phaser.Game({
        type: Phaser.CANVAS,
        width: W,
        height: 90,
        transparent: true,
        parent: wrapRef.current,
        banner: false,
        audio: { noAudio: true },
        scene: {
          preload() {
            this.load.image('chibi', '/chibi.png');
          },
          create() { walkerScene(this, W); },
        },
      });
    })();

    return () => {
      alive = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      suppressHydrationWarning
      style={{ width: '100%', height: 90, background: 'transparent' }}
    />
  );
}

/* ─── Phaser scene ─── */
function walkerScene(scene, W) {
  const GY = 74; // ground y — chibi feet rest here

  // Subtle ground line
  const gfx = scene.add.graphics();
  gfx.lineStyle(1.5, 0xFFD4A8, 0.4);
  gfx.lineBetween(10, GY, W - 10, GY);

  // Chibi image — origin at bottom-center (feet anchor)
  const chibi = scene.add.image(55, GY, 'chibi');
  chibi.setOrigin(0.5, 1);
  // Scale so chibi is 68px tall
  const baseScale = 68 / chibi.height;
  chibi.setScale(baseScale);

  let msgIdx = 0;

  // Continuous idle bob
  scene.tweens.add({
    targets: chibi,
    y: GY - 3,
    duration: 380,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });

  function cycle() {
    const goRight = chibi.x < W / 2;
    const targetX = goRight ? W - 55 : 55;
    // Face walk direction
    chibi.scaleX = goRight ? baseScale : -baseScale;

    scene.tweens.add({
      targets: chibi,
      x: targetX,
      duration: Math.abs(targetX - chibi.x) * 9,
      ease: 'Linear',
      onComplete() {
        // Flip to face the audience when talking
        chibi.scaleX = goRight ? -baseScale : baseScale;

        // Celebrate jump
        scene.tweens.add({
          targets: chibi,
          y: GY - 18,
          duration: 170,
          ease: 'Power2',
          yoyo: true,
          repeat: 2,
        });

        showBubble(scene, chibi, MESSAGES[msgIdx++ % MESSAGES.length], W);
        scene.time.delayedCall(2600, cycle);
      },
    });
  }

  cycle();
}
