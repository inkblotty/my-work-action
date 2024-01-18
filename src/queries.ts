import { graphql } from "@octokit/graphql";
import { filterCreatedThingByAuthorAndCreation, filterCommitsFromOtherUserOnPR, filterCreatedThingByCreation, filterItemsByRepo } from './queryFilters';
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
        repository {
          nameWithOwner
        }
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
        repository {
          nameWithOwner
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
        title
        createdAt
        number
        url
        repository {
          nameWithOwner
        }
      }
    }
  }
  discussionComments:search(type: DISCUSSION, query: $discussionsInvolvedQuery, first: 20) {
    nodes {
      ... on Discussion {
        title
        url
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
        repository {
          nameWithOwner
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
          repository {
            nameWithOwner
          }
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
          repository {
            nameWithOwner
          }
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
export const getAllWork = async (org: string | null, username: string, sinceIso: string, excluded_repos: string[], focused_repos: string[]): Promise<{ [key: string]: QueryGroup }> => {
  // TODO: add pagination
  // TODO: add issues closed & prs merged
  const orgFilter = org ? `org:${org}` : ``;
  const baseQuery = `${orgFilter} created:>=${sinceIso}`;
  console.log('query input', 'since iso:', sinceIso, 'username', username, 'org', org)

  const { issuesCreated, issuesComments, discussionsCreated, discussionComments, prsCreated, prReviewsAndCommits } = await graphql(repositoryQuery, {
      username,
      issuesCreatedQuery: `${baseQuery} is:issue author:${username}`,
      issuesInvolvedQuery: `${baseQuery} is:issue involves:${username}`,
      discussionsCreatedQuery: `${baseQuery} author:${username}`,
      discussionsInvolvedQuery: `${baseQuery} involves:${username}`,
      prsCreatedQuery: `${baseQuery} is:pr author:${username}`,
      prContributionsQuery: `${baseQuery} is:pr involves:${username} -author:${username}`,
      headers: {
          authorization: `token ${GH_TOKEN}`
      },
    });

    // ===
    // Filter results by excluded_repos & focused_repos
    issuesCreated.nodes = filterItemsByRepo(issuesCreated.nodes, excluded_repos, focused_repos)
    issuesComments.nodes = filterItemsByRepo(issuesComments.nodes, excluded_repos, focused_repos)
    discussionsCreated.nodes = filterItemsByRepo(discussionsCreated.nodes, excluded_repos, focused_repos)
    discussionComments.nodes = filterItemsByRepo(discussionComments.nodes, excluded_repos, focused_repos)
    prsCreated.edges = filterItemsByRepo(prsCreated.edges.map(item => item.node), excluded_repos, focused_repos).map(item => ({ node: item }))
    prReviewsAndCommits.edges = filterItemsByRepo(prReviewsAndCommits.edges.map(item => item.node), excluded_repos, focused_repos).map(item => ({ node: item }))
    // ===

    const flattenedIssueComments = issuesComments.nodes.reduce((arr, { title, url, repository, comments: { nodes } }) => {
      return [...arr, ...nodes.map(comment => ({ ...comment, issue: { title, url }}))];
    }, []);
    const flattenedDiscussionComments = discussionComments.nodes.reduce((arr, { title, url, comments: { nodes }}) => {
      return [...arr, ...nodes.map(comment => ({ ...comment, discussion: { title, url } }))];
    }, []);
    const flattenedPRCommits = prReviewsAndCommits.edges.reduce((arr, { node }) => {
      const commitNodes = node.commits.nodes;

      return [...arr, ...commitNodes.map(commitNode => ({ ...commitNode, pullRequest: { author: node.author, title: node.title, url: node.url } }))]
    }, []);
    const flattenedPRComments = prReviewsAndCommits.edges.reduce((arr, { node }) => {
      const commentsNodes = node.reviews.nodes.map(review => review.comments.nodes).flat();

      return [...arr, ...commentsNodes.map(commitNode => ({ ...commitNode, pullRequest: { author: node.author, title: node.title, url: node.url } }))]
    }, []);

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
