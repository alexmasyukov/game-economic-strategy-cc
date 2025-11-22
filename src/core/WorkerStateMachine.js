import { createActor, createMachine } from 'xstate';
import { CONSTANTS } from '../config/Constants.js';

/**
 * Pure state machine for worker lifecycle. No Phaser dependencies; side-effects
 * are delegated via injected actions/guards to keep it testable.
 */
export class WorkerStateMachine {
    constructor(deps) {
        this.deps = deps;
        const machine = createMachine(
            {
                id: 'worker',
                initial: CONSTANTS.WORKER_STATES.IDLE,
                states: {
                    [CONSTANTS.WORKER_STATES.IDLE]: {
                        on: {
                            ASSIGN: {
                                target: CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING
                            }
                        }
                    },
                    [CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING]: {
                        entry: ['goToBuilding'],
                        on: {
                            ARRIVED: CONSTANTS.WORKER_STATES.PRODUCING
                        }
                    },
                    [CONSTANTS.WORKER_STATES.PRODUCING]: {
                        entry: ['startProduction'],
                        on: {
                            RESOURCE_READY: CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE
                        }
                    },
                    [CONSTANTS.WORKER_STATES.CARRYING_TO_STORAGE]: {
                        entry: ['collectAndGoToStorage'],
                        on: {
                            ARRIVED: [
                                {
                                    target: CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING,
                                    guard: 'storageHasSpace',
                                    actions: ['deliverResource']
                                },
                                {
                                    target: CONSTANTS.WORKER_STATES.WAITING_FOR_STORAGE
                                }
                            ]
                        }
                    },
                    [CONSTANTS.WORKER_STATES.WAITING_FOR_STORAGE]: {
                        on: {
                            STORAGE_SPACE: {
                                target: CONSTANTS.WORKER_STATES.RETURNING_TO_BUILDING,
                                actions: ['deliverResource']
                            }
                        }
                    }
                }
            },
            {
                guards: {
                    storageHasSpace: () => deps.storageHasSpace()
                },
                actions: {
                    goToBuilding: () => deps.goToBuilding(),
                    startProduction: () => deps.startProduction(),
                    collectAndGoToStorage: () => deps.collectAndGoToStorage(),
                    deliverResource: () => deps.deliverResource()
                }
            }
        );

        this.actor = createActor(machine);
        this.actor.start();
    }

    send(event) {
        this.actor.send(event);
    }

    getState() {
        return this.actor.getSnapshot().value;
    }
}
