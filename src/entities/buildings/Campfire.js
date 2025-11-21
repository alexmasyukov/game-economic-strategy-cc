class Campfire extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.CAMPFIRE,
            type: CONSTANTS.BUILDING_TYPES.CAMPFIRE
        };
        super(scene, gridX, gridY, config);

        // Переопределяем графику - рисуем круг вместо прямоугольника
        this.graphics.clear();

        // Рисуем круг в локальных координатах графики (центр клетки)
        const localCenterX = CONSTANTS.CELL_SIZE / 2;
        const localCenterY = CONSTANTS.CELL_SIZE / 2;
        const radius = (CONSTANTS.CELL_SIZE / 2) * 0.8; // Радиус чуть меньше половины клетки

        this.graphics.fillStyle(this.color, 1);
        this.graphics.fillCircle(localCenterX, localCenterY, radius);
    }
}
