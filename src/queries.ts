import { graphql } from "@octokit/graphql";
import { filterCommentsByUser, filterCreatedThingByAuthorAndCreation, getIsWithinRange } from './queryFilters';
import { InputFields, QueryGroup, QueryType } from './shared.types';

const GH_TOKEN = process.env.GH_TOKEN;
const repositoryQuery = `\
query getUserWork($username:String!, $owner:String!, $repo:String!, $sinceIso: String!, $prsCreated:String!, $prContributions:String!) { 
    repository(owner: $owner, name: $repo) {
        ...repo
    }
}

fragment repo on Repository {
    discussions(last: 50, orderBy: { field:CREATED_AT, direction: DESC }) {
      nodes {
        author {
          login
        }
        createdAt
        number
        url
      }
    }
    discussionComments:discussions(last: 100, orderBy: { field:UPDATED_AT, direction: DESC }) {
      nodes {
        comments(last:100) {
          nodes {
              author {
              login
            }
            bodyText
            createdAt
            url 
          }
        }
      }
    }
    issues(last: 50, filterBy: {createdBy: $username, since: $sinceIso}, orderBy:{ field: CREATED_AT, direction:DESC }) {
      nodes {
        title
        url
      }
    }
    issueComments:issues(last:100, filterBy:{since:$sinceIso}) {
      nodes {
        comments {
          nodes {
            author {
              login
            }
            issue {
              title
              url
            }
            url
          }
        }
      }
    }
    prsCreated:search(type: ISSUE, query: $prQuery, first: 20) {
      edges {
        node {
          ... on PullRequest {
            title
            createdAt
            title
            url
          }
        }
      }
    }
    prReviewsAndCommits:search(type: ISSUE, query: $prContributions, first: 100) {
      edges {
        node {
          ... on PullRequest {
            commits(first:100) {
              nodes {
                commit {
                  url
                  pushedDate
                }
              }
            }
            reviews(first: 50, author:$username) {
              nodes {
                createdAt
                pullRequest {
                  createdAt
                  title
                  url
                  author {
                    login
                  }
                }
                comments(first: 20) {
                  nodes {
                    createdAt
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
export const getAllWorkForRepository = async (requestOwner: string, repoName: string, username: string, sinceIso: string): Promise<{ [key: string]: QueryGroup }> => {
    const { data: { repository } } = await graphql(repositoryQuery, {
        username,
        owner: requestOwner,
        repo: repoName,
        sinceIso,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
    });
    console.log('data.repository', repository);
    return {};
    const commitsToOthersPRs = filterCreatedThingByAuthorAndCreation(repository.pullRequests.nodes.commits.nodes, username, sinceIso, true);
    const createdPRs = filterCreatedThingByAuthorAndCreation(repository.pullRequests.nodes, username, sinceIso);
    const commentsOnOthersPRs = [];
    const createdIssues = repository.issues.nodes;
    const issueComments = filterCommentsByUser(repository.issueComments.nodes.comments, username);
    const createdDiscussions = filterCreatedThingByAuthorAndCreation(repository.discussions.nodes, username, sinceIso);
    const commentsOnDiscussions = filterCreatedThingByAuthorAndCreation(repository.discussionComments.nodes.comments.nodes, username, sinceIso);

    return {
        discussionsCreated: {
            repo: repoName,
            data: createdDiscussions,
            type: QueryType['discussion-created'],
        },
        discussionComments: {
            repo: repoName,
            data: commentsOnDiscussions,
            type: QueryType['discussion-comment-created']
        },
        issuesCreated: {
            repo: repoName,
            data: createdIssues,
            type: QueryType['issue-created']
        },
        issueComments: {
            repo: repoName,
            data: issueComments,
            type: QueryType['issue-comment-created'],
        },
        prsCreated: {
            repo: repoName,
            data: createdPRs,
            type: QueryType['pr-created'],
        },
        prCommits: {
            repo: repoName,
            data: commitsToOthersPRs,
            type: QueryType['pr-commit']
        },
        prComments: {
            repo: repoName,
            data: commentsOnOthersPRs,
            type: QueryType['pr-comment-created']
        },
    }
}
