const gameConfig = {
    type: Phaser.AUTO,
    width: CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE,
    height: CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE + 100, // +100 for UI
    parent: 'game-container',
    backgroundColor: CONSTANTS.COLORS.BACKGROUND,
    scene: null, // Will be set in main.js
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE,
        height: CONSTANTS.GRID_SIZE * CONSTANTS.CELL_SIZE + 100
    },
    render: {
        pixelArt: true,
        antialias: false,
        roundPixels: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};
