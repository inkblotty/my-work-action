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
`;
const getAllWorkForRepository = (requestOwner, repoName, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: { repository } } = yield (0, graphql_1.graphql)(repositoryQuery, {
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
    // 
    const commitsToOthersPRs = (0, queryFilters_1.filterCreatedThingByAuthorAndCreation)(repository.pullRequests.nodes.commits.nodes, username, sinceIso, true);
    const createdPRs = (0, queryFilters_1.filterCreatedThingByAuthorAndCreation)(repository.pullRequests.nodes, username, sinceIso);
    const commentsOnOthersPRs = [];
    const createdIssues = repository.issues.nodes;
    const issueComments = (0, queryFilters_1.filterCommentsByUser)(repository.issueComments.nodes.comments, username);
    const createdDiscussions = (0, queryFilters_1.filterCreatedThingByAuthorAndCreation)(repository.discussions.nodes, username, sinceIso);
    const commentsOnDiscussions = (0, queryFilters_1.filterCreatedThingByAuthorAndCreation)(repository.discussionComments.nodes.comments.nodes, username, sinceIso);
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
            data: commitsToOthersPRs,
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