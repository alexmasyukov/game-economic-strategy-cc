class ResourceManager {
    constructor() {
        this.resources = {};

        // Initialize all resource types with 0
        Object.keys(CONSTANTS.RESOURCE_TYPES).forEach(resourceType => {
            this.resources[resourceType] = 0;
        });

        this.listeners = [];
    }

    addResource(resourceType, amount = 1) {
        if (this.resources.hasOwnProperty(resourceType)) {
            this.resources[resourceType] += amount;
            this.notifyListeners();
        }
    }

    getResource(resourceType) {
        return this.resources[resourceType] || 0;
    }

    getAllResources() {
        return { ...this.resources };
    }

    onResourceChange(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.resources));
    }
}
