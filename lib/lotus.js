class Lotus {
  constructor(x, y, size, image, pond) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.size = size;
    this.image = image;
    this.pond = pond;

    this.bobBoost = 0; // for click bounce effect
    this.bobTime = Math.random() * 100;
    this.driftOffset = Math.random() * 1000;
    this.driftSpeed = 0.01 + Math.random() * 0.02;

    this.xInit = x;
    this.yInit = y;
    this.targetX = x;
    this.targetY = y;
  }

  render(ctx) {
    this.bobTime += 0.03;

    // floating + bounce effect
    const floatOffset = Math.sin(this.bobTime) * 5;
    const boostOffset = Math.sin(this.bobBoost * Math.PI) * 10;
    const offsetY = floatOffset - boostOffset;

    // drifting left/right
    this.driftOffset += this.driftSpeed;
    const driftX = Math.sin(this.driftOffset) * 5;

    // draw the image
    if (this.image.complete) {
      ctx.drawImage(
        this.image,
        this.x + driftX,
        this.baseY + offsetY,
        this.size,
        this.size
      );
    }

    // decay the bob
    if (this.bobBoost > 0) {
      this.bobBoost -= 0.05;
      if (this.bobBoost < 0) this.bobBoost = 0;
    }

    // animate based on lotus stage
    if (this.pond.lotusStage === "forming") {
      this.x += (this.xInit - this.x) * 0.1;
      this.baseY += (this.yInit - this.baseY) * 0.1;
    } else if (this.pond.lotusStage === "dispersed") {
      this.x += (this.targetX - this.x) * 0.05;
      this.baseY += (this.targetY - this.baseY) * 0.05;
    }
  }

  isTouched(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.baseY &&
      y <= this.baseY + this.size
    );
  }

  triggerBob() {
    this.bobBoost = 1;
  }
}

module.exports = Lotus;
