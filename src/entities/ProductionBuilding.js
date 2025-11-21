import { Building } from './Building.js';

/**
 * ProductionBuilding - базовый класс для производственных зданий
 * Расширяет Building, добавляя логику производства ресурсов
 *
 * Наследует базовые свойства (размер, цвет) из Building
 * Добавляет специфичные свойства для производственных зданий
 */
export class ProductionBuilding extends Building {
    constructor(scene, gridX, gridY, config) {
        // Инициализация базовых свойств (размер, цвет) через родительский класс
        super(scene, gridX, gridY, config);

        // Свойства производства (только для производственных зданий)
        this.productionTime = config.productionTime;    // Время производства 1 единицы
        this.resourceType = config.resourceType;        // Тип производимого ресурса
        this.currentProductionTime = 0;                 // Текущий прогресс производства
        this.isProducing = false;                       // Флаг активного производства
        this.assignedWorker = null;                     // Привязанный рабочий
        this.resourceReady = false;                     // Флаг готовности ресурса
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
