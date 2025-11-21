export class WorkerManager {
    constructor(scene) {
        this.scene = scene;
        this.workers = [];
    }

    createWorker(x, y) {
        const worker = new Worker(this.scene, x, y);
        this.workers.push(worker);
        return worker;
    }

    createWorkers(count, x, y) {
        const workers = [];
        const radius = 15;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            const worker = this.createWorker(x + offsetX, y + offsetY);
            workers.push(worker);
        }

        return workers;
    }

    assignWorkerToBuilding(building) {
        const freeWorker = this.getFreeWorker();
        if (freeWorker) {
            freeWorker.assignToBuilding(building);
            return true;
        }
        return false;
    }

    getFreeWorker() {
        return this.workers.find(worker => worker.isIdle());
    }

    update(deltaTime) {
        this.workers.forEach(worker => {
            worker.update(deltaTime);
        });
    }

    getWorkers() {
        return this.workers;
    }

    getFreeWorkersCount() {
        return this.workers.filter(worker => worker.isIdle()).length;
    }
}
