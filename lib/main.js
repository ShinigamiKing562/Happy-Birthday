const FishPond = require("./fish_pond.js");
const Lotus = require("./lotus.js");


const canvas = document.getElementsByTagName("canvas")[0];
let pond = new FishPond(window);

function clickCanvas(e) {
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;
  pond.click(x, y);
}

canvas.addEventListener("click", clickCanvas);
pond.start(canvas);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (pond && typeof pond.start === "function") {
    pond.width = window.innerWidth;
    pond.height = window.innerHeight;
    pond.vw = pond.width / 100;
    pond.vh = pond.height / 100;

    // Refresh the lotus grid
    const spellPoints = pond.getLetterLotusPositions();
    pond.lotuses = []; // Clear old lotuses

    for (let pt of spellPoints) {
      const imgIndex = Math.floor(Math.random() * 3);
      const image = [
        pond.lotusImages.small,
        pond.lotusImages.medium,
        pond.lotusImages.large,
      ][imgIndex];
      const size = pond.vw * 10 + Math.random() * pond.vw * 6;

      const lotus = new Lotus(pt.x, pt.y, size, image, pond);
      lotus.x = pt.x;
      lotus.y = pt.y;
      lotus.baseY = pt.y;
      lotus.xInit = pt.x;
      lotus.yInit = pt.y;
      lotus.targetX = pt.x;
      lotus.targetY = pt.y;

      pond.lotuses.push(lotus);
    }
  }
});
