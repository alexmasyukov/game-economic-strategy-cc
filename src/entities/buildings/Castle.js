import { Building } from '../Building.js';
import { CONSTANTS } from '../../config/Constants.js';

export class Castle extends Building {
    constructor(scene, gridX, gridY) {
        const config = {
            ...CONSTANTS.BUILDINGS.CASTLE,
            type: CONSTANTS.BUILDING_TYPES.CASTLE
        };
        super(scene, gridX, gridY, config);
    }
}
