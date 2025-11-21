class PlacementManager {
    constructor(scene) {
        this.scene = scene;
        this.isPlacing = false;
        this.currentBuildingType = null;
        this.ghost = null;

        // Setup mouse events
        this.setupInputEvents();
    }

    setupInputEvents() {
        // Mouse move - update ghost position
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isPlacing && this.ghost) {
                // Convert screen coordinates to world coordinates (accounting for camera)
                const worldX = pointer.x + this.scene.cameras.main.scrollX;
                const worldY = pointer.y + this.scene.cameras.main.scrollY;
                this.ghost.updatePosition(worldX, worldY);
            }
        });

        // Left click - place building
        this.scene.input.on('pointerdown', (pointer) => {
            if (this.isPlacing && this.ghost && pointer.leftButtonDown()) {
                // Check if click is on UI (top 40px or bottom 60px)
                if (pointer.y < 40 || pointer.y > this.scene.scale.height - 60) {
                    return; // Ignore clicks on UI
                }

                this.tryPlaceBuilding();
            }

            // Right click - cancel placement
            if (this.isPlacing && pointer.rightButtonDown()) {
                this.cancelPlacement();
            }
        });

        // ESC key - cancel placement
        this.scene.input.keyboard.on('keydown-ESC', () => {
            if (this.isPlacing) {
                this.cancelPlacement();
            }
        });
    }

    startPlacement(buildingType) {
        if (this.isPlacing) {
            this.cancelPlacement();
        }

        this.isPlacing = true;
        this.currentBuildingType = buildingType;
        this.ghost = new BuildingGhost(this.scene, buildingType);

        // Get initial mouse position
        const pointer = this.scene.input.activePointer;
        const worldX = pointer.x + this.scene.cameras.main.scrollX;
        const worldY = pointer.y + this.scene.cameras.main.scrollY;
        this.ghost.updatePosition(worldX, worldY);
    }

    tryPlaceBuilding() {
        if (!this.ghost || !this.ghost.canPlace()) {
            console.log('Невозможно разместить здание здесь');
            return false;
        }

        const gridPos = this.ghost.getGridPosition();

        // Create the building
        switch (this.currentBuildingType) {
            case CONSTANTS.BUILDING_TYPES.GREENHOUSE:
                this.scene.buildingManager.createGreenhouse(gridPos.x, gridPos.y);
                break;
            case CONSTANTS.BUILDING_TYPES.GARDEN_BED:
                this.scene.buildingManager.createGardenBed(gridPos.x, gridPos.y);
                break;
            // Add other building types here
        }

        // Clean up and exit placement mode
        this.cancelPlacement();
        return true;
    }

    cancelPlacement() {
        if (this.ghost) {
            this.ghost.destroy();
            this.ghost = null;
        }

        this.isPlacing = false;
        this.currentBuildingType = null;
    }

    isInPlacementMode() {
        return this.isPlacing;
    }

    update() {
        // Update logic if needed
    }
}
