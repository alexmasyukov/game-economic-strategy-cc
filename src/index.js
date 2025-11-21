// Import dependencies
import Phaser from 'phaser';
import EasyStar from 'easystarjs';

// Make them globally available (для совместимости с существующим кодом)
window.Phaser = Phaser;
window.EasyStar = EasyStar;

// Import and expose game config
import { CONSTANTS } from './config/Constants.js';
import { gameConfig } from './config/GameConfig.js';
window.CONSTANTS = CONSTANTS;
window.gameConfig = gameConfig;

// Import managers
import { GridManager } from './managers/GridManager.js';
import { PathfindingManager } from './managers/PathfindingManager.js';
import { ResourceManager } from './managers/ResourceManager.js';
import { BuildingManager } from './managers/BuildingManager.js';
import { WorkerManager } from './managers/WorkerManager.js';
import { PlacementManager } from './managers/PlacementManager.js';
import { UIManager } from './managers/UIManager.js';

window.GridManager = GridManager;
window.PathfindingManager = PathfindingManager;
window.ResourceManager = ResourceManager;
window.BuildingManager = BuildingManager;
window.WorkerManager = WorkerManager;
window.PlacementManager = PlacementManager;
window.UIManager = UIManager;

// Import entities
import { Building } from './entities/Building.js';
import { ProductionBuilding } from './entities/ProductionBuilding.js';
import { BuildingGhost } from './entities/BuildingGhost.js';
import { Castle } from './entities/buildings/Castle.js';
import { Storage } from './entities/buildings/Storage.js';
import { Campfire } from './entities/buildings/Campfire.js';
import { Greenhouse } from './entities/buildings/Greenhouse.js';
import { GardenBed } from './entities/buildings/GardenBed.js';
import { Worker } from './entities/Worker.js';

window.Building = Building;
window.ProductionBuilding = ProductionBuilding;
window.BuildingGhost = BuildingGhost;
window.Castle = Castle;
window.Storage = Storage;
window.Campfire = Campfire;
window.Greenhouse = Greenhouse;
window.GardenBed = GardenBed;
window.Worker = Worker;

// Import scenes
import { GameScene } from './scenes/GameScene.js';
window.GameScene = GameScene;

// Import main
import './main.js';
