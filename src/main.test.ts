import * as prData from '../fixtures/getAllWorkResponse.fixture.json';

const mockGraphQlFunction = jest.fn();
jest.mock('@octokit/graphql', () => ({
  graphql: mockGraphQlFunction
}));

jest.mock('@actions/core')
jest.mock('@actions/github')

import * as github from '@actions/github'
import * as core from '@actions/core'
import run from './main'

const getOctokit = github.getOctokit as any;
const requestMock = jest.fn(() => ({
  data: {
    node_id: '',
    commit: {
      sha: '',
    },
  },
}));
getOctokit.mockReturnValue({
  request: requestMock,
});

const configureInput = (
  mockInput: Partial<{
    'owner': string;
    'queried_repos': string;
    'repo': string;
    'timespan': string;
    'usernames': string;
    'project_field': string;
    'destination_branch': string;
    'draft_pr': boolean;
  }>
) => {
  jest
    .spyOn(core, 'getInput')
    .mockImplementation((name: string, ...opts) => String(mockInput[name]));
  jest
    .spyOn(core, 'getBooleanInput')
    .mockImplementation((name: string, ...opts) => mockInput[name]);
};


describe('run', () => {
    beforeAll(async () => {
      mockGraphQlFunction.mockResolvedValue({ ...prData, createRef: { ref: { id: '', name: '', target: { oid: '' } } } });
    })
    
    afterAll(() => jest.restoreAllMocks());
    
    test('opens non-draft PR when draft_pr input is false', async () => {
      configureInput({
        owner: 'inkblotty',
        repo: 'inkblotty/test',
        queried_repos: 'github/accessibility',
        usernames: 'inkblotty',
        draft_pr: false,
      });

      await run();

      expect(requestMock).toHaveBeenCalledWith("POST /repos/{owner}/{repo}/pulls", expect.objectContaining({
        draft: false, 
      }));
    });

    test('opens draft PR when draft_pr input is true', async () => {
      configureInput({
        owner: 'inkblotty',
        repo: 'inkblotty/test',
        queried_repos: 'github/accessibility',
        usernames: 'inkblotty',
        draft_pr: true,
      });

      await run();

      expect(requestMock).toHaveBeenCalledWith("POST /repos/{owner}/{repo}/pulls", expect.objectContaining({
        draft: true, 
      }));
    });

    test('opens draft PR when draft_pr input is unspecified', async () => {
      configureInput({
        owner: 'inkblotty',
        repo: 'inkblotty/test',
        queried_repos: 'github/accessibility',
        usernames: 'inkblotty',
      });

      await run();

      expect(requestMock).toHaveBeenCalledWith("POST /repos/{owner}/{repo}/pulls", expect.objectContaining({
        draft: true, 
      }));
    });
});
