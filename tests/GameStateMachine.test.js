import { describe, it, expect, vi } from 'vitest';
import { GameStateMachine, GAME_STATES } from '../src/core/GameStateMachine.js';

describe('GameStateMachine', () => {
    it('flows menu -> loading -> playing', () => {
        const onStart = vi.fn();
        const onLoaded = vi.fn();
        const fsm = new GameStateMachine({ onStart, onLoaded });

        expect(fsm.getState()).toBe(GAME_STATES.MENU);

        fsm.send({ type: 'START' });
        expect(fsm.getState()).toBe(GAME_STATES.LOADING);
        expect(onStart).toHaveBeenCalledTimes(1);

        fsm.send({ type: 'LOADED' });
        expect(fsm.getState()).toBe(GAME_STATES.PLAYING);
        expect(onLoaded).toHaveBeenCalledTimes(1);
    });

    it('pauses and resumes', () => {
        const onPause = vi.fn();
        const onResume = vi.fn();
        const fsm = new GameStateMachine({ onPause, onResume });

        fsm.send({ type: 'START' });
        fsm.send({ type: 'LOADED' });
        expect(fsm.getState()).toBe(GAME_STATES.PLAYING);

        fsm.send({ type: 'PAUSE' });
        expect(fsm.getState()).toBe(GAME_STATES.PAUSED);
        expect(onPause).toHaveBeenCalledTimes(1);

        fsm.send({ type: 'RESUME' });
        expect(fsm.getState()).toBe(GAME_STATES.PLAYING);
        expect(onResume).toHaveBeenCalledTimes(1);
    });
});
