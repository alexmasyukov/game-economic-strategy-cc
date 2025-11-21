class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.gameSpeed = 1;
        this.speedButtons = [];

        this.createTopBar();
        this.createBottomBar();
        this.createSpeedControls();

        // Subscribe to resource changes
        this.scene.resourceManager.onResourceChange(() => {
            this.updateResourceDisplay();
        });
    }

    createTopBar() {
        const width = this.scene.game.config.width;

        // Background
        this.topBarBg = this.scene.add.graphics();
        this.topBarBg.fillStyle(CONSTANTS.COLORS.UI_BG, 1);
        this.topBarBg.fillRect(0, 0, width, 40);
        this.topBarBg.setDepth(1000);

        // Resource text
        this.resourceText = this.scene.add.text(10, 10, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.resourceText.setDepth(1001);

        this.updateResourceDisplay();
    }

    createBottomBar() {
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;

        // Background
        this.bottomBarBg = this.scene.add.graphics();
        this.bottomBarBg.fillStyle(CONSTANTS.COLORS.UI_BG, 1);
        this.bottomBarBg.fillRect(0, height - 60, width, 60);
        this.bottomBarBg.setDepth(1000);

        // Build buttons
        this.createBuildButton(10, height - 50, 'Теплица', CONSTANTS.BUILDING_TYPES.GREENHOUSE);
    }

    createBuildButton(x, y, label, buildingType) {
        const button = this.scene.add.graphics();
        button.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
        button.fillRect(x, y, 100, 40);
        button.setDepth(1001);
        button.setInteractive(
            new Phaser.Geom.Rectangle(x, y, 100, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const text = this.scene.add.text(x + 50, y + 20, label, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        text.setOrigin(0.5);
        text.setDepth(1002);

        button.on('pointerdown', () => {
            this.onBuildButtonClick(buildingType);
        });

        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(CONSTANTS.COLORS.BUTTON_HOVER, 1);
            button.fillRect(x, y, 100, 40);
        });

        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
            button.fillRect(x, y, 100, 40);
        });
    }

    createSpeedControls() {
        const width = this.scene.game.config.width;
        const startX = width - 250;
        const y = 5;

        CONSTANTS.GAME_SPEEDS.forEach((speed, index) => {
            const button = this.createSpeedButton(
                startX + index * 45,
                y,
                `x${speed}`,
                speed
            );
            this.speedButtons.push(button);
        });

        this.updateSpeedButtons();
    }

    createSpeedButton(x, y, label, speed) {
        const buttonBg = this.scene.add.graphics();
        buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
        buttonBg.fillRect(x, y, 40, 30);
        buttonBg.setDepth(1001);
        buttonBg.setInteractive(
            new Phaser.Geom.Rectangle(x, y, 40, 30),
            Phaser.Geom.Rectangle.Contains
        );

        const text = this.scene.add.text(x + 20, y + 15, label, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        text.setOrigin(0.5);
        text.setDepth(1002);

        buttonBg.on('pointerdown', () => {
            this.setGameSpeed(speed);
        });

        buttonBg.on('pointerover', () => {
            if (this.gameSpeed !== speed) {
                buttonBg.clear();
                buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_HOVER, 1);
                buttonBg.fillRect(x, y, 40, 30);
            }
        });

        buttonBg.on('pointerout', () => {
            if (this.gameSpeed !== speed) {
                buttonBg.clear();
                buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
                buttonBg.fillRect(x, y, 40, 30);
            }
        });

        return { buttonBg, text, speed, x, y };
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
        this.scene.setGameSpeed(speed);
        this.updateSpeedButtons();
    }

    updateSpeedButtons() {
        this.speedButtons.forEach(btn => {
            btn.buttonBg.clear();
            if (btn.speed === this.gameSpeed) {
                btn.buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_ACTIVE, 1);
            } else {
                btn.buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
            }
            btn.buttonBg.fillRect(btn.x, btn.y, 40, 30);
        });
    }

    updateResourceDisplay() {
        const resources = this.scene.resourceManager.getAllResources();
        let text = 'Ресурсы: ';

        Object.keys(resources).forEach((key, index) => {
            if (index > 0) text += ', ';
            text += `${key}: ${resources[key]}`;
        });

        this.resourceText.setText(text);
    }

    onBuildButtonClick(buildingType) {
        if (buildingType === CONSTANTS.BUILDING_TYPES.GREENHOUSE) {
            // Find a free spot near the castle
            const castle = this.scene.buildingManager.getCastle();
            if (castle) {
                const freeSpot = this.findFreeBuildingSpot(
                    castle.gridX,
                    castle.gridY,
                    CONSTANTS.BUILDINGS.GREENHOUSE.width,
                    CONSTANTS.BUILDINGS.GREENHOUSE.height
                );

                if (freeSpot) {
                    this.scene.buildingManager.createGreenhouse(freeSpot.x, freeSpot.y);
                } else {
                    console.log('Нет свободного места для строительства');
                }
            }
        }
    }

    findFreeBuildingSpot(centerX, centerY, width, height) {
        const searchRadius = 20;

        for (let radius = 5; radius < searchRadius; radius++) {
            for (let angle = 0; angle < Math.PI * 2; angle += 0.5) {
                const testX = Math.floor(centerX + Math.cos(angle) * radius);
                const testY = Math.floor(centerY + Math.sin(angle) * radius);

                if (this.scene.gridManager.isAreaFree(testX, testY, width, height)) {
                    return { x: testX, y: testY };
                }
            }
        }

        return null;
    }
}
