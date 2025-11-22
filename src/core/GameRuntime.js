import { CONSTANTS } from '../config/Constants.js';
import { GridManager } from '../managers/GridManager.js';
import { PathfindingManager } from '../managers/PathfindingManager.js';
import { ResourceManager } from '../managers/ResourceManager.js';
import { BuildingManager } from '../managers/BuildingManager.js';
import { WorkerManager } from '../managers/WorkerManager.js';
import { PlacementManager } from '../managers/PlacementManager.js';
import { UIManager } from '../managers/UIManager.js';

/**
 * GameRuntime wires together all game systems and drives their lifecycle.
 * Acts as a lightweight service container for the active scene.
 */
export class GameRuntime {
    constructor(scene) {
        this.scene = scene;
        this.timeScale = 1;

        // Expose services on the scene for entities/managers that only receive the scene instance
        this.scene.services = this;

        // Core systems
        this.gridManager = new GridManager(scene);
        this.pathfindingManager = new PathfindingManager(this.gridManager);
        this.resourceManager = new ResourceManager();
        this.buildingManager = new BuildingManager(scene);
        this.workerManager = new WorkerManager(scene);
        this.placementManager = new PlacementManager(scene);
        this.uiManager = new UIManager(scene);
    }

    /**
        * Create initial world state (castle, storage, campfire, initial workers).
        * Returns references to key buildings for camera centering or other uses.
        */
    bootstrapWorld() {
        const centerX = Math.floor(CONSTANTS.GRID_SIZE / 2);
        const centerY = Math.floor(CONSTANTS.GRID_SIZE / 2);

        // Create castle in the center
        const castleWidth = CONSTANTS.BUILDINGS.CASTLE.width;
        const castleHeight = CONSTANTS.BUILDINGS.CASTLE.height;
        const castleX = centerX - Math.floor(castleWidth / 2);
        const castleY = centerY - Math.floor(castleHeight / 2);
        const castle = this.buildingManager.createCastle(castleX, castleY);

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

        return { castle, campfire };
    }

    setTimeScale(multiplier) {
        this.timeScale = multiplier;
    }

    update(delta) {
        const scaledDelta = delta * this.timeScale;
        this.buildingManager.update(scaledDelta);
        this.workerManager.update(scaledDelta);
    }
}
