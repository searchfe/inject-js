import { injectable } from '../src/index';
import { Wheel } from './wheel.service';

@injectable
export class Car {
    constructor (private wheel: Wheel) {
        console.log('Car created');
    }
    public destroy () {
        console.log('Car destroy');
    }
}
