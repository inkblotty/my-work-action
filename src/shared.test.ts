import { formatDate } from './shared';

describe('formatDate', () => {
    test('formats correctly', () => {
        const expectedOutput = 'Sept 29, 2020';
        expect(formatDate(new Date(expectedOutput))).toEqual(expectedOutput);
    });
});