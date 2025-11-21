class GridManager {
    constructor(scene) {
        this.scene = scene;
        this.gridSize = CONSTANTS.GRID_SIZE;
        this.cellSize = CONSTANTS.CELL_SIZE;

        // Grid data: 0 = walkable, 1 = blocked
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = 0;
            }
        }

        this.drawGrid();
    }

    drawGrid() {
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(1, CONSTANTS.COLORS.GRID_LINE, 0.3);

        // Draw vertical lines
        for (let x = 0; x <= this.gridSize; x++) {
            graphics.lineBetween(
                x * this.cellSize,
                0,
                x * this.cellSize,
                this.gridSize * this.cellSize
            );
        }

        // Draw horizontal lines
        for (let y = 0; y <= this.gridSize; y++) {
            graphics.lineBetween(
                0,
                y * this.cellSize,
                this.gridSize * this.cellSize,
                y * this.cellSize
            );
        }

        graphics.setDepth(-1);
    }

    worldToGrid(x, y) {
        return {
            x: Math.floor(x / this.cellSize),
            y: Math.floor(y / this.cellSize)
        };
    }

    gridToWorld(gridX, gridY) {
        return {
            x: gridX * this.cellSize + this.cellSize / 2,
            y: gridY * this.cellSize + this.cellSize / 2
        };
    }

    isAreaFree(gridX, gridY, width, height) {
        if (gridX < 0 || gridY < 0 ||
            gridX + width > this.gridSize ||
            gridY + height > this.gridSize) {
            return false;
        }

        for (let y = gridY; y < gridY + height; y++) {
            for (let x = gridX; x < gridX + width; x++) {
                if (this.grid[y][x] !== 0) {
                    return false;
                }
            }
        }
        return true;
    }

    occupyArea(gridX, gridY, width, height) {
        for (let y = gridY; y < gridY + height; y++) {
            for (let x = gridX; x < gridX + width; x++) {
                this.grid[y][x] = 1;
            }
        }
    }

    freeArea(gridX, gridY, width, height) {
        for (let y = gridY; y < gridY + height; y++) {
            for (let x = gridX; x < gridX + width; x++) {
                this.grid[y][x] = 0;
            }
        }
    }

    getGrid() {
        return this.grid;
    }

    isWalkable(gridX, gridY) {
        if (gridX < 0 || gridY < 0 || gridX >= this.gridSize || gridY >= this.gridSize) {
            return false;
        }
        return this.grid[gridY][gridX] === 0;
    }
}
