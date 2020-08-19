import { inject } from '../decorators/inject';
import { provider } from '../decorators/provider';

/** 提供Log Debug 开关由Config控制 */
@provider
export class LogProvider {
    constructor (@inject('Config') private config: DebugOption) {
        if (this.config.debug) {
            console.log('[debug]', 'log open!');
        }
    }
    create (): log {
        if (this.config.debug) {
            return (...args) => {
                console.log.apply(console.log, args);
            };
        }
        return () => {};
    }
}

export interface DebugOption {
  debug: boolean
}

export type log = (...args) => void

// export type warn = (...args) => void
// export type error = (...args) => void
