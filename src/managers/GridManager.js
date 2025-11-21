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
        this.drawSectorGrid();
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

    drawSectorGrid() {
        const sectorSize = 20; // Каждые 20 клеток
        const sectorPixelSize = sectorSize * this.cellSize;

        // Рисуем линии секторов (темно-серый цвет)
        const sectorGraphics = this.scene.add.graphics();
        sectorGraphics.lineStyle(2, 0x505050, 1);

        // Вертикальные линии
        for (let x = 0; x <= this.gridSize; x += sectorSize) {
            sectorGraphics.lineBetween(
                x * this.cellSize,
                0,
                x * this.cellSize,
                this.gridSize * this.cellSize
            );
        }

        // Горизонтальные линии
        for (let y = 0; y <= this.gridSize; y += sectorSize) {
            sectorGraphics.lineBetween(
                0,
                y * this.cellSize,
                this.gridSize * this.cellSize,
                y * this.cellSize
            );
        }

        sectorGraphics.setDepth(-0.5);

        // Добавляем текст в каждый сектор
        const sectorsX = Math.floor(this.gridSize / sectorSize);
        const sectorsY = Math.floor(this.gridSize / sectorSize);

        for (let row = 0; row < sectorsY; row++) {
            for (let col = 0; col < sectorsX; col++) {
                const worldX = col * sectorPixelSize + sectorPixelSize / 2;
                const worldY = row * sectorPixelSize + sectorPixelSize / 2;

                const text = this.scene.add.text(worldX, worldY, `${row}:${col}`, {
                    fontSize: '14px',
                    color: '#404040',
                    fontFamily: 'Arial'
                });
                text.setOrigin(0.5);
                text.setDepth(-0.5);
            }
        }
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
