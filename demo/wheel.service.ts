import { injectable } from '../dist/cjs/index.js';

@injectable
export class Wheel {
    constructor () {
        console.log('Wheel created');
    }
}
