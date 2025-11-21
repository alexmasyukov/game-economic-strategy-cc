class Worker {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // State machine
        this.state = CONSTANTS.WORKER_STATES.IDLE;
        this.assignedBuilding = null;
        this.carryingResource = null;
        this.currentPath = null;
        this.currentPathIndex = 0;
        this.speed = CONSTANTS.WORKER.speed;

        // Visual representation (circle)
        this.graphics = this.scene.add.graphics();

        // Path visualization
        this.pathGraphics = this.scene.add.graphics();
        this.pathGraphics.setDepth(-0.5);

        this.updateGraphics();
    }

    updateGraphics() {
        this.graphics.clear();
        this.graphics.fillStyle(CONSTANTS.WORKER.color, 1);
        this.graphics.fillCircle(this.x, this.y, CONSTANTS.WORKER.radius);

        // Show resource if carrying
        if (this.carryingResource) {
            this.graphics.fillStyle(0xFFFF00, 1);
            this.graphics.fillCircle(this.x, this.y - 5, 2);
        }

        // Draw path
        this.drawPath();
    }

    drawPath() {
        this.pathGraphics.clear();

        if (this.currentPath && this.currentPath.length > 0) {
            this.pathGraphics.lineStyle(2, CONSTANTS.WORKER.color, 0.3);

            // Draw line from current position
            this.pathGraphics.beginPath();
            this.pathGraphics.moveTo(this.x, this.y);

            // Draw to all remaining waypoints
            for (let i = this.currentPathIndex; i < this.currentPath.length; i++) {
                const point = this.currentPath[i];
                this.pathGraphics.lineTo(point.x, point.y);
            }

            this.pathGraphics.strokePath();
        }
    }

    assignToBuilding(building) {
        this.assignedBuilding = building;
        building.assignWorker(this);
        this.changeState(CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING);
    }

    changeState(newState) {
        this.state = newState;

        switch (newState) {
            case CONSTANTS.WORKER_STATES.IDLE:
                this.currentPath = null;
                break;

            case CONSTANTS.WORKER_STATES.PRODUCING:
                this.currentPath = null;
                if (this.assignedBuilding && this.assignedBuilding.startProduction) {
                    this.assignedBuilding.startProduction();
                }
                break;

            case CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE:
                this.moveToStorage();
                break;

            case CONSTANTS.WORKER_STATES.WAITING_FOR_STORAGE:
                // Стоит и ждет освобождения места на складе
                this.currentPath = null;
                break;

            case CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING:
                this.moveToBuilding();
                break;
        }
    }

    moveToStorage() {
        const storage = this.scene.buildingManager.getStorage();
        if (storage) {
            this.scene.pathfindingManager.findPathToBuilding(
                this.x,
                this.y,
                storage,
                (path) => {
                    if (path) {
                        this.currentPath = path;
                        this.currentPathIndex = 0;
                    }
                }
            );
        }
    }

    moveToBuilding() {
        if (this.assignedBuilding) {
            this.scene.pathfindingManager.findPathToBuilding(
                this.x,
                this.y,
                this.assignedBuilding,
                (path) => {
                    if (path) {
                        this.currentPath = path;
                        this.currentPathIndex = 0;
                    }
                }
            );
        }
    }

    update(deltaTime) {
        switch (this.state) {
            case CONSTANTS.WORKER_STATES.IDLE:
                // Do nothing
                break;

            case CONSTANTS.WORKER_STATES.PRODUCING:
                // Check if resource is ready
                if (this.assignedBuilding && this.assignedBuilding.hasResourceReady) {
                    if (this.assignedBuilding.hasResourceReady()) {
                        // Collect resource
                        this.carryingResource = this.assignedBuilding.collectResource();
                        this.changeState(CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE);
                    }
                }
                break;

            case CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE:
            case CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING:
                this.followPath(deltaTime);
                break;

            case CONSTANTS.WORKER_STATES.WAITING_FOR_STORAGE:
                // Периодически проверяем, появилось ли место на складе
                const storage = this.scene.buildingManager.getStorage();
                if (storage && storage.hasSpace()) {
                    // Место появилось! Доставляем ресурс
                    const success = storage.receiveResource(this.carryingResource);
                    if (success) {
                        this.carryingResource = null;
                        this.changeState(CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING);
                    }
                }
                break;
        }

        this.updateGraphics();
    }

    followPath(deltaTime) {
        if (!this.currentPath || this.currentPath.length === 0) {
            this.onPathComplete();
            return;
        }

        const target = this.currentPath[this.currentPathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
            // Reached current waypoint
            this.currentPathIndex++;

            if (this.currentPathIndex >= this.currentPath.length) {
                // Reached destination
                this.onPathComplete();
            }
        } else {
            // Move towards target
            const moveDistance = this.speed * (deltaTime / 1000);
            const ratio = moveDistance / distance;

            this.x += dx * ratio;
            this.y += dy * ratio;
        }
    }

    onPathComplete() {
        this.currentPath = null;
        this.currentPathIndex = 0;

        if (this.state === CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE) {
            // Arrived at storage
            const storage = this.scene.buildingManager.getStorage();
            if (storage && this.carryingResource) {
                // Проверяем, есть ли место на складе
                if (storage.hasSpace()) {
                    // Есть место - доставляем
                    const success = storage.receiveResource(this.carryingResource);
                    if (success) {
                        this.carryingResource = null;
                        this.changeState(CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING);
                    }
                } else {
                    // Склад полон - ждем
                    this.changeState(CONSTANTS.WORKER_STATES.WAITING_FOR_STORAGE);
                }
            }

        } else if (this.state === CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING) {
            // Arrived at building, start producing
            this.changeState(CONSTANTS.WORKER_STATES.PRODUCING);
        }
    }

    isIdle() {
        return this.state === CONSTANTS.WORKER_STATES.IDLE;
    }

    destroy() {
        this.graphics.destroy();
        this.pathGraphics.destroy();
    }
}
