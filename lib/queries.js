"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWorkForRepository = void 0;
const graphql_1 = require("@octokit/graphql");
const queryFilters_1 = require("./queryFilters");
const shared_types_1 = require("./shared.types");
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
const getAllWorkForRepository = (requestOwner, repoName, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const { repository, prsCreated, prReviewsAndCommits } = yield (0, graphql_1.graphql)(repositoryQuery, {
        username,
        owner: requestOwner,
        repo: repoName,
        sinceIso,
        prsCreatedQuery: `repo:${requestOwner}/${repoName} is:pr created:>=${sinceIso} author:${username}`,
        prContributionsQuery: `repo:${requestOwner}/${repoName} is:pr created:>=${sinceIso} -author:${username}`,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
    });
    console.log('query input', '\nsince iso:', sinceIso, '\nrepo', repoName, '\nowner', requestOwner);
    console.log('query result', '\nrepository: ', repository, '\nprsCreated: ', prsCreated, '\nprReviewsAndCommits: ', prReviewsAndCommits);
    const flattenedIssueComments = repository.issueComments.nodes.reduce((arr, { comments: { nodes } }) => {
        return [...arr, ...nodes];
    }, []);
    const flattenedDiscussionComments = repository.discussionComments.nodes.reduce((arr, { comments: { nodes } }) => {
        return [...arr, ...nodes];
    }, []);
    // TODO: Refactor to use `.reduce`?
    const flattenedPRCommits = prReviewsAndCommits.edges.map(edge => edge.node.commits.nodes).flat();
    const flattenedPRComments = prReviewsAndCommits.edges.map(edge => edge.node.reviews.nodes).flat();
    const commitsToOtherPRs = (0, queryFilters_1.filterCommitsFromOtherUserOnPR)(username, flattenedPRCommits);
    // Comments on PRs by another user
    const commentsOnOthersPRs = (0, queryFilters_1.filterCommentsFromOtherUserOnPR)(username, flattenedPRComments);
    const createdPRs = prsCreated.edges.map(edge => edge.node);
    const createdIssues = repository.issues.nodes;
    const issueComments = (0, queryFilters_1.filterCommentsByUser)(flattenedIssueComments, username);
    const createdDiscussions = (0, queryFilters_1.filterCreatedThingByAuthorAndCreation)(repository.discussions.nodes, username, sinceIso);
    const commentsOnDiscussions = (0, queryFilters_1.filterCreatedThingByAuthorAndCreation)(flattenedDiscussionComments, username, sinceIso);
    return {
        discussionsCreated: {
            repo: repoName,
            data: createdDiscussions,
            type: shared_types_1.QueryType['discussion-created'],
        },
        discussionComments: {
            repo: repoName,
            data: commentsOnDiscussions,
            type: shared_types_1.QueryType['discussion-comment-created']
        },
        issuesCreated: {
            repo: repoName,
            data: createdIssues,
            type: shared_types_1.QueryType['issue-created']
        },
        issueComments: {
            repo: repoName,
            data: issueComments,
            type: shared_types_1.QueryType['issue-comment-created'],
        },
        prsCreated: {
            repo: repoName,
            data: createdPRs,
            type: shared_types_1.QueryType['pr-created'],
        },
        prCommits: {
            repo: repoName,
            data: commitsToOtherPRs,
            type: shared_types_1.QueryType['pr-commit']
        },
        prComments: {
            repo: repoName,
            data: commentsOnOthersPRs,
            type: shared_types_1.QueryType['pr-comment-created']
        },
    };
});
exports.getAllWorkForRepository = getAllWorkForRepository;
//# sourceMappingURL=queries.js.map