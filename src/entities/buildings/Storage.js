import { Building } from '../Building.js';
import { CONSTANTS } from '../../config/Constants.js';
export class Storage extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.STORAGE,
            type: CONSTANTS.BUILDING_TYPES.STORAGE
        };
        super(scene, gridX, gridY, config);

        // Система вместимости
        this.maxCapacity = 200;              // Максимальная вместимость склада
        this.cellCapacity = 50;              // Вместимость одной клетки (200 / 4 = 50)
        this.currentAmount = 0;              // Текущее количество ресурсов

        // Графика для визуализации заполненности
        this.fillGraphics = this.scene.add.graphics();
        this.fillGraphics.setDepth(1); // Поверх основной графики склада

        this.updateVisuals();
    }

    hasSpace() {
        return this.currentAmount < this.maxCapacity;
    }

    getAvailableSpace() {
        return this.maxCapacity - this.currentAmount;
    }

    getFillPercentage() {
        return this.currentAmount / this.maxCapacity;
    }

    receiveResource(resourceType) {
        // Проверяем, есть ли место
        if (!this.hasSpace()) {
            return false;
        }

        this.currentAmount++;
        this.scene.resourceManager.addResource(resourceType, 1);
        this.updateVisuals();
        return true;
    }

    updateVisuals() {
        this.fillGraphics.clear();

        // Определяем позицию склада в мире
        const topLeftWorld = this.scene.gridManager.gridToWorld(this.gridX, this.gridY);
        const startX = topLeftWorld.x - CONSTANTS.CELL_SIZE / 2;
        const startY = topLeftWorld.y - CONSTANTS.CELL_SIZE / 2;

        // Заливаем клетки по очереди (2x2 склад)
        const cells = [
            { x: 0, y: 0 }, // Левая верхняя
            { x: 1, y: 0 }, // Правая верхняя
            { x: 0, y: 1 }, // Левая нижняя
            { x: 1, y: 1 }  // Правая нижняя
        ];

        cells.forEach((cell, index) => {
            const cellAmount = Math.max(0, Math.min(this.cellCapacity, this.currentAmount - index * this.cellCapacity));

            if (cellAmount > 0) {
                const fillRatio = cellAmount / this.cellCapacity;
                const fillSize = CONSTANTS.CELL_SIZE * fillRatio;

                // Цвет заполнения (желтоватый)
                this.fillGraphics.fillStyle(0xFFD700, 0.6);

                // Рисуем квадрат снизу вверх (заполнение идет снизу)
                const cellX = startX + cell.x * CONSTANTS.CELL_SIZE;
                const cellY = startY + cell.y * CONSTANTS.CELL_SIZE + (CONSTANTS.CELL_SIZE - fillSize);

                this.fillGraphics.fillRect(
                    cellX,
                    cellY,
                    CONSTANTS.CELL_SIZE,
                    fillSize
                );
            }
        });
    }

    destroy() {
        if (this.fillGraphics) {
            this.fillGraphics.destroy();
        }
        super.destroy();
    }
}
