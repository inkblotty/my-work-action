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

        expect(result.discussionsCreated.data.length).toEqual(2);
        expect(result.discussionComments.data.length).toEqual(26);

        expect(result.issuesCreated.data.length).toEqual(50);
        expect(result.issueComments.data.length).toEqual(52);

        expect(result.prsCreated.data.length).toEqual(16);
        console.log('results', result.prsCreated.data.length);
    });
});
