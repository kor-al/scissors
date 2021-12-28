const tracks = [
  "M 9 357 C 198 237 237 -66 283 109 c 7 52 3 232 122 212 c 58 2 25 -225 154 -256 c 86 -4 -70 232 5 273 c 52 22 27 -132 108 -117 c 61 29 -58 123 -121 34 Q 425 48 941 205",
  "M 29.928125,119.32884 C 59.868756,78.85387 99.789596,30.283895 138.66049,30.104515 c 80.46172,-0.37133 90.87185,137.794285 140.7729,129.699295 40.35037,-6.54568 49.90105,-80.94994 86.53937,-78.86548 33.24073,1.89117 22.2547,70.77048 73.14399,70.77048 39.92084,0 58.65264,-56.66496 99.80211,-56.66496 49.90105,0 69.86147,80.94995 99.8021,48.56997",
];

const toDeg = (x) => {
  return (x * 360) / (2 * Math.PI);
};

function pathDir(path, u) {
  var length = u * path.getTotalLength();
  var pt14 = path.getPointAtLength(length - 0.1);
  var pt34 = path.getPointAtLength(length);
  var angle = Math.atan2(pt14.y - pt34.y, pt14.x - pt34.x);
  return toDeg(angle);
}

// https://potatodie.nl/diffuse-write-ups/move-a-dot-along-a-path/
const slider = {
  sprite: null,
  track: null,
  curPosition: 0,

  // Initialize the dot: connect sprite and track properties with supplied SVG elements
  init: function (sprite, track) {
    this.curPosition = 0
    this.sprite = document.getElementById(sprite);
    this.track = document.getElementById(track);
  },

  // Put the object on its spot
  move: function (u) {
      const p = this.track.getPointAtLength(u * this.track.getTotalLength());
    const angle = pathDir(this.track, u);
    this.sprite.setAttribute(
      "transform",
      `translate(${p.x}, ${p.y}) rotate(${angle + 180})`
    );
    this.curPosition = u
  },

  remove: function(){
      this.sprite.remove();
      this.track.remove()
  }
};

const changePath = (pathElement, i) => {
  pathElement.setAttribute("d", tracks[i]);
};


export function initLoading() {
    slider.init("slider", "curve");
    changePath(slider.track, 0);
    return slider
} 

export function loading(slider, percent) {
    // slider.move(u);
    // smoothMove(slider)
    loadingMove(slider, percent)
}


function loadingMove(slider, targetPosition){
    let u = slider.curPosition
    var interval = setInterval(function () {
        if (u >=targetPosition) {
          clearInterval(interval);
        }
        u = u + 0.01;
        slider.move(u);
        slider.track.style.strokeDasharray = `${u} ${1 - u}`;
        slider.track.style.stroke = "#fff";

      }, 50);


}