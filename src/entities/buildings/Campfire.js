class Campfire extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.CAMPFIRE,
            type: CONSTANTS.BUILDING_TYPES.CAMPFIRE
        };
        super(scene, gridX, gridY, config);
    }
}
