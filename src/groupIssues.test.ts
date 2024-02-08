import * as prData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
    graphql: mockGraphQlFunction
}));

import { getAllWorkForRepository } from './queries';
import handleIssueGroups from './groupIssues';
import { QueryGroup } from './shared.types';

interface MockData {
    issuesCreated: QueryGroup;
    issueComments: QueryGroup;
}
const mockData: MockData = {
    issuesCreated: {} as QueryGroup,
    issueComments: {} as QueryGroup,
};

describe('groupIssues', () => {
    beforeAll(async () => {
        mockGraphQlFunction.mockResolvedValue(prData);
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2021-12-01', 'Epic');
        mockData.issueComments = result.issueComments;
        mockData.issuesCreated = result.issuesCreated;
    });

    test('handleIssueGroups', async () => {
        const result = await handleIssueGroups([mockData.issuesCreated], [mockData.issueComments]);

        expect(result.primary['github/accessibility']).toBeTruthy();
        expect(result.primary['github/accessibility'].artifacts.length).toEqual(50);
        expect(result.primary['github/accessibility'].artifacts[0].projectItems.length).toEqual(1);
        expect(result.primary['github/accessibility'].artifacts[0].projectItems[0].projectName).toEqual('Accessibility');
        expect(result.primary['github/accessibility'].artifacts[0].projectItems[0].projectItemName).toEqual('In Progress');
        expect(result.primary['github/accessibility'].artifacts[1].projectItems.length).toEqual(0);
        expect(result.primary['github/accessibility'].artifacts[2].projectItems.length).toEqual(0);

        // number of issues commented on by inkblotty since Dec 1, 2021
        expect(Object.keys(result.secondary).length).toEqual(37);
    });
});
