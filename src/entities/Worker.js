import { CONSTANTS } from '../config/Constants.js';
import { WorkerStateMachine } from '../core/WorkerStateMachine.js';
export class Worker {
    constructor(scene, x, y) {
        this.scene = scene;
        this.services = scene.services;
        this.x = x;
        this.y = y;

        this.stateMachine = new WorkerStateMachine({
            goToBuilding: () => this.moveToBuilding(),
            startProduction: () => this.startProduction(),
            collectAndGoToStorage: () => this.collectAndGoToStorage(),
            deliverResource: () => this.deliverResource(),
            storageHasSpace: () => this.hasStorageSpace()
        });

        this.state = this.stateMachine.getState();
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
        this.stateMachine.send({ type: 'ASSIGN' });
        this.state = this.stateMachine.getState();
    }

    moveToStorage() {
        this.currentPath = null;
        this.currentPathIndex = 0;
        const storage = this.services.buildingManager.getStorage();
        if (storage) {
            this.services.pathfindingManager.findPathToBuilding(
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
        this.currentPath = null;
        this.currentPathIndex = 0;
        if (this.assignedBuilding) {
            this.services.pathfindingManager.findPathToBuilding(
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
        this.state = this.stateMachine.getState();

        if (this.state === CONSTANTS.WORKER_STATES.PRODUCING) {
            if (this.assignedBuilding?.hasResourceReady?.()) {
                this.stateMachine.send({ type: 'RESOURCE_READY' });
                this.state = this.stateMachine.getState();
            }
        }

        if (this.state === CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE ||
            this.state === CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING) {
            this.followPath(deltaTime);
        }

        if (this.state === CONSTANTS.WORKER_STATES.WAITING_FOR_STORAGE) {
            const storage = this.services.buildingManager.getStorage();
            if (storage && storage.hasSpace()) {
                this.stateMachine.send({ type: 'STORAGE_SPACE' });
                this.state = this.stateMachine.getState();
            }
        }

        this.updateGraphics();
    }

    followPath(deltaTime) {
        // Wait for path to be resolved; don't trigger completion early
        if (!this.currentPath) {
            return;
        }
        if (this.currentPath.length === 0) {
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

        this.stateMachine.send({ type: 'ARRIVED' });
        this.state = this.stateMachine.getState();
    }

    isIdle() {
        return this.state === CONSTANTS.WORKER_STATES.IDLE;
    }

    destroy() {
        this.graphics.destroy();
        this.pathGraphics.destroy();
    }

    startProduction() {
        this.currentPath = null;
        if (this.assignedBuilding?.startProduction) {
            this.assignedBuilding.startProduction();
        }
    }

    collectAndGoToStorage() {
        if (this.assignedBuilding?.collectResource) {
            this.carryingResource = this.assignedBuilding.collectResource();
        }
        this.moveToStorage();
    }

    deliverResource() {
        const storage = this.services.buildingManager.getStorage();
        if (storage && this.carryingResource) {
            const success = storage.receiveResource(this.carryingResource);
            if (success) {
                this.carryingResource = null;
            }
        }
    }

    hasStorageSpace() {
        const storage = this.services.buildingManager.getStorage();
        return storage ? storage.hasSpace() : false;
    }
}
