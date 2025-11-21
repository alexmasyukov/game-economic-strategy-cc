class BuildingManager {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.castle = null;
        this.storage = null;
        this.campfire = null;
    }

    addBuilding(building) {
        this.buildings.push(building);

        // Track special buildings
        if (building.type === CONSTANTS.BUILDING_TYPES.CASTLE) {
            this.castle = building;
        } else if (building.type === CONSTANTS.BUILDING_TYPES.STORAGE) {
            this.storage = building;
        } else if (building.type === CONSTANTS.BUILDING_TYPES.CAMPFIRE) {
            this.campfire = building;
        }

        return building;
    }

    removeBuilding(building) {
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
            building.destroy();
        }
    }

    createCastle(gridX, gridY) {
        const castle = new Castle(this.scene, gridX, gridY);
        return this.addBuilding(castle);
    }

    createStorage(gridX, gridY) {
        const storage = new Storage(this.scene, gridX, gridY);
        return this.addBuilding(storage);
    }

    createCampfire(gridX, gridY) {
        const campfire = new Campfire(this.scene, gridX, gridY);
        return this.addBuilding(campfire);
    }

    createGreenhouse(gridX, gridY) {
        const greenhouse = new Greenhouse(this.scene, gridX, gridY);
        this.addBuilding(greenhouse);

        // Auto-assign a free worker
        this.scene.workerManager.assignWorkerToBuilding(greenhouse);

        // Update UI worker count
        this.scene.uiManager.updateWorkerCount();

        return greenhouse;
    }

    createGardenBed(gridX, gridY) {
        const gardenBed = new GardenBed(this.scene, gridX, gridY);
        this.addBuilding(gardenBed);

        // Auto-assign a free worker
        this.scene.workerManager.assignWorkerToBuilding(gardenBed);

        // Update UI worker count
        this.scene.uiManager.updateWorkerCount();

        return gardenBed;
    }

    update(deltaTime) {
        this.buildings.forEach(building => {
            if (building.update) {
                building.update(deltaTime);
            }
        });
    }

    getStorage() {
        return this.storage;
    }

    getCastle() {
        return this.castle;
    }

    getCampfire() {
        return this.campfire;
    }

    getBuildings() {
        return this.buildings;
    }
}
