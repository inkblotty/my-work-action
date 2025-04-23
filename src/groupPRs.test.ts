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
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2021-12-01');
        mockData = result;
    });

    test('handlePRGroups', async () => {
        const result = await handlePRGroups([mockData.prsCreated], [mockData.prComments], [mockData.prCommits]);
        expect(result.primary['github/accessibility']).toBeTruthy();
        expect(result.primary['github/accessibility'].artifacts.length).toEqual(16);

        // interacted with 3 PRs secondarily
        expect(Object.keys(result.secondary).length).toEqual(3);

        // Check that secondary group artifacts (aka comments) have the correct properties
        Object.entries(result.secondary).forEach(([prURL, group]) => {
            group.artifacts.forEach((artifact) => {
                expect(artifact).toHaveProperty('title');
                expect(artifact).toHaveProperty('url');
                expect(artifact.title).toMatch(/^#/);
                expect(artifact.url).toMatch(new RegExp(`${prURL}#(review_|discussion_)`));
            });
        });

        // Hardcode expected counts based on fixture data
        const expectedCommentCountsByPR = {
            "https://github.com/github/accessibility-scorecard/pull/6": 1, // 1 review + 0 comments
            "https://github.com/github/accessibility-scorecard/pull/12": 9, // 3 reviews + 9 comments
            "https://github.com/github/accessibility-scorecard/pull/13": 1, // 1 review + 0 comments
        };

        Object.keys(result.primary).forEach((primaryKey) => {
            const secondaryGroup = result.secondary[primaryKey];
            if (!secondaryGroup) return; // Skip if secondaryGroup is undefined

            const expectedCommentCount = expectedCommentCountsByPR[primaryKey];
            expect(secondaryGroup.artifacts.length).toEqual(expectedCommentCount);
        });
    });
});
