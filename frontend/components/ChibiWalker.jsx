/**
 * ChibiWalker — Dashboard scene.
 * The chibi walks left ↔ right, stops to jump & show a speech bubble, then repeats.
 */
import { useEffect, useRef } from 'react';
import { makeChibi, showBubble } from '../lib/chibiDraw';

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
  const GY = 70; // ground y (container placed here, feet touch GY+17)

  // Subtle ground line
  const gfx = scene.add.graphics();
  gfx.lineStyle(1.5, 0xFFD4A8, 0.4);
  gfx.lineBetween(10, GY + 17, W - 10, GY + 17);

  const chibi = makeChibi(scene, 55, GY);
  let frame = 0;
  let walking = true;
  let msgIdx = 0;

  // Walk leg flicker
  scene.time.addEvent({
    delay: 230,
    loop: true,
    callback() { if (walking) chibi.legs(frame ^= 1); },
  });

  // Continuous body bob
  scene.tweens.add({
    targets: chibi.c,
    y: GY - 2,
    duration: 380,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  });

  function cycle() {
    const goRight = chibi.c.x < W / 2;
    const targetX = goRight ? W - 55 : 55;
    walking = true;
    chibi.c.scaleX = goRight ? 1 : -1;

    scene.tweens.add({
      targets: chibi.c,
      x: targetX,
      duration: Math.abs(targetX - chibi.c.x) * 9,
      ease: 'Linear',
      onComplete() {
        walking = false;
        chibi.legs(0);

        // Celebrate jump
        scene.tweens.add({
          targets: chibi.c,
          y: GY - 16,
          duration: 170,
          ease: 'Power2',
          yoyo: true,
          repeat: 2,
        });

        // Flip so chibi "faces" the audience when talking
        chibi.c.scaleX = goRight ? -1 : 1;

        showBubble(scene, chibi.c, MESSAGES[msgIdx++ % MESSAGES.length], W);

        scene.time.delayedCall(2600, cycle);
      },
    });
  }

  cycle();
}