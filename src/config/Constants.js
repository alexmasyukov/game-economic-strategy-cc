const CONSTANTS = {
    // Grid settings
    GRID_SIZE: 40,
    CELL_SIZE: 25,

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
        GREENHOUSE: 'GREENHOUSE'
    },

    // Resource types
    RESOURCE_TYPES: {
        TOMATO: 'TOMATO'
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
