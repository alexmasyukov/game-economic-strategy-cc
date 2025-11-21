import { gameConfig } from './config/GameConfig.js';
import { GameScene } from './scenes/GameScene.js';

// Initialize game configuration
gameConfig.scene = GameScene;

// Create game instance
const game = new Phaser.Game(gameConfig);
