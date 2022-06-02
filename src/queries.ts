import { graphql } from "@octokit/graphql";
import { filterCommentsByUser, filterCreatedThingByAuthorAndCreation, filterCommitsFromOtherUserOnPR, filterCommentsFromOtherUserOnPR } from './queryFilters';
import { QueryGroup, QueryType } from './shared.types';

const GH_TOKEN = process.env.GH_TOKEN;
const repositoryQuery = `\
query getUserWork($username:String!, $owner:String!, $repo:String!, $sinceIso: DateTime!, $prsCreatedQuery:String!, $prContributionsQuery:String!) {
  repository(owner: $owner, name: $repo) {
      ...repo
  }
  prsCreated:search(type: ISSUE, query: $prsCreatedQuery, first: 20) {
    edges {
      node {
        ... on PullRequest {
          title
          createdAt
          url
        }
      }
    }
  }
  prReviewsAndCommits:search(type: ISSUE, query: $prContributionsQuery, first: 20) {
    edges {
      node {
        ... on PullRequest {
          commits(first:20) {
            nodes {
              commit {
                url
                pushedDate
                author {
                  user {
                    login
                  }
                }
                associatedPullRequests(first:10, orderBy:{field:UPDATED_AT, direction:DESC}) {
                  nodes {
                    title
                    url
                    author {
                      login
                    }
                  }
                }
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
        comments(last:50) {
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
  }
`;
export const getAllWorkForRepository = async (requestOwner: string, repoName: string, username: string, sinceIso: string): Promise<{ [key: string]: QueryGroup }> => {
    const result = await graphql(repositoryQuery, {
        username,
        owner: requestOwner,
        repo: repoName,
        sinceIso,
        prsCreatedQuery: `repo:${repoName} is:pr created:>=${sinceIso} author:${username}`,
        prContributionsQuery: `repo:${repoName} is:pr created:>=${sinceIso} -author:${username}`,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
    });
    console.log('result', result);
    // @ts-ignore
    const { data: { repository, prsCreated, prReviewsAndCommits } } = result;

    const flattenedIssueComments = repository.issueComments.nodes.reduce((arr, { comments: { nodes }}) => {
      return [...arr, ...nodes];
    }, []);
    const flattenedDiscussionComments = repository.discussionComments.nodes.reduce((arr, { comments: { nodes }}) => {
      return [...arr, ...nodes];
    }, []);
    // TODO: Refactor to use `.reduce`?
    const flattenedPRCommits = prReviewsAndCommits.edges.map(edge => edge.node.commits.nodes).flat()
    const flattenedPRComments = prReviewsAndCommits.edges.map(edge => edge.node.reviews.nodes).flat()

    const commitsToOtherPRs = filterCommitsFromOtherUserOnPR(username, flattenedPRCommits);

    // Comments on PRs by another user
    const commentsOnOthersPRs = filterCommentsFromOtherUserOnPR(username, flattenedPRComments);

    const createdPRs = prsCreated.edges.map(edge => edge.node);
    const createdIssues = repository.issues.nodes;
    const issueComments = filterCommentsByUser(flattenedIssueComments, username);
    const createdDiscussions = filterCreatedThingByAuthorAndCreation(repository.discussions.nodes, username, sinceIso);
    const commentsOnDiscussions = filterCreatedThingByAuthorAndCreation(flattenedDiscussionComments, username, sinceIso);

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
            data: commitsToOtherPRs,
            type: QueryType['pr-commit']
        },
        prComments: {
            repo: repoName,
            data: commentsOnOthersPRs,
            type: QueryType['pr-comment-created']
        },
    }
}
