import {expectType, expectError} from '../../../../index.js';
import one from './';

expectType<string>(one('foo', 'bar'));
expectType<number>(one(1, 2));
expectError(one(1, 2));
