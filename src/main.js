import Phaser from 'phaser';
import { gameConfig } from './config/GameConfig.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    ...gameConfig,
    scene: GameScene
};

export default new Phaser.Game(config);
