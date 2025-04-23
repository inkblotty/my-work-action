import * as prData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
    graphql: mockGraphQlFunction
}));

import { getAllWorkForRepository } from './queries';

describe('getAllWorkForRespository', () => {
    test('returns the data filtered correctly by username and date', async () => {
        mockGraphQlFunction.mockResolvedValue(prData);
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2021-12-01');

        expect(result.discussionsCreated.data.length).toEqual(3);
        expect(result.discussionComments.data.length).toEqual(1); // the fixture has more, but only one is for inkblotty

        expect(result.issuesCreated.data.length).toEqual(50);
        // comments from other users and from earlier dates are filtered out
        expect(result.issueComments.data.length).toEqual(84);

        expect(result.prsCreated.data.length).toEqual(16);
        expect(result.prCommits.data.length).toEqual(0);
        expect(result.prComments.data.length).toEqual(12);

        const reviews = result.prComments.data.filter(comment => comment.url.includes('#review_'));
        const reviewComments = result.prComments.data.filter(comment => comment.url.includes('#discussion_'));
        expect(reviews.length).toBe(3);
        expect(reviewComments.length).toBe(9);
    });
});
