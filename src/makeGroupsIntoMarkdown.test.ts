import * as prData from '../fixtures/getAllWorkResponse.fixture.json';
import makeGroupsIntoMarkdown from "./makeGroupsIntoMarkdown";

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

describe('makeGroupsIntoMarkdown', () => {
    beforeAll(async () => {
        mockGraphQlFunction.mockResolvedValue(prData);
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2021-12-01', 'Epic');
        mockData.issueComments = result.issueComments;
        mockData.issuesCreated = result.issuesCreated;
    });

    test('Correct issue URLs in handleIssueGroups', async () => {
        const result = await handleIssueGroups([mockData.issuesCreated], [mockData.issueComments]);

        const body = makeGroupsIntoMarkdown([result], "inkblotty", new Date('01 Jan 1970 00:00:00 GMT'));
        const lines = body.split('\n');

        let matches = 0;
        for (const line of lines) {
            const match = line.match(/Left comments on issue: \[.*?\]\((.*?)\) in /);
            if (match) {
                matches++;
                expect(match[1]).toMatch(/^https:\/\/github.com/);
            }
        }
        // If the number of matches is zero, it means that the fixture is incorrect, since we didn't actually test anything
        expect(matches).toBeGreaterThan(0);
    });
});
