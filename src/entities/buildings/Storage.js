class Storage extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.STORAGE,
            type: CONSTANTS.BUILDING_TYPES.STORAGE
        };
        super(scene, gridX, gridY, config);
    }

    receiveResource(resourceType) {
        this.scene.resourceManager.addResource(resourceType, 1);
    }
}
