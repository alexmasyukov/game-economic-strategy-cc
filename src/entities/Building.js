import { CONSTANTS } from '../config/Constants.js';

/**
 * Building - базовый класс для всех зданий
 * Содержит общие свойства и логику, которая есть у каждого здания
 */
export class Building {
    constructor(scene, gridX, gridY, config) {
        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;

        // Базовые свойства здания (общие для всех типов зданий)
        this.width = config.width;      // Размер: ширина в клетках
        this.height = config.height;    // Размер: высота в клетках
        this.color = config.color;      // Цвет здания
        this.name = config.name;        // Название здания
        this.type = config.type;        // Тип здания

        // Occupy grid cells FIRST
        this.scene.gridManager.occupyArea(gridX, gridY, this.width, this.height);

        // Get top-left corner in world coordinates
        const topLeftWorld = this.scene.gridManager.gridToWorld(gridX, gridY);

        // Create visual representation (rectangle)
        this.graphics = this.scene.add.graphics();
        this.graphics.fillStyle(this.color, 1);
        this.graphics.fillRect(
            0,
            0,
            this.width * CONSTANTS.CELL_SIZE,
            this.height * CONSTANTS.CELL_SIZE
        );

        // Position at top-left corner (adjusting for cell center offset)
        this.graphics.x = topLeftWorld.x - CONSTANTS.CELL_SIZE / 2;
        this.graphics.y = topLeftWorld.y - CONSTANTS.CELL_SIZE / 2;

        // Update pathfinding grid
        this.scene.pathfindingManager.updateGrid();
    }

    getCenter() {
        const worldPos = this.scene.gridManager.gridToWorld(
            this.gridX + Math.floor(this.width / 2),
            this.gridY + Math.floor(this.height / 2)
        );
        return worldPos;
    }

    getPosition() {
        return { x: this.gridX, y: this.gridY };
    }

    destroy() {
        this.graphics.destroy();
        this.scene.gridManager.freeArea(this.gridX, this.gridY, this.width, this.height);
        this.scene.pathfindingManager.updateGrid();
    }

    update(deltaTime) {
        // Override in subclasses
    }
}
