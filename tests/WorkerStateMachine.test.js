import { describe, it, expect, vi } from 'vitest';
import { WorkerStateMachine } from '../src/core/WorkerStateMachine.js';
import { CONSTANTS } from '../src/config/Constants.js';

const states = CONSTANTS.WORKER_STATES;

describe('WorkerStateMachine', () => {
    it('cycles through delivery loop when storage has space', () => {
        const goToBuilding = vi.fn();
        const startProduction = vi.fn();
        const collectAndGoToStorage = vi.fn();
        const deliverResource = vi.fn();
        let hasSpace = true;

        const fsm = new WorkerStateMachine({
            goToBuilding,
            startProduction,
            collectAndGoToStorage,
            deliverResource,
            storageHasSpace: () => hasSpace
        });

        expect(fsm.getState()).toBe(states.IDLE);

        fsm.send({ type: 'ASSIGN' });
        expect(fsm.getState()).toBe(states.RETURNING_TO_BUILDING);
        expect(goToBuilding).toHaveBeenCalledTimes(1);

        fsm.send({ type: 'ARRIVED' });
        expect(fsm.getState()).toBe(states.PRODUCING);
        expect(startProduction).toHaveBeenCalledTimes(1);

        fsm.send({ type: 'RESOURCE_READY' });
        expect(fsm.getState()).toBe(states.CARRYING_TO_STORAGE);
        expect(collectAndGoToStorage).toHaveBeenCalledTimes(1);

        fsm.send({ type: 'ARRIVED' });
        expect(deliverResource).toHaveBeenCalledTimes(1);
        expect(fsm.getState()).toBe(states.RETURNING_TO_BUILDING);
    });

    it('waits if storage is full and resumes when space frees', () => {
        const deliverResource = vi.fn();
        const collectAndGoToStorage = vi.fn();
        let hasSpace = false;

        const fsm = new WorkerStateMachine({
            goToBuilding: vi.fn(),
            startProduction: vi.fn(),
            collectAndGoToStorage,
            deliverResource,
            storageHasSpace: () => hasSpace
        });

        fsm.send({ type: 'ASSIGN' });
        fsm.send({ type: 'ARRIVED' }); // producing
        fsm.send({ type: 'RESOURCE_READY' }); // carrying

        expect(fsm.getState()).toBe(states.CARRYING_TO_STORAGE);
        fsm.send({ type: 'ARRIVED' });
        expect(fsm.getState()).toBe(states.WAITING_FOR_STORAGE);
        expect(deliverResource).not.toHaveBeenCalled();

        hasSpace = true;
        fsm.send({ type: 'STORAGE_SPACE' });
        expect(deliverResource).toHaveBeenCalledTimes(1);
        expect(fsm.getState()).toBe(states.RETURNING_TO_BUILDING);
    });
});
