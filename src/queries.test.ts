import * as prData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
    graphql: mockGraphQlFunction
}));

import { getAllWorkForRepository } from './queries';

describe('getAllWorkForRespository', () => {
    beforeEach(() => {
        mockGraphQlFunction.mockReset();
    });

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

    test.each(['', 'Approved after reviewing the changes'])(
        'includes reviews submitted within the reporting window on older PRs (body: %p)',
        async body => {
            const sinceIso = '2026-11-16T05:01:06.866Z';
            const review = {
                body,
                createdAt: '2026-11-13T15:00:00Z',
                submittedAt: sinceIso,
                url: 'https://github.com/octo-org/project/pull/123#pullrequestreview-1',
                comments: { nodes: [] }
            };
            const pullRequest = {
                ...prData.prReviewsAndCommits.edges[0].node,
                createdAt: '2026-11-13T14:46:57Z',
                reviews: { nodes: [review] }
            };
            mockGraphQlFunction.mockImplementation(async (_, variables) => ({
                ...prData,
                prReviewsAndCommits: {
                    edges: variables.prContributionsQuery.includes(`updated:>=${sinceIso}`)
                        ? [{ node: pullRequest }]
                        : []
                }
            }));

            const result = await getAllWorkForRepository('octo-org', 'project', 'reviewer', sinceIso);

            expect(result.prComments.data).toEqual([{ ...review, prTitle: pullRequest.title }]);
        }
    );

    test('excludes older reviews and comments while retaining recent comments on older reviews', async () => {
        const oldDate = '2026-11-15T12:00:00Z';
        const recentComment = {
            createdAt: '2026-11-17T14:12:47Z',
            url: 'https://github.com/octo-org/project/pull/123#discussion_r1'
        };
        const oldReview = {
            body: 'Reviewed before the reporting window',
            createdAt: oldDate,
            submittedAt: oldDate,
            url: 'https://github.com/octo-org/project/pull/123#pullrequestreview-1',
            comments: {
                nodes: [
                    { ...recentComment, createdAt: oldDate, url: `${recentComment.url}-old` },
                    recentComment
                ]
            }
        };
        const pullRequest = {
            ...prData.prReviewsAndCommits.edges[0].node,
            reviews: {
                nodes: [
                    oldReview,
                    { ...oldReview, body: '', comments: { nodes: [] } },
                    {
                        ...oldReview,
                        createdAt: recentComment.createdAt,
                        submittedAt: null,
                        comments: { nodes: [recentComment] }
                    }
                ]
            }
        };
        mockGraphQlFunction.mockResolvedValue({
            ...prData,
            prReviewsAndCommits: { edges: [{ node: pullRequest }] }
        });

        const result = await getAllWorkForRepository('octo-org', 'project', 'reviewer', '2026-11-16T05:01:06.866Z');

        expect(result.prComments.data).toEqual([{ ...recentComment, prTitle: pullRequest.title }]);
    });
});
