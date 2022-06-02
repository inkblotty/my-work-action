import * as prData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
    graphql: mockGraphQlFunction
}));

import { getAllWorkForRepository } from './queries';
import handleIssueGroups from './groupIssues';
import { QueryGroup } from './shared.types';

interface MockData {
    issuesCreated?: QueryGroup;
    issueComments?: QueryGroup;
}
let mockData: MockData = {};

describe('groupIssues', () => {
    beforeAll(async () => {
        mockGraphQlFunction.mockResolvedValue(prData);
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2021-12-01');
        mockData = result;
    });

    test('handleIssueGroups', async () => {
        const result = await handleIssueGroups([mockData.issuesCreated], [mockData.issueComments]);
        expect(result.primary['github/accessibility']).toBeTruthy();
        expect(result.primary['github/accessibility'].artifacts.length).toEqual(50);

        // number of issues commented on
        expect(Object.keys(result.secondary).length).toEqual(27);
    });
});
