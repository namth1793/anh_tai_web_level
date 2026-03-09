/**
 * Shared Phaser 3 chibi character helpers.
 * All coordinates are relative to the Container origin (0,0 = feet/ground level).
 *
 * Full extent:  top = -45px (hair tip)  /  bottom = +17px (feet bottom)
 */

export function makeChibi(scene, x, y) {
  const c = scene.add.container(x, y);

  // Shadow
  c.add(scene.add.ellipse(0, 3, 28, 8, 0x000000, 0.1));

  // Static body: hair, head, face, shirt, arms
  const body = scene.add.graphics();
  drawBody(body);
  c.add(body);

  // Legs (redrawn on each walk frame)
  const ll = scene.add.graphics();
  const rl = scene.add.graphics();
  c.add(ll);
  c.add(rl);

  function legs(frame) {
    ll.clear(); rl.clear();
    const lY = frame ? 2 : -2;
    const rY = frame ? -2 : 2;
    ll.fillStyle(0x4455AA); ll.fillRect(-9, 1 + lY, 8, 12);
    ll.fillStyle(0x333333); ll.fillRect(-10, 11 + lY, 10, 4);
    rl.fillStyle(0x4455AA); rl.fillRect(1, 1 + rY, 8, 12);
    rl.fillStyle(0x333333); rl.fillRect(0, 11 + rY, 10, 4);
  }
  legs(0);

  return { c, legs };
}

function drawBody(g) {
  // --- Hair (behind head) ---
  g.fillStyle(0x4A2C0A);
  g.fillCircle(0, -32, 13);
  g.fillRect(-13, -37, 26, 9);

  // --- Head ---
  g.fillStyle(0xFFD4A8);
  g.fillCircle(0, -29, 12);

  // Cheeks
  g.fillStyle(0xFFB3B3, 0.65);
  g.fillCircle(-8, -25, 3.5);
  g.fillCircle(8, -25, 3.5);

  // Eyes
  g.fillStyle(0x111111);
  g.fillCircle(-4.5, -30, 2.2);
  g.fillCircle(4.5, -30, 2.2);

  // Eye shine
  g.fillStyle(0xFFFFFF);
  g.fillCircle(-3.5, -31, 0.9);
  g.fillCircle(5.5, -31, 0.9);

  // Smile
  g.fillStyle(0xFF8888);
  g.fillCircle(-2, -24, 1.5);
  g.fillCircle(0, -23.2, 1.5);
  g.fillCircle(2, -24, 1.5);

  // --- Shirt (orange) ---
  g.fillStyle(0xFF7A00);
  g.fillRoundedRect(-10, -17, 20, 18, 4);

  // --- Arms (skin) ---
  g.fillStyle(0xFFD4A8);
  g.fillRoundedRect(-16, -15, 7, 10, 3); // left
  g.fillRoundedRect(9, -15, 7, 10, 3);   // right
}

/**
 * Show a floating speech bubble above the character container.
 * @param {Phaser.Scene} scene
 * @param {Phaser.GameObjects.Container} target - character container
 * @param {string} msg
 * @param {number} canvasW - canvas width for clamping
 */
export function showBubble(scene, target, msg, canvasW) {
  const PAD = 13, TH = 22;
  const tw = Math.max(70, msg.length * 6.5 + PAD * 2);
  const rawX = target.x;
  const bx = canvasW
    ? Math.min(Math.max(rawX, tw / 2 + 4), canvasW - tw / 2 - 4)
    : rawX;
  const by = target.y - 54;

  const bc = scene.add.container(bx, by);
  const bg = scene.add.graphics();

  // Box
  bg.fillStyle(0xFFFFFF, 0.96);
  bg.lineStyle(1.5, 0xFFD4A8, 1);
  bg.fillRoundedRect(-tw / 2, -TH / 2, tw, TH, 7);
  bg.strokeRoundedRect(-tw / 2, -TH / 2, tw, TH, 7);
  // Tail arrow
  bg.fillStyle(0xFFFFFF, 0.96);
  bg.fillTriangle(-5, TH / 2, 5, TH / 2, 0, TH / 2 + 8);
  bg.lineStyle(1.5, 0xFFD4A8, 1);
  bg.lineBetween(-5, TH / 2, 0, TH / 2 + 8);
  bg.lineBetween(5, TH / 2, 0, TH / 2 + 8);

  const txt = scene.add.text(0, 0, msg, {
    fontSize: '10px', color: '#FF7A00',
    fontFamily: '-apple-system, BlinkMacSystemFont, Arial',
    fontStyle: 'bold',
  }).setOrigin(0.5);

  bc.add([bg, txt]);
  bc.setAlpha(0);

  scene.tweens.add({
    targets: bc, alpha: 1, duration: 200,
    onComplete() {
      scene.time.delayedCall(1800, () =>
        scene.tweens.add({
          targets: bc, alpha: 0, duration: 200,
          onComplete: () => bc.destroy(),
        })
      );
    },
  });
}

/**
 * Burst of star particles at (x, y).
 */
export function celebrate(scene, x, y) {
  const STARS = ['⭐', '✨', '🌟', '💫', '⭐', '✨'];
  STARS.forEach((s, i) => {
    const star = scene.add.text(x, y, s, { fontSize: '13px' }).setOrigin(0.5);
    const a = (i / STARS.length) * Math.PI * 2;
    scene.tweens.add({
      targets: star,
      x: x + Math.cos(a) * 40,
      y: y + Math.sin(a) * 30 - 15,
      alpha: 0, duration: 900, ease: 'Power2',
      onComplete: () => star.destroy(),
    });
  });
}