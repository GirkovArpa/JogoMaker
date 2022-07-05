export class Position {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  isInside(box = new BoundingBox()) {
    return (
      this.x >= box.x1 &&
      this.x <= box.x2 &&
      this.y >= box.y1 &&
      this.y <= box.y2
    );
  }
}

export class Size {
  constructor(width = 0, height = 0) {
    this.width = width;
    this.height = height;
  }
}

export class BoundingBox {
  #position;
  #size;

  constructor(position = new Position(), size = new Size()) {
    this.#position = position;
    this.#size = size;
  }

  isColliding(other = new BoundingBox()) {
    if (this.x1 >= other.x2 || other.x1 >= this.x2) return false;
    if (this.y1 >= other.y2 || other.y1 >= this.y2) return false;
    return true;
  }

  toJSON() {
    const { x1, y1, x2, y2 } = this;
    return { x1, y1, x2, y2 };
  }

  get position() {
    const { x, y } = this.#position;
    return new Position(x, y);
  }

  get x() {
    return this.#position.x;
  }

  get y() {
    return this.#position.y;
  }

  get size() {
    const { width, height } = this.#size;
    return new Size(width, height);
  }

  get width() {
    return this.#size.width;
  }

  get height() {
    return this.#size.height;
  }

  get x1() {
    return this.#position.x;
  }

  get y1() {
    return this.#position.y;
  }

  get x2() {
    return this.#position.x + this.#size.width;
  }

  get y2() {
    return this.#position.y + this.#size.height;
  }
}

export class Velocity {
  #speed;
  #direction;

  constructor(speed = 0, direction = 0) {
    this.#speed = speed;
    this.#direction = direction;
  }

  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  static toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  get speed() {
    return this.#speed;
  }

  set speed(n) {
    this.#speed = n;
  }

  get direction() {
    return this.#direction;
  }

  set direction(degrees) {
    this.#direction = degrees;
  }

  get speedX() {
    return Math.cos(Velocity.toRadians(this.#direction)) * this.#speed;
  }

  set speedX(speedX) {
    const { speedY } = this;
    this.#direction = Velocity.toDegrees(Math.atan2(speedY, speedX));
    this.#speed = Math.sqrt(Math.pow(speedX, 2) + Math.pow(speedY, 2));
  }

  get speedY() {
    return Math.sin(Velocity.toRadians(this.#direction)) * this.#speed;
  }

  set speedY(speedY) {
    const { speedX } = this;
    this.#direction = Velocity.toDegrees(Math.atan2(speedY, speedX));
    this.#speed = Math.sqrt(Math.pow(speedX, 2) + Math.pow(speedY, 2));
  }
}

export default {
  Velocity,
  Position,
  Size,
  BoundingBox,
};
