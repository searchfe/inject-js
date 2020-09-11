import { injectable } from '../../../dist/index';
import { QueryInfo } from './queryInfo.service';

@injectable
class LogService {
    constructor(queryInfo: QueryInfo) {
        console.log('depends:', queryInfo);
        console.log('log init');
    }
}