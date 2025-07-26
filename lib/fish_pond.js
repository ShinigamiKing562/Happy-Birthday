const Fish = require("./fish");
const Target = require("./target");
const Ripple = require("./ripple");
const Lotus = require("./lotus");

class FishPond {
  constructor(window) {
    this.var = 0.001;
    this.instructions = true;
    this.opacity = 0.8;
    this.ops = this.opacity / 60;
    this.maxFood = 100;
    this.window = window;
    this.height = this.window.innerHeight;
    this.width = this.window.innerWidth;
    this.vh = this.height / 100;
    this.vw = this.width / 100;
    this.spots = [new Target(0, 0, 0)];
    for (let i = 1; i < 100; i++)
      this.spots.push(new Target(0, 0, 0, this.spots[i - 1]));
    this.spots[0].nextSpot = this.spots[this.spots.length - 1];

    const halfh = this.height / 2;
    const halfw = this.width / 2;
    for (let i = 0; i < Math.floor(this.spots.length) / 2; i++) {
      this.spots[i].x = halfw + Math.random() * halfw * Math.cos(i);
      this.spots[i].y = halfh + Math.random() * halfh * Math.sin(i);
    }
    for (
      let i = Math.floor(this.spots.length / 2);
      i < this.spots.length;
      i++
    ) {
      this.spots[i].x =
        halfw + (halfw / 4 + (Math.random() * halfw) / 1.5) * Math.cos(-i);
      this.spots[i].y =
        halfh + (halfh / 3 + (Math.random() * halfh) / 2) * Math.sin(-i);
    }

    this.foods = [];
    this.ripples = [];
    this.fish = [];
    let fishCount = 1 + (this.height * this.width) / 70000;
    for (let i = 0; i < fishCount; i++) this.addFish();

    this.lotusFormationMode = true;
    this.formationTime = 0;

    this.lotusImages = {
      small: new Image(),
      medium: new Image(),
      large: new Image(),
    };
    this.lotusImages.small.src = "assets/small-lotus.png";
    this.lotusImages.medium.src = "assets/medium-lotus.png";
    this.lotusImages.large.src = "assets/large-lotus.png";

    this.lotuses = [];

    const spellPoints = this.getLetterLotusPositions();
    for (let pt of spellPoints) {
      const imgIndex = Math.floor(Math.random() * 3);
      const image = [
        this.lotusImages.small,
        this.lotusImages.medium,
        this.lotusImages.large,
      ][imgIndex];
      const size = this.vw * 10 + Math.random() * this.vw * 6;
      const lotus = new Lotus(pt.x, pt.y, size, image, this);
      lotus.targetX = Math.random() * (this.width - size);
      lotus.targetY = this.vh * 2 + Math.random() * (this.height * 0.7);
      this.lotuses.push(lotus);
    }

    this.birthdaySong = new Audio("assets/3005.m4a");
    this.songPlayed = false;
    this.lotusStage = "forming";
    this.lotusAnimationFrame = 0;
  }

  start(canvas) {
    const ctx = canvas.getContext("2d");
    const startAnimation = () => {
      const h = this.height;
      const w = this.width;
      canvas.height = this.window.innerHeight;
      canvas.width = this.window.innerWidth;
      this.height = this.window.innerHeight;
      this.width = this.window.innerWidth;
      this.vh = this.height / 100;
      this.vw = this.width / 100;

      if (w !== this.width || h !== this.height) {
        const halfh = this.height / 2;
        const halfw = this.width / 2;
        for (let i = 0; i < Math.floor(this.spots.length) / 2; i++) {
          this.spots[i].x = halfw + Math.random() * halfw * Math.cos(i);
          this.spots[i].y = halfh + Math.random() * halfh * Math.sin(i);
        }
        for (
          let i = Math.floor(this.spots.length / 2);
          i < this.spots.length;
          i++
        ) {
          this.spots[i].x =
            halfw + (halfw / 4 + (Math.random() * halfw) / 1.5) * Math.cos(-i);
          this.spots[i].y =
            halfh + (halfh / 3 + (Math.random() * halfh) / 2) * Math.sin(-i);
        }
      }

      this.render(ctx);
      setTimeout(startAnimation, 1000 / 30);
    };
    startAnimation();
  }

  render(ctx) {
    ctx.fillStyle = "#ffc983";
    ctx.fillRect(0, 0, this.width, this.height);

    this.fish.sort((a, b) => b.mass - a.mass);
    for (let fish of this.fish) fish.render(ctx);
    for (let ripple of this.ripples) ripple.render(ctx);
    for (let food of this.foods) food.render(ctx);

    this.fontSize = Math.min(this.vh * 10, this.vw * 5);

    // 🟨 Show message if opacity > 0
    if (this.opacity > 0) {
      ctx.fillStyle = `rgba(50,50,50,${this.opacity})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = `rgba(255,255,255,${this.opacity * 1.25})`;
      ctx.font = `${this.fontSize}px Arial`;
      ctx.fillText(
        "Happy Birthday",
        this.width / 2 - this.fontSize * 3,
        this.height / 2 - this.vh * 10
      );
    }

    // 🌸 Render lotuses
    for (const lotus of this.lotuses) lotus.render(ctx);
  }

  click(x, y) {
    if (this.instructions && !this.fadingStarted) {
      this.instructions = false;
      this.fadingStarted = true; // prevent multiple triggers

      const fadeInterval = setInterval(() => {
        this.opacity -= this.ops;
        if (this.opacity <= 0) {
          this.opacity = 0;
          clearInterval(fadeInterval);

          // 💥 Now disperse the lotus flowers after message fades
          this.lotusStage = "dispersed";
          if (!this.songPlayed) {
            this.birthdaySong.play();
            this.songPlayed = true;
          }
          for (let lotus of this.lotuses) {
            lotus.targetX = -200 + Math.random() * (this.width + 400);
            lotus.targetY = -200 + Math.random() * (this.height + 400);
          }
        }
      }, 1000 / 30);
    }

    // Allow normal click behavior (e.g., fish spawning)
    let touchedLotus = false;
    const food = new Target(x, y, 3);

    for (const lotus of this.lotuses) {
      if (lotus.isTouched(x, y)) {
        touchedLotus = true;
        this.addFish();
        this.var += 0.001;
        lotus.triggerBob();
        this.ripple(lotus.x + lotus.size / 2, lotus.baseY + lotus.size / 2, 30);
        break;
      }
    }

    if (!touchedLotus) {
      if (this.foods.length < this.maxFood) {
        this.foods.push(food);
      } else {
        this.foods.shift();
        this.foods.push(food);
      }
      for (let fish of this.fish) fish.foodNotify(food);
    }
  }

  addFish() {
    let hov = Math.random() * 2;
    let x, y, dir;
    if (hov > 1) {
      y = this.height / 2;
      hov = Math.random() * 2;
      if (hov > 1) {
        x = -50;
        dir = 0.0001;
      } else {
        x = 50 + this.width;
        dir = Math.PI;
      }
    } else {
      x = this.width / 2;
      if (hov > 1) {
        y = -100;
        dir = Math.PI / 2;
      } else {
        y = this.height + 100;
        dir = (Math.PI / 2) * 3;
      }
    }
    this.fish.push(
      new Fish({
        mass: 35 + Math.sqrt(Math.random() * 10000) + this.var,
        x: x,
        y: y,
        pond: this,
        direction: dir,
      })
    );
  }

  getLetterLotusPositions() {
    const spacing = this.vw * 4;
    const startX = this.vw * 1.2;
    const startY = this.height - this.vh * 66;
    const points = [];

    const grid = [
      //A
      [
        [1, 0],
        [0, 1],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [0, 3],
        [2, 3],
        [0, 4],
        [2, 4],
      ],
      //L
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
      ],
      //M
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 1],
        [2, 2],
        [3, 1],
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
      ],
      //A
      [
        [1, 0],
        [0, 1],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [0, 3],
        [2, 3],
        [0, 4],
        [2, 4],
      ],
    ];

    let offsetX = startX;
    let offsetY = startY;

    for (let g of grid) {
      for (let [gx, gy] of g) {
        points.push({
          x: offsetX + gx * spacing,
          y: offsetY + gy * spacing,
        });
      }
      offsetX += spacing * 6;
    }

    return points;
  }

  ripple(x, y, size) {
    this.ripples.push(new Ripple(x, y, size, this, this.ripples.length));
  }

  getClosestFood(x, y) {
    if (this.foods.length === 0) return null;
    let closest = this.foods[0];
    for (let i = 1; i < this.foods.length; i++) {
      if (this.foods[i].getDistance(x, y) < closest.getDistance(x, y)) {
        closest = this.foods[i];
      }
    }
    return closest;
  }

  getSpot() {
    return this.spots[Math.floor(Math.random() * this.spots.length)];
  }

  bite(x, y, radius, fish) {
    for (let i = 0; i < this.foods.length; i++) {
      if (this.foods[i].getDistance(x, y) < radius + 10) {
        this.foods[i].eaten(fish);
        this.foods.splice(i, 1);
        i--;
      }
    }
    if (fish.target && fish.target.value === 0) {
      for (let spot of this.spots) {
        if (spot.getDistance(x, y) < 200) {
          spot.eaten(fish);
        }
      }
    }
  }
}

module.exports = FishPond;
