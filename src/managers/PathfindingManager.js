export class PathfindingManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.easystar = new EasyStar.js();

        this.easystar.setAcceptableTiles([0]);
        this.easystar.enableDiagonals();
        this.easystar.enableCornerCutting();

        this.updateGrid();
    }

    updateGrid() {
        const grid = this.gridManager.getGrid();
        this.easystar.setGrid(grid);
    }

    findPath(startX, startY, endX, endY, callback) {
        const startGrid = this.gridManager.worldToGrid(startX, startY);
        const endGrid = this.gridManager.worldToGrid(endX, endY);

        this.easystar.findPath(
            startGrid.x,
            startGrid.y,
            endGrid.x,
            endGrid.y,
            (path) => {
                if (path) {
                    // Convert grid coordinates to world coordinates
                    const worldPath = path.map(point => {
                        return this.gridManager.gridToWorld(point.x, point.y);
                    });
                    callback(worldPath);
                } else {
                    callback(null);
                }
            }
        );

        this.easystar.calculate();
    }

    findPathToBuilding(startX, startY, building, callback) {
        // Find nearest walkable cell around the building
        const nearestPoint = this.findNearestWalkablePointAroundBuilding(building);

        if (nearestPoint) {
            this.findPath(startX, startY, nearestPoint.x, nearestPoint.y, callback);
        } else {
            callback(null);
        }
    }

    findNearestWalkablePointAroundBuilding(building) {
        const gridX = building.gridX;
        const gridY = building.gridY;
        const width = building.width;
        const height = building.height;

        // Check around building perimeter
        const checks = [];

        // Top side
        for (let x = gridX - 1; x <= gridX + width; x++) {
            checks.push({ x, y: gridY - 1 });
        }

        // Bottom side
        for (let x = gridX - 1; x <= gridX + width; x++) {
            checks.push({ x, y: gridY + height });
        }

        // Left side
        for (let y = gridY; y < gridY + height; y++) {
            checks.push({ x: gridX - 1, y });
        }

        // Right side
        for (let y = gridY; y < gridY + height; y++) {
            checks.push({ x: gridX + width, y });
        }

        // Find first walkable point
        for (let check of checks) {
            if (this.gridManager.isWalkable(check.x, check.y)) {
                return this.gridManager.gridToWorld(check.x, check.y);
            }
        }

        return null;
    }
}
