class Greenhouse extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.GREENHOUSE,
            type: CONSTANTS.BUILDING_TYPES.GREENHOUSE
        };
        super(scene, gridX, gridY, config);

        this.productionTime = config.productionTime;
        this.resourceType = config.resourceType;
        this.currentProductionTime = 0;
        this.isProducing = false;
        this.assignedWorker = null;
        this.resourceReady = false;
    }

    assignWorker(worker) {
        this.assignedWorker = worker;
    }

    startProduction() {
        if (!this.isProducing && !this.resourceReady) {
            this.isProducing = true;
            this.currentProductionTime = 0;
        }
    }

    update(deltaTime) {
        if (this.isProducing) {
            this.currentProductionTime += deltaTime;

            if (this.currentProductionTime >= this.productionTime) {
                this.isProducing = false;
                this.resourceReady = true;
                this.currentProductionTime = 0;
            }
        }
    }

    hasResourceReady() {
        return this.resourceReady;
    }

    collectResource() {
        if (this.resourceReady) {
            this.resourceReady = false;
            return this.resourceType;
        }
        return null;
    }

    getProductionProgress() {
        if (!this.isProducing) return 0;
        return this.currentProductionTime / this.productionTime;
    }
}
