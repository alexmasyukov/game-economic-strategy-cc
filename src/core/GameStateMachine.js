import { createActor, createMachine } from 'xstate';

export const GAME_STATES = {
    MENU: 'MENU',
    LOADING: 'LOADING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED'
};

/**
 * Simple global game state machine: menu -> loading -> playing -> paused.
 * Actions are injected so it stays testable and decoupled from Phaser.
 */
export class GameStateMachine {
    constructor(deps) {
        const machine = createMachine(
            {
                id: 'game',
                initial: GAME_STATES.MENU,
                states: {
                    [GAME_STATES.MENU]: {
                        on: {
                            START: { target: GAME_STATES.LOADING, actions: ['onStart'] }
                        }
                    },
                    [GAME_STATES.LOADING]: {
                        on: {
                            LOADED: { target: GAME_STATES.PLAYING, actions: ['onLoaded'] }
                        }
                    },
                    [GAME_STATES.PLAYING]: {
                        on: {
                            PAUSE: { target: GAME_STATES.PAUSED, actions: ['onPause'] }
                        }
                    },
                    [GAME_STATES.PAUSED]: {
                        on: {
                            RESUME: { target: GAME_STATES.PLAYING, actions: ['onResume'] }
                        }
                    }
                }
            },
            {
                actions: {
                    onStart: () => deps.onStart?.(),
                    onLoaded: () => deps.onLoaded?.(),
                    onPause: () => deps.onPause?.(),
                    onResume: () => deps.onResume?.()
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
