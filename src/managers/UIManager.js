import Phaser from 'phaser';
import { CONSTANTS } from '../config/Constants.js';
import { GAME_STATES } from '../core/GameStateMachine.js';
export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.gameSpeed = 1;
        this.speedButtons = [];
        this.utilityButtons = [];
        this.menuOverlay = null;
        this.menuPanel = null;
        this.menuText = null;
        this.menuPaused = false;

        this.createTopBar();
        this.createBottomBar();
        this.createSpeedControlsAndUtilities();

        // Subscribe to resource changes
        this.scene.services.resourceManager.onResourceChange(() => {
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
        this.createSpeedControlsAndUtilities();
        this.updateResourceDisplay();
        this.updateWorkerCount();
        this.updateSpeedButtons();
        this.updatePauseButton();
    }

    destroyUI() {
        if (this.topBarBg) this.topBarBg.destroy();
        if (this.resourceText) this.resourceText.destroy();
        if (this.workerCountText) this.workerCountText.destroy();
        if (this.bottomBarBg) this.bottomBarBg.destroy();
        this.destroyMenuOverlay();

        this.speedButtons.forEach(btn => {
            if (btn.buttonBg) btn.buttonBg.destroy();
            if (btn.text) btn.text.destroy();
        });
        this.speedButtons = [];

        this.utilityButtons.forEach(btn => {
            if (btn.buttonBg) btn.buttonBg.destroy();
            if (btn.text) btn.text.destroy();
        });
        this.utilityButtons = [];
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
        this.updatePauseButton();
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

    createSpeedControlsAndUtilities() {
        const width = this.scene.scale.width;
        const y = 5;
        const buttonWidth = 60;
        const spacing = 5;

        // Place utility buttons first (Menu, Pause)
        let startX = width - (buttonWidth * 2 + spacing * 3 + 45 * CONSTANTS.GAME_SPEEDS.length);

        const menuButton = this.createUtilityButton(startX, y, 'Menu', () => this.toggleMenu());
        this.utilityButtons.push(menuButton);

        const pauseButton = this.createUtilityButton(
            startX + buttonWidth + spacing,
            y,
            'Pause',
            () => this.togglePause()
        );
        this.utilityButtons.push(pauseButton);

        // Speed buttons
        const speedStartX = startX + (buttonWidth + spacing) * 2 + spacing;
        CONSTANTS.GAME_SPEEDS.forEach((speed, index) => {
            const button = this.createSpeedButton(
                speedStartX + index * 45,
                y,
                `x${speed}`,
                speed
            );
            this.speedButtons.push(button);
        });

        this.updateSpeedButtons();
        this.updatePauseButton();
    }

    createUtilityButton(x, y, label, onClick) {
        const buttonBg = this.scene.add.graphics();
        buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
        buttonBg.fillRect(x, y, 60, 30);
        buttonBg.setDepth(1001);
        buttonBg.setScrollFactor(0);
        buttonBg.setInteractive(
            new Phaser.Geom.Rectangle(x, y, 60, 30),
            Phaser.Geom.Rectangle.Contains
        );

        const text = this.scene.add.text(x + 30, y + 15, label, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        text.setOrigin(0.5);
        text.setDepth(1002);
        text.setScrollFactor(0);

        buttonBg.on('pointerdown', onClick);
        buttonBg.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_HOVER, 1);
            buttonBg.fillRect(x, y, 60, 30);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(CONSTANTS.COLORS.BUTTON_NORMAL, 1);
            buttonBg.fillRect(x, y, 60, 30);
        });

        return { buttonBg, text, x, y };
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

    updatePauseButton() {
        const isPaused = this.scene.gameStateMachine?.getState() === GAME_STATES.PAUSED;
        const pauseBtn = this.utilityButtons[1];
        if (!pauseBtn) return;
        pauseBtn.buttonBg.clear();
        pauseBtn.buttonBg.fillStyle(
            isPaused ? CONSTANTS.COLORS.BUTTON_ACTIVE : CONSTANTS.COLORS.BUTTON_NORMAL,
            1
        );
        pauseBtn.buttonBg.fillRect(pauseBtn.x, pauseBtn.y, 60, 30);
        pauseBtn.text.setText(isPaused ? 'Resume' : 'Pause');
    }

    updateResourceDisplay() {
        const resources = this.scene.services.resourceManager.getAllResources();
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
        const freeWorkers = this.scene.services.workerManager.getFreeWorkersCount();
        const totalWorkers = this.scene.services.workerManager.getWorkers().length;

        this.workerCountText.setText(`Рабочие: ${freeWorkers}/${totalWorkers} свободно`);
    }

    onBuildButtonClick(buildingType) {
        // Start placement mode instead of auto-placing
        this.scene.services.placementManager.startPlacement(buildingType);

        // Update worker count after building placement
        this.updateWorkerCount();
    }

    togglePause() {
        if (!this.scene.gameStateMachine) return;
        const state = this.scene.gameStateMachine.getState();
        if (state === GAME_STATES.PAUSED) {
            this.scene.gameStateMachine.send({ type: 'RESUME' });
        } else if (state === GAME_STATES.PLAYING) {
            this.scene.gameStateMachine.send({ type: 'PAUSE' });
        }
        this.updatePauseButton();
    }

    toggleMenu() {
        if (this.menuOverlay) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        this.menuOverlay = this.scene.add.graphics();
        this.menuOverlay.fillStyle(0x000000, 0.5);
        this.menuOverlay.fillRect(0, 0, width, height);
        this.menuOverlay.setScrollFactor(0);
        this.menuOverlay.setDepth(2000);
        this.menuOverlay.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, height),
            Phaser.Geom.Rectangle.Contains
        );

        const panelWidth = 300;
        const panelHeight = 180;
        const panelX = (width - panelWidth) / 2;
        const panelY = (height - panelHeight) / 2;

        this.menuPanel = this.scene.add.graphics();
        this.menuPanel.fillStyle(CONSTANTS.COLORS.UI_BG, 1);
        this.menuPanel.fillRect(panelX, panelY, panelWidth, panelHeight);
        this.menuPanel.lineStyle(2, CONSTANTS.COLORS.BUTTON_ACTIVE, 1);
        this.menuPanel.strokeRect(panelX, panelY, panelWidth, panelHeight);
        this.menuPanel.setScrollFactor(0);
        this.menuPanel.setDepth(2001);

        this.menuText = this.scene.add.text(panelX + panelWidth / 2, panelY + 30, 'Меню', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.menuText.setOrigin(0.5);
        this.menuText.setScrollFactor(0);
        this.menuText.setDepth(2002);

        // Close button
        const closeBtn = this.createUtilityButton(panelX + panelWidth / 2 - 30, panelY + panelHeight - 50, 'Close', () => this.closeMenu());
        closeBtn.buttonBg.setDepth(2002);
        closeBtn.text.setDepth(2003);
        this.menuCloseButton = closeBtn;

        // Pause while menu open
        if (this.scene.gameStateMachine?.getState() === GAME_STATES.PLAYING) {
            this.menuPaused = true;
            this.scene.gameStateMachine.send({ type: 'PAUSE' });
            this.updatePauseButton();
        } else {
            this.menuPaused = false;
        }
    }

    closeMenu() {
        this.destroyMenuOverlay();
        if (this.menuPaused && this.scene.gameStateMachine?.getState() === GAME_STATES.PAUSED) {
            this.scene.gameStateMachine.send({ type: 'RESUME' });
            this.updatePauseButton();
        }
        this.menuPaused = false;
    }

    destroyMenuOverlay() {
        if (this.menuOverlay) this.menuOverlay.destroy();
        if (this.menuPanel) this.menuPanel.destroy();
        if (this.menuText) this.menuText.destroy();
        if (this.menuCloseButton) {
            if (this.menuCloseButton.buttonBg) this.menuCloseButton.buttonBg.destroy();
            if (this.menuCloseButton.text) this.menuCloseButton.text.destroy();
        }
        this.menuOverlay = null;
        this.menuPanel = null;
        this.menuText = null;
        this.menuCloseButton = null;
    }
}
