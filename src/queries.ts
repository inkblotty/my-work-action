import { graphql } from "@octokit/graphql";
import { filterCommentsByUser, filterCreatedThingByAuthorAndCreation, filterCommitsFromOtherUserOnPR } from './queryFilters';
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
          createdAt
          title
          url
          author {
            login
          }
          commits(first:10) {
            nodes {
              commit {
                url
                pushedDate
                author {
                  user {
                    login
                  }
                }
              }
            }
          }
          reviews(first: 10, author:$username) {
            nodes {
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
export const getAllWorkForRepository = async (requestOwner: string, repoName: string, username: string, sinceIso: string, secondaryPRsLabel: string): Promise<{ [key: string]: QueryGroup }> => {
    const { repository, prsCreated, prReviewsAndCommits } = await graphql(repositoryQuery, {
        username,
        owner: requestOwner,
        repo: repoName,
        sinceIso,
        prsCreatedQuery: `repo:${requestOwner}/${repoName} is:pr created:>=${sinceIso} author:${username}`,
        prContributionsQuery: `repo:${requestOwner}/${repoName} is:pr created:>=${sinceIso} -author:${username} label:${secondaryPRsLabel}`,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
    });
    console.log('query input', '\nsince iso:', sinceIso, '\nrepo', repoName, '\nowner', requestOwner)

    const flattenedIssueComments = repository.issueComments.nodes.reduce((arr, { comments: { nodes }}) => {
      return [...arr, ...nodes];
    }, []);
    const flattenedDiscussionComments = repository.discussionComments.nodes.reduce((arr, { comments: { nodes }}) => {
      return [...arr, ...nodes];
    }, []);
    const flattenedPRCommits = prReviewsAndCommits.edges.reduce((arr, { node }) => {
      const commitNodes = node.commits.nodes;
      return [...arr, ...commitNodes.map(commitNode => ({ ...commitNode, pullRequest: { author: node.author } }))]
    }, []);
    const flattenedPRComments = prReviewsAndCommits.edges.map(edge => edge.node.reviews.nodes.map(node => node.comments.nodes)).flat().flat();

    const commitsToOtherPRs = filterCommitsFromOtherUserOnPR(username, flattenedPRCommits);

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
            data: flattenedPRComments,
            type: QueryType['pr-comment-created']
        },
    }
}
