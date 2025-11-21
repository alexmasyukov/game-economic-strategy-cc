import { CONSTANTS } from '../config/Constants.js';
export class UIManager {
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

        // Handle resize
        this.scene.scale.on('resize', this.handleResize, this);
    }

    handleResize(gameSize) {
        // Recreate UI elements on resize
        this.destroyUI();
        this.createTopBar();
        this.createBottomBar();
        this.createSpeedControls();
        this.updateResourceDisplay();
        this.updateWorkerCount();
        this.updateSpeedButtons();
    }

    destroyUI() {
        if (this.topBarBg) this.topBarBg.destroy();
        if (this.resourceText) this.resourceText.destroy();
        if (this.workerCountText) this.workerCountText.destroy();
        if (this.bottomBarBg) this.bottomBarBg.destroy();

        this.speedButtons.forEach(btn => {
            if (btn.buttonBg) btn.buttonBg.destroy();
            if (btn.text) btn.text.destroy();
        });
        this.speedButtons = [];
    }

    createTopBar() {
        const width = this.scene.scale.width;

        // Background
        this.topBarBg = this.scene.add.graphics();
        this.topBarBg.fillStyle(CONSTANTS.COLORS.UI_BG, 1);
        this.topBarBg.fillRect(0, 0, width, 40);
        this.topBarBg.setDepth(1000);
        this.topBarBg.setScrollFactor(0);

        // Resource text (left side)
        this.resourceText = this.scene.add.text(10, 10, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.resourceText.setDepth(1001);
        this.resourceText.setScrollFactor(0);

        // Worker count text (middle)
        this.workerCountText = this.scene.add.text(width / 2, 10, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.workerCountText.setOrigin(0.5, 0);
        this.workerCountText.setDepth(1001);
        this.workerCountText.setScrollFactor(0);

        this.updateResourceDisplay();
        this.updateWorkerCount();
    }

    createBottomBar() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        // Background
        this.bottomBarBg = this.scene.add.graphics();
        this.bottomBarBg.fillStyle(CONSTANTS.COLORS.UI_BG, 1);
        this.bottomBarBg.fillRect(0, height - 60, width, 60);
        this.bottomBarBg.setDepth(1000);
        this.bottomBarBg.setScrollFactor(0);

        // Build buttons - используем конфигурацию из UI_CONFIG
        const greenhouseConfig = CONSTANTS.UI_CONFIG.BUILDINGS.GREENHOUSE;
        const gardenBedConfig = CONSTANTS.UI_CONFIG.BUILDINGS.GARDEN_BED;

        this.createBuildButton(
            10,
            height - 50,
            `${greenhouseConfig.icon} ${greenhouseConfig.name}`,
            CONSTANTS.BUILDING_TYPES.GREENHOUSE
        );
        this.createBuildButton(
            140,
            height - 50,
            `${gardenBedConfig.icon} ${gardenBedConfig.name}`,
            CONSTANTS.BUILDING_TYPES.GARDEN_BED
        );
    }

    createBuildButton(x, y, label, buildingType) {
        // Вычисляем ширину кнопки в зависимости от текста (минимум 100, максимум 130)
        const buttonWidth = Math.min(130, Math.max(100, label.length * 8 + 20));

        const button = this.scene.add.graphics();
        button.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
        button.fillRect(x, y, buttonWidth, 40);
        button.setDepth(1001);
        button.setScrollFactor(0);
        button.setInteractive(
            new Phaser.Geom.Rectangle(x, y, buttonWidth, 40),
            Phaser.Geom.Rectangle.Contains
        );

        const text = this.scene.add.text(x + buttonWidth / 2, y + 20, label, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        text.setOrigin(0.5);
        text.setDepth(1002);
        text.setScrollFactor(0);

        button.on('pointerdown', () => {
            this.onBuildButtonClick(buildingType);
        });

        button.on('pointerover', () => {
            button.clear();
            button.fillStyle(CONSTANTS.COLORS.BUTTON_HOVER, 1);
            button.fillRect(x, y, buttonWidth, 40);
        });

        button.on('pointerout', () => {
            button.clear();
            button.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
            button.fillRect(x, y, buttonWidth, 40);
        });
    }

    createSpeedControls() {
        const width = this.scene.scale.width;
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
        buttonBg.setScrollFactor(0);
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
        text.setScrollFactor(0);

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
        let text = '';

        Object.keys(resources).forEach((resourceType, index) => {
            if (index > 0) text += '  ';

            const uiConfig = CONSTANTS.UI_CONFIG.RESOURCES[resourceType];
            if (uiConfig) {
                text += `${uiConfig.icon} ${resources[resourceType]}`;
            } else {
                // Fallback если конфига нет
                text += `${resourceType}: ${resources[resourceType]}`;
            }
        });

        this.resourceText.setText(text);
    }

    updateWorkerCount() {
        const freeWorkers = this.scene.workerManager.getFreeWorkersCount();
        const totalWorkers = this.scene.workerManager.getWorkers().length;

        this.workerCountText.setText(`Рабочие: ${freeWorkers}/${totalWorkers} свободно`);
    }

    onBuildButtonClick(buildingType) {
        // Start placement mode instead of auto-placing
        this.scene.placementManager.startPlacement(buildingType);

        // Update worker count after building placement
        this.updateWorkerCount();
    }
}
