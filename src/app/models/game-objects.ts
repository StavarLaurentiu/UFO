export class UFO {
  private _verticalPosition: number;
  private _horizontalPosition: number;
  private _direction: number;
  private width: number = 100;
  private height: number = 100;
  private pidLaunch: number | null = null;
  private isHit: boolean = false;

  constructor(
    public number: number,
    private ctx: CanvasRenderingContext2D,
    private image: HTMLImageElement,
    private explosionImage: HTMLImageElement,
    private horizontalStep: number = 10
  ) {
    this._verticalPosition = number * 100 - 50;
    this._horizontalPosition = 0;
    this._direction = Math.random() > 0.5 ? 1 : 0;
  }

  get verticalPosition(): number {
    return this._verticalPosition;
  }

  get horizontalPosition(): number {
    return this._horizontalPosition;
  }

  get direction(): number {
    return this._direction;
  }

  set direction(newDirection: number) {
    this._direction = newDirection;
  }

  move() {
    const gameWidth = this.ctx.canvas.width;
    if (this.direction === 1) {
      if (
        this.horizontalPosition + this.horizontalStep + this.width <
        gameWidth
      ) {
        this._horizontalPosition += this.horizontalStep;
      } else {
        this.direction = 0;
      }
    } else {
      if (this.horizontalPosition - this.horizontalStep > 0) {
        this._horizontalPosition -= this.horizontalStep;
      } else {
        this.direction = 1;
      }
    }
  }

  draw() {
    this.ctx.drawImage(
      this.isHit ? this.explosionImage : this.image,
      this._horizontalPosition,
      this._verticalPosition,
      this.width,
      this.height
    );
  }

  launch() {
    this._horizontalPosition = Math.floor(Math.random() * 10) * 120 + 10;
    this.isHit = false;
    this.pidLaunch = window.setInterval(() => {
      this.move();
    }, 25);
  }

  stop() {
    if (this.pidLaunch) {
      clearInterval(this.pidLaunch);
      this.pidLaunch = null;
    }
  }

  hit() {
    this.isHit = true;
    setTimeout(() => {
      this.isHit = false;
    }, 1000);
  }

  checkCollision(missile: Missile): boolean {
    if (this.isHit) return false;

    return (
      missile.horizontalPosition + missile.width > this._horizontalPosition &&
      missile.horizontalPosition < this._horizontalPosition + this.width &&
      missile.verticalPosition + missile.height > this._verticalPosition &&
      missile.verticalPosition < this._verticalPosition + this.height
    );
  }
}

export class Missile {
  private _verticalPosition: number;
  private _horizontalPosition: number;
  private _width: number = 60;
  private _height: number = 80;
  private pulled: boolean = false;
  private launchPid: number | null = null;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private image: HTMLImageElement,
    private horizontalStep: number = 10,
    private verticalStep: number = 5
  ) {
    this._verticalPosition = ctx.canvas.height - this.height - 10;
    this._horizontalPosition = ctx.canvas.width / 2;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get verticalPosition(): number {
    return this._verticalPosition;
  }

  get horizontalPosition(): number {
    return this._horizontalPosition;
  }

  set horizontalPosition(value: number) {
    this._horizontalPosition = value;
  }

  draw() {
    this.ctx.drawImage(
      this.image,
      this._horizontalPosition,
      this._verticalPosition,
      this.width,
      this.height
    );
  }

  moveLeft() {
    if (this._horizontalPosition - this.horizontalStep > 0) {
      this._horizontalPosition -= this.horizontalStep;
    }
  }

  moveRight() {
    if (
      this._horizontalPosition + this.width + this.horizontalStep <
      this.ctx.canvas.width
    ) {
      this._horizontalPosition += this.horizontalStep;
    }
  }

  launch() {
    if (this.pulled) return;

    this.pulled = true;
    this.launchPid = window.setInterval(() => {
      // Check if missile goes off screen
      if (this._verticalPosition <= 0) {
        this.reset();
        return -1; // Missed
      }
      this._verticalPosition -= this.verticalStep;
      return 0; // Continue moving
    }, 10);
  }

  reset() {
    if (this.launchPid) {
      clearInterval(this.launchPid);
      this.launchPid = null;
    }
    this.pulled = false;
    this._verticalPosition = this.ctx.canvas.height - this.height - 10;
  }

  isPulled(): boolean {
    return this.pulled;
  }
}
