import { Rectangle } from "./rectangle.js";

const BACK_COLOR = "#FFF";
const STICK_COLOR = "#faf0e6";
const STICKS_COLORS = ["#F1F1F1", "#FBCE08", "#FBCE08", "#241644", "#DC1C06"];
let perlin = {
  rand_vect: function () {
    let theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  },
  dot_prod_grid: function (x, y, vx, vy) {
    let g_vect;
    let d_vect = { x: x - vx, y: y - vy };
    if (this.gradients[[vx, vy]]) {
      g_vect = this.gradients[[vx, vy]];
    } else {
      g_vect = this.rand_vect();
      this.gradients[[vx, vy]] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  },
  smootherstep: function (x) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  },
  interp: function (x, a, b) {
    return a + this.smootherstep(x) * (b - a);
  },
  seed: function () {
    this.gradients = {};
    this.memory = {};
  },
  get: function (x, y) {
    if (this.memory.hasOwnProperty([x, y])) return this.memory[[x, y]];
    let xf = Math.floor(x);
    let yf = Math.floor(y);
    //interpolate
    let tl = this.dot_prod_grid(x, y, xf, yf);
    let tr = this.dot_prod_grid(x, y, xf + 1, yf);
    let bl = this.dot_prod_grid(x, y, xf, yf + 1);
    let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
    let xt = this.interp(x - xf, tl, tr);
    let xb = this.interp(x - xf, bl, br);
    let v = this.interp(y - yf, xt, xb);
    this.memory[[x, y]] = v;
    return v;
  },
};
perlin.seed();

class App {
  constructor() {
    this.canvas = {
      el: document.querySelector("canvas"),
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.matter = {
      composites: Matter.Composites,
      composite: Matter.Composite,
      engine: Matter.Engine,
      render: Matter.Render,
      runner: Matter.Runner,
      mouseConstraint: Matter.MouseConstraint,
      mouse: Matter.Mouse,
      bounds: Matter.Bounds,
    };
    this.engine = this.matter.engine.create({ gravity: { scale: 0, y: 0 } });
    this.world = this.engine.world;
    this.render = this.matter.render.create({
      element: document.body,
      engine: this.engine,
      options: {
        width: this.canvas.width,
        height: this.canvas.height,
        showStats: false,
        showPerformance: false,
        wireframes: false,
        background: BACK_COLOR,
      },
    });

    console.log(Math.round(perlin.rand_vect().x * 4));

    this.stick = {
      width: 50,
      height: 100,
      margin: 50,
    };
    this.addResize();
    this.addBlock();
    this.renderWorld();
    this.createMouseEvent();

    this.runner = this.matter.runner.create();
    this.matter.runner.run(this.runner, this.engine);
  }

  addBlock() {
    const w = (this.canvas.width / 20) * 4;
    if (this.canvas.width < this.canvas.height) {
      this.block = this.matter.composites.stack(
        this.canvas.width / 10,
        this.canvas.width / 2,
        8,
        8,
        0,
        0,
        (x, y) => {
          return new Rectangle(
            x,
            y,
            this.canvas.width / 10,
            this.canvas.width / 10
          ).rect;
        }
      );
    } else {
      this.block = this.matter.composites.stack(
        this.canvas.width / 2 - w,
        this.canvas.height / 2 - w,
        8,
        8,
        0,
        0,
        (x, y) => {
          return new Rectangle(
            x,
            y,
            this.canvas.width / 20,
            this.canvas.width / 20,
            {}
          ).rect;
        }
      );
    }

    this.matter.composite.add(this.world, [
      this.block, // walls
      new Rectangle(this.canvas.width / 2, 0, this.canvas.width, 10, {
        isStatic: true,
        render: { opacity: 0 },
      }).rect,
      new Rectangle(
        this.canvas.width / 2,
        this.canvas.height,
        this.canvas.width,
        10,
        {
          isStatic: true,
          render: { opacity: 0 },
        }
      ).rect,
      new Rectangle(0, this.canvas.height / 2, 10, this.canvas.height, {
        isStatic: true,
        render: { opacity: 0 },
      }).rect,
      new Rectangle(
        this.canvas.width,
        this.canvas.height / 2,
        10,
        this.canvas.height,
        {
          isStatic: true,
          render: { opacity: 0 },
        }
      ).rect,
    ]);
  }

  addRectangles() {
    this.context.fillStyle = STICK_COLOR;

    for (let u = 0; u < 25; u++) {
      const margin = this.stick.width + this.stick.margin * u;
      for (let v = 0; v < 5; v++) {
        const marginY = 100 * v;
        this.context.fillRect(
          this.canvas.el.width / 2 - 600 + margin,
          this.canvas.el.height / 2 - 300 + marginY,
          10,
          100
        );
      }
    }
  }

  createMouseEvent() {
    this.mouse = this.matter.mouse.create(this.render.canvas);
    this.mouseConstraint = this.matter.mouseConstraint.create(this.engine, {
      mouse: this.mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    this.matter.composite.add(this.world, this.mouseConstraint);
  }

  setSize() {
    this.render.bounds.max.x = window.innerWidth;
    this.render.bounds.max.y = window.innerHeight;
    this.render.options.width = window.innerWidth;
    this.render.options.height = window.innerHeight;
    this.render.canvas.width = window.innerWidth;
    this.render.canvas.height = window.innerHeight;
  }

  addResize() {
    this.setSize();
    window.addEventListener("resize", () => this.setSize());
  }

  renderWorld() {
    this.matter.render.run(this.render);
  }
}

new App();
