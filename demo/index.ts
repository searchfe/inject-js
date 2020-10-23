import 'reflect-metadata';
import { Container } from '../src/index';
import { Car } from './car.service';
import { Wheel } from './wheel.service';

const di = new Container();
di.addService(Car);
di.addService(Wheel);

const car = di.create(Car);

di.destroy();
