import { ProductionBuilding } from '../ProductionBuilding.js';
import { CONSTANTS } from '../../config/Constants.js';

export class Greenhouse extends ProductionBuilding {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.GREENHOUSE,
            type: CONSTANTS.BUILDING_TYPES.GREENHOUSE
        };
        super(scene, gridX, gridY, config);
    }
}
