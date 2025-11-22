import Phaser from 'phaser';
import { CONSTANTS } from '../config/Constants.js';
import { GameRuntime } from '../core/GameRuntime.js';
import { GameStateMachine, GAME_STATES } from '../core/GameStateMachine.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameSpeed = 1;
    }

    create() {
        this.gameStateMachine = new GameStateMachine({
            onStart: () => this.handleStart(),
            onLoaded: () => this.handleLoaded(),
            onPause: () => this.handlePause(),
            onResume: () => this.handleResume()
        });

        // Wire all systems through a single runtime container
        this.runtime = new GameRuntime(this);

        this.setupCamera();
        this.setupKeyboard();

        // Start game flow
        this.gameStateMachine.send({ type: 'START' });
        // Simulate immediate load complete for now
        this.gameStateMachine.send({ type: 'LOADED' });
    }

    setupCamera() {
        const worldWidth = CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE;
        const worldHeight = CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE;
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    }

    setupKeyboard() {
        this.cursors = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
        this.runtime.setTimeScale(speed);
    }

    update(time, delta) {
        const state = this.gameStateMachine.getState();

        if (state === GAME_STATES.PLAYING) {
            this.handleCameraMovement(delta);
            this.runtime.update(delta);
        }
    }

    handleCameraMovement(delta) {
        const cameraSpeed = CONSTANTS.CAMERA_SPEED * (delta / 1000);

        if (this.cursors?.w.isDown) {
            this.cameras.main.scrollY -= cameraSpeed;
        }
        if (this.cursors?.s.isDown) {
            this.cameras.main.scrollY += cameraSpeed;
        }
        if (this.cursors?.a.isDown) {
            this.cameras.main.scrollX -= cameraSpeed;
        }
        if (this.cursors?.d.isDown) {
            this.cameras.main.scrollX += cameraSpeed;
        }
    }

    handleStart() {
        // Placeholder for menu → loading transition hook
    }

    handleLoaded() {
        const { castle } = this.runtime.bootstrapWorld();
        if (castle) {
            const castleCenter = castle.getCenter();
            this.cameras.main.centerOn(castleCenter.x, castleCenter.y);
        }
    }

    handlePause() {
        this.runtime.setTimeScale(0);
    }

    handleResume() {
        this.runtime.setTimeScale(this.gameSpeed);
    }
}
