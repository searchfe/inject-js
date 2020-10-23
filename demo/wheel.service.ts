import { injectable } from '../src/index';

@injectable
export class Wheel {
    constructor () {
        console.log('Wheel created');
    }
    public destroy () {
        console.log('Wheel destroy');
    }
}
