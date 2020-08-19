import { inject } from '../decorators/inject';
import { provider } from '../decorators/provider';

/** root provider 提供root Element本身 */
@provider
export class RootProvider {
    constructor (@inject('RootService') private rootService: RootService) {}
    create () {
        return this.rootService.root;
    }
}

/** root service 提供对element的修改途径 */
export interface RootService {
  root: Element
}
