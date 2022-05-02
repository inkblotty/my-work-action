import * as prData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
    graphql: mockGraphQlFunction
}));

import { getAllWorkForRepository } from './queries';

describe('getAllWorkForRespository', () => {
    test('returns the PR data filtered correctly by username', async () => {
        mockGraphQlFunction.mockResolvedValue(prData);
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2022-03-01');
        console.log('result.prsCreated', result.prsCreated);
        expect(result).toBeTruthy();
    });
});
