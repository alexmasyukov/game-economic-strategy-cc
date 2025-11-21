// Import dependencies
import Phaser from 'phaser';
import EasyStar from 'easystarjs';

// Make them globally available (для совместимости с существующим кодом)
window.Phaser = Phaser;
window.EasyStar = EasyStar;

// Import all game files
import './config/Constants.js';
import './config/GameConfig.js';

import './managers/GridManager.js';
import './managers/PathfindingManager.js';
import './managers/ResourceManager.js';
import './managers/BuildingManager.js';
import './managers/WorkerManager.js';
import './managers/PlacementManager.js';
import './managers/UIManager.js';

import './entities/Building.js';
import './entities/ProductionBuilding.js';
import './entities/BuildingGhost.js';
import './entities/buildings/Castle.js';
import './entities/buildings/Storage.js';
import './entities/buildings/Campfire.js';
import './entities/buildings/Greenhouse.js';
import './entities/buildings/GardenBed.js';
import './entities/Worker.js';

import './scenes/GameScene.js';

import './main.js';
