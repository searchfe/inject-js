import { injectable } from '../../../dist/index';

@injectable
export class QueryInfo {
    constructor() {
        console.log('queryInfo init');
    }
}