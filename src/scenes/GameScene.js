import { CONSTANTS } from '../config/Constants.js';
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameSpeed = 1;
    }

    create() {
        // Initialize managers
        this.gridManager = new GridManager(this);
        this.pathfindingManager = new PathfindingManager(this.gridManager);
        this.resourceManager = new ResourceManager();
        this.buildingManager = new BuildingManager(this);
        this.workerManager = new WorkerManager(this);
        this.placementManager = new PlacementManager(this);
        this.uiManager = new UIManager(this);

        // Setup camera
        const worldWidth = CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE;
        const worldHeight = CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE;
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Setup keyboard controls (WASD)
        this.cursors = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Setup initial buildings and workers
        this.setupInitialState();

        // Center camera on castle
        const castle = this.buildingManager.getCastle();
        if (castle) {
            const castleCenter = castle.getCenter();
            this.cameras.main.centerOn(castleCenter.x, castleCenter.y);
        }
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    setupInitialState() {
        const centerX = Math.floor(CONSTANTS.GRID_SIZE / 2);
        const centerY = Math.floor(CONSTANTS.GRID_SIZE / 2);

        // Create castle in the center
        const castleWidth = CONSTANTS.BUILDINGS.CASTLE.width;
        const castleHeight = CONSTANTS.BUILDINGS.CASTLE.height;
        const castleX = centerX - Math.floor(castleWidth / 2);
        const castleY = centerY - Math.floor(castleHeight / 2);
        this.buildingManager.createCastle(castleX, castleY);

        // Create storage next to castle
        const storageX = castleX + castleWidth + 2;
        const storageY = castleY;
        this.buildingManager.createStorage(storageX, storageY);

        // Create campfire
        const campfireX = castleX - CONSTANTS.BUILDINGS.CAMPFIRE.width - 2;
        const campfireY = castleY;
        const campfire = this.buildingManager.createCampfire(campfireX, campfireY);

        // Create workers near campfire
        const campfireCenter = campfire.getCenter();
        this.workerManager.createWorkers(
            CONSTANTS.INITIAL_WORKERS,
            campfireCenter.x,
            campfireCenter.y
        );
    }

    update(time, delta) {
        // Camera movement (WASD)
        const cameraSpeed = CONSTANTS.CAMERA_SPEED * (delta / 1000);

        if (this.cursors.w.isDown) {
            this.cameras.main.scrollY -= cameraSpeed;
        }
        if (this.cursors.s.isDown) {
            this.cameras.main.scrollY += cameraSpeed;
        }
        if (this.cursors.a.isDown) {
            this.cameras.main.scrollX -= cameraSpeed;
        }
        if (this.cursors.d.isDown) {
            this.cameras.main.scrollX += cameraSpeed;
        }

        // Apply game speed multiplier
        const adjustedDelta = delta * this.gameSpeed;

        // Update all managers with adjusted delta
        this.buildingManager.update(adjustedDelta);
        this.workerManager.update(adjustedDelta);
    }
}
