import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { UFO, Missile } from '../../models/game-objects';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) 
  private canvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private missile!: Missile;
  private ufos: UFO[] = [];
  private gameLoop: number | null = null;
  private timerInterval: number | null = null;

  // Game assets
  private missileImage = new Image();
  private ufoImage = new Image();
  private explosionImage = new Image();
  private gameMusic = new Audio();
  private rocketLaunchSound = new Audio();
  private explosionSound = new Audio();

  // Game state
  score: number = 0;
  timeLeft: number = 60;
  showEndGameModal: boolean = false;
  finalScore: number = 0;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {
    // Load game preferences
    const preferences = this.gameService.loadGamePreferences();
    this.timeLeft = preferences.timeCount;
  }

  ngOnInit(): void {
    this.initializeCanvas();
    this.loadAssets().then(() => {
      this.startGame();
    });
  }

  private initializeCanvas() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.canvas.nativeElement.width = 1400;
    this.canvas.nativeElement.height = 700;
  }

  private async loadAssets() {
    // Load images
    this.missileImage.src = 'assets/images/rocket.png';
    this.ufoImage.src = 'assets/images/ufo.png';
    this.explosionImage.src = 'assets/images/explosion.gif';

    // Load audio
    this.gameMusic.src = 'assets/sounds/game_music.mp3';
    this.rocketLaunchSound.src = 'assets/sounds/rocket_launch.mp3';
    this.explosionSound.src = 'assets/sounds/explosion.mp3';

    // Setup game music
    this.gameMusic.loop = true;
    this.gameMusic.volume = 0.3;

    // Wait for images to load
    await Promise.all([
      new Promise(resolve => this.missileImage.onload = resolve),
      new Promise(resolve => this.ufoImage.onload = resolve),
      new Promise(resolve => this.explosionImage.onload = resolve)
    ]);
  }

  private startGame() {
    const preferences = this.gameService.loadGamePreferences();
    this.initializeMissile();
    this.initializeUFOs(preferences.ufoCount);
    this.startTimer();
    this.startGameLoop();
    this.setupControls();
    this.gameMusic.play();
  }

  private initializeMissile() {
    this.missile = new Missile(this.ctx, this.missileImage);
  }

  private initializeUFOs(count: number) {
    const usedPositions = new Set<number>();
    
    for (let i = 0; i < count; i++) {
      let position = Math.floor(Math.random() * 5) + 1;
      while (usedPositions.has(position)) {
        position = (position % 5) + 1;
      }
      usedPositions.add(position);

      const ufo = new UFO(position, this.ctx, this.ufoImage, this.explosionImage);
      this.ufos.push(ufo);
      ufo.launch();
    }
  }

  private startTimer() {
    this.timerInterval = window.setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  private startGameLoop() {
    this.gameLoop = window.requestAnimationFrame(() => this.update());
  }

  private update() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    // Draw missile
    this.missile.draw();

    // Draw UFOs and check collisions
    this.ufos.forEach(ufo => {
      ufo.draw();
      if (this.missile.isPulled() && ufo.checkCollision(this.missile)) {
        this.handleCollision(ufo);
      }
    });

    // Continue game loop
    if (!this.showEndGameModal) {
      this.gameLoop = window.requestAnimationFrame(() => this.update());
    }
  }

  private handleCollision(ufo: UFO) {
    this.rocketLaunchSound.pause();
    this.rocketLaunchSound.currentTime = 0;
    this.explosionSound.play();

    this.score += 100;
    ufo.hit();
    this.missile.reset();

    ufo.stop();
    setTimeout(() => {
      ufo.launch();
    }, 1000);
  }

  private setupControls() {
    document.addEventListener('keydown', (event) => {
      if (this.showEndGameModal) return;

      switch (event.key) {
        case 'ArrowLeft':
          if (!this.missile.isPulled()) {
            this.missile.moveLeft();
          }
          break;
        case 'ArrowRight':
          if (!this.missile.isPulled()) {
            this.missile.moveRight();
          }
          break;
        case ' ':
          if (!this.missile.isPulled()) {
            this.rocketLaunchSound.play();
            this.missile.launch();
          }
          break;
      }
    });
  }

  private endGame() {
    // Stop all game loops and intervals
    if (this.gameLoop) {
      window.cancelAnimationFrame(this.gameLoop);
      this.gameLoop = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Stop UFOs
    this.ufos.forEach(ufo => ufo.stop());

    // Calculate final score
    const preferences = this.gameService.loadGamePreferences();
    this.finalScore = this.gameService.calculateFinalScore(
      this.score,
      preferences.ufoCount,
      preferences.timeCount
    );

    // Show end game modal
    this.showEndGameModal = true;
    this.gameMusic.pause();
    this.gameMusic.currentTime = 0;
  }

  playAgain() {
    this.showEndGameModal = false;
    this.score = 0;
    const preferences = this.gameService.loadGamePreferences();
    this.timeLeft = preferences.timeCount;
    this.ufos = [];
    this.startGame();
  }

  redirectToHome() {
    this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    if (this.gameLoop) {
      window.cancelAnimationFrame(this.gameLoop);
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.ufos.forEach(ufo => ufo.stop());
    
    this.gameMusic.pause();
    this.gameMusic.currentTime = 0;
    
    document.removeEventListener('keydown', this.setupControls);
  }
}