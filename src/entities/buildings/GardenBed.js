class GardenBed extends ProductionBuilding {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.GARDEN_BED,
            type: CONSTANTS.BUILDING_TYPES.GARDEN_BED
        };
        super(scene, gridX, gridY, config);
    }
}
