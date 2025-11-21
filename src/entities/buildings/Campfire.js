class Campfire extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.CAMPFIRE,
            type: CONSTANTS.BUILDING_TYPES.CAMPFIRE
        };
        super(scene, gridX, gridY, config);

        // Переопределяем графику - рисуем круг вместо прямоугольника
        this.graphics.clear();

        const center = this.getCenter();
        const radius = (CONSTANTS.CELL_SIZE / 2) * 0.8; // Радиус чуть меньше половины клетки

        this.graphics.fillStyle(this.color, 1);
        this.graphics.fillCircle(center.x, center.y, radius);
    }
}
