const CONSTANTS = {
    // Grid settings
    GRID_SIZE: 200,
    CELL_SIZE: 25,

    // Camera settings
    CAMERA_WIDTH: 1000,
    CAMERA_HEIGHT: 800,
    CAMERA_SPEED: 300,

    // Game settings
    INITIAL_WORKERS: 5,

    // Worker states
    WORKER_STATES: {
        IDLE: 'IDLE',
        PRODUCING: 'PRODUCING',
        CARRYING_TO_STORAGE: 'CARRYING_TO_STORAGE',
        RETURNING_TO_BUILDING: 'RETURNING_TO_BUILDING'
    },

    // Building types
    BUILDING_TYPES: {
        CASTLE: 'CASTLE',
        STORAGE: 'STORAGE',
        CAMPFIRE: 'CAMPFIRE',
        GREENHOUSE: 'GREENHOUSE',
        GARDEN_BED: 'GARDEN_BED'
    },

    // Resource types
    RESOURCE_TYPES: {
        TOMATO: 'TOMATO',
        CARROT: 'CARROT'
    },

    // Building configs
    BUILDINGS: {
        CASTLE: {
            width: 3,
            height: 3,
            color: 0x8B4513,
            name: 'Замок'
        },
        STORAGE: {
            width: 2,
            height: 2,
            color: 0x654321,
            name: 'Склад'
        },
        CAMPFIRE: {
            width: 1,
            height: 1,
            color: 0xFF4500,
            name: 'Очаг'
        },
        GREENHOUSE: {
            width: 3,
            height: 1,
            color: 0x228B22,
            name: 'Теплица',
            productionTime: 2000, // 2 seconds
            resourceType: 'TOMATO'
        },
        GARDEN_BED: {
            width: 2,
            height: 1,
            color: 0xFFA500,
            name: 'Грядка',
            productionTime: 5000, // 5 seconds
            resourceType: 'CARROT'
        }
    },

    // Worker settings
    WORKER: {
        radius: 3,
        color: 0x4169E1,
        speed: 50 // pixels per second
    },

    // Game speed multipliers
    GAME_SPEEDS: [1, 2, 3, 5, 7],

    // Colors
    COLORS: {
        GRID_LINE: 0x333333,
        BACKGROUND: 0x1a1a1a,
        UI_BG: 0x2a2a2a,
        UI_TEXT: 0xFFFFFF,
        BUTTON_NORMAL: 0x4a4a4a,
        BUTTON_HOVER: 0x5a5a5a,
        BUTTON_ACTIVE: 0x6a6a6a
    }
};
