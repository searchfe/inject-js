import { Data } from './data';

export interface Controller {
  render(data: Data): string;
}
