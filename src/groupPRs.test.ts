import * as prData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
    graphql: mockGraphQlFunction
}));

import { getAllWorkForRepository } from './queries';
import handlePRGroups from './groupPRs';
import { QueryGroup } from './shared.types';

interface MockData {
    prsCreated?: QueryGroup;
    prComments?: QueryGroup;
    prCommits?: QueryGroup;
}
let mockData: MockData = {};

describe('groupPRs', () => {
    beforeAll(async () => {
        mockGraphQlFunction.mockResolvedValue(prData);
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2021-12-01', '');
        mockData = result;
    });

    test('handlePRGroups', async () => {
        const result = await handlePRGroups([mockData.prsCreated], [mockData.prComments], [mockData.prCommits]);
        expect(result.primary['github/accessibility']).toBeTruthy();
        expect(result.primary['github/accessibility'].artifacts.length).toEqual(16);

        // interacted with 1 PR secondarily
        expect(Object.keys(result.secondary).length).toEqual(1);
    });
});
