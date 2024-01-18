import { graphql } from "@octokit/graphql";
import { filterCreatedThingByAuthorAndCreation, filterCommitsFromOtherUserOnPR, filterCreatedThingByCreation } from './queryFilters';
import { QueryGroup, QueryType } from './shared.types';

const GH_TOKEN = process.env.GH_TOKEN;
const repositoryQuery = `\
query getUserWork($username:String!, $issuesCreatedQuery:String!, $issuesInvolvedQuery:String!, $discussionsCreatedQuery:String!, $discussionsInvolvedQuery:String!, $prsCreatedQuery:String!, $prContributionsQuery:String!) {
  issuesCreated:search(type: ISSUE, query: $issuesCreatedQuery, first: 20) {
    nodes {
      ... on Issue {
        title
        createdAt
        url
      }
    }
  }
  issuesComments:search(type: ISSUE, query: $issuesInvolvedQuery, first: 20) {
    nodes {
      ... on Issue {
        title
        url
        comments(last:30) {
          nodes {
            createdAt
            author {
              login
            }
            url
          }
        }
      }
    }
  }

  discussionsCreated:search(type: DISCUSSION, query: $discussionsCreatedQuery, first: 20) {
    nodes {
      ... on Discussion {
        author {
          login
        }
        createdAt
        number
        url
      }
    }
  }
  discussionComments:search(type: DISCUSSION, query: $discussionsInvolvedQuery, first: 20) {
    nodes {
      ... on Discussion {
        comments(last:30) {
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
`;
export const getAllWork = async (username: string, sinceIso: string): Promise<{ [key: string]: QueryGroup }> => {
  // TODO: add pagination
  // TODO: add issues closed & prs merged
  const { issuesCreated, issuesComments, discussionsCreated, discussionComments, prsCreated, prReviewsAndCommits } = await graphql(repositoryQuery, {
      username,
      issuesCreatedQuery: `is:issue created:>=${sinceIso} author:${username}`,
      issuesInvolvedQuery: `is:issue created:>=${sinceIso} involves:${username}`,
      discussionsCreatedQuery: `created:>=${sinceIso} author:${username}`,
      discussionsInvolvedQuery: `created:>=${sinceIso} involves:${username}`,
      prsCreatedQuery: `is:pr created:>=${sinceIso} author:${username}`,
      prContributionsQuery: `is:pr created:>=${sinceIso} involves:${username} -author:${username}`,
      headers: {
          authorization: `token ${GH_TOKEN}`
      },
    });
    console.log('query input', '\nsince iso:', sinceIso, '\nusername', username)

    const flattenedIssueComments = issuesComments.nodes.reduce((arr, { title, url, comments: { nodes }}) => {
      return [...arr, ...nodes.map(comment => ({ ...comment, issue: { title, url }}))];
    }, []);
    const flattenedDiscussionComments = discussionComments.nodes.reduce((arr, { comments: { nodes }}) => {
      return [...arr, ...nodes];
    }, []);
    const flattenedPRCommits = prReviewsAndCommits.edges.reduce((arr, { node }) => {
      const commitNodes = node.commits.nodes;

      return [...arr, ...commitNodes.map(commitNode => ({ ...commitNode, pullRequest: { author: node.author, title: node.title, url: node.url } }))]
    }, []);
    const flattenedPRComments = prReviewsAndCommits.edges.map(edge => edge.node.reviews.nodes.map(node => node.comments.nodes)).flat().flat();

    const commitsToOtherPRs = filterCommitsFromOtherUserOnPR(username, flattenedPRCommits);

    const createdPRs = prsCreated.edges.map(edge => edge.node);
    const createdIssues = issuesCreated.nodes;
    const issueComments = filterCreatedThingByAuthorAndCreation(flattenedIssueComments, username, sinceIso);
    const createdDiscussions = discussionsCreated.nodes;
    const commentsOnDiscussions = filterCreatedThingByAuthorAndCreation(flattenedDiscussionComments, username, sinceIso);

    return {
        discussionsCreated: {
            data: createdDiscussions,
            type: QueryType['discussion-created'],
        },
        discussionComments: {
            data: commentsOnDiscussions,
            type: QueryType['discussion-comment-created']
        },
        issuesCreated: {
            data: createdIssues,
            type: QueryType['issue-created']
        },
        issueComments: {
            data: issueComments,
            type: QueryType['issue-comment-created'],
        },
        prsCreated: {
            data: createdPRs,
            type: QueryType['pr-created'],
        },
        prCommits: {
            data: commitsToOtherPRs,
            type: QueryType['pr-commit']
        },
        prComments: {
            data: flattenedPRComments,
            type: QueryType['pr-comment-created']
        },
    }
}
