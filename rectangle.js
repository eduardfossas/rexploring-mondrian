const BODIES = Matter.Bodies;

class Rectangle {
  constructor(x, y, width, height, options) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.options = options;

    this.rect = BODIES.rectangle(
      this.x,
      this.y,
      this.width,
      this.height,
      this.options
    );
  }

  addRectangle() {}
}

export { Rectangle };
