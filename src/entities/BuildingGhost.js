import { CONSTANTS } from '../config/Constants.js';
export class BuildingGhost {
    constructor(scene, buildingType) {
        this.scene = scene;
        this.buildingType = buildingType;
        this.config = CONSTANTS.BUILDINGS[buildingType];

        this.width = this.config.width;
        this.height = this.config.height;
        this.color = this.config.color;

        this.gridX = 0;
        this.gridY = 0;
        this.isValid = false;

        // Create ghost graphics
        this.graphics = this.scene.add.graphics();
        this.graphics.setDepth(100);

        this.updatePosition(0, 0);
    }

    updatePosition(worldX, worldY) {
        // Convert world coordinates to grid
        const gridPos = this.scene.services.gridManager.worldToGrid(worldX, worldY);
        this.gridX = gridPos.x;
        this.gridY = gridPos.y;

        // Check if area is free
        this.isValid = this.scene.services.gridManager.isAreaFree(
            this.gridX,
            this.gridY,
            this.width,
            this.height
        );

        // Get world position for top-left corner
        const topLeftWorld = this.scene.services.gridManager.gridToWorld(this.gridX, this.gridY);

        // Update graphics
        this.graphics.clear();

        // Choose color based on validity
        const alpha = 0.5;
        if (this.isValid) {
            this.graphics.fillStyle(0x00FF00, alpha); // Green if valid
        } else {
            this.graphics.fillStyle(0xFF0000, alpha); // Red if invalid
        }

        // Draw rectangle
        this.graphics.fillRect(
            topLeftWorld.x - CONSTANTS.CELL_SIZE / 2,
            topLeftWorld.y - CONSTANTS.CELL_SIZE / 2,
            this.width * CONSTANTS.CELL_SIZE,
            this.height * CONSTANTS.CELL_SIZE
        );

        // Draw border
        this.graphics.lineStyle(2, this.isValid ? 0x00FF00 : 0xFF0000, 1);
        this.graphics.strokeRect(
            topLeftWorld.x - CONSTANTS.CELL_SIZE / 2,
            topLeftWorld.y - CONSTANTS.CELL_SIZE / 2,
            this.width * CONSTANTS.CELL_SIZE,
            this.height * CONSTANTS.CELL_SIZE
        );
    }

    getGridPosition() {
        return { x: this.gridX, y: this.gridY };
    }

    canPlace() {
        return this.isValid;
    }

    destroy() {
        this.graphics.destroy();
    }
}
