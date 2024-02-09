import * as discussionData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
    graphql: mockGraphQlFunction
}));

import { getAllWorkForRepository } from './queries';
import handleDiscussionGroups from './groupDiscussions';
import { QueryGroup } from './shared.types';

interface MockData {
    discussionsCreated: QueryGroup;
    discussionComments: QueryGroup;
}
const mockData: MockData = {
    discussionsCreated: {} as QueryGroup,
    discussionComments: {} as QueryGroup,
};

describe('groupDiscussions', () => {
    beforeAll(async () => {
        mockGraphQlFunction.mockResolvedValue(discussionData);
        const result = await getAllWorkForRepository('github', 'accessibility', 'inkblotty', '2021-12-01');
        mockData.discussionComments = result.discussionComments;
        mockData.discussionsCreated = result.discussionsCreated;
    });

    test('handleDiscussionGroups', async () => {
        const result = await handleDiscussionGroups([mockData.discussionsCreated], [mockData.discussionComments]);

        console.log(result)
        expect(result.primary['github/issues']).toBeTruthy();
        expect(result.primary['github/issues'].artifacts.length).toEqual(3);

        // number of discussions commented on by inkblotty since Dec 1, 2021
        expect(Object.keys(result.secondary).length).toEqual(1);
    });
});
