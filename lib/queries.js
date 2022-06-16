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
        createdAt
        title
        url
      }
    }
    issueComments:issues(last:100, filterBy:{since:$sinceIso}) {
      nodes {
        comments(last:50) {
          nodes {
            createdAt
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
const getAllWorkForRepository = (requestOwner, repoName, username, sinceIso, secondaryPRsLabel) => __awaiter(void 0, void 0, void 0, function* () {
    const { repository, prsCreated, prReviewsAndCommits } = yield (0, graphql_1.graphql)(repositoryQuery, {
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
    console.log('query input', '\nsince iso:', sinceIso, '\nrepo', repoName, '\nowner', requestOwner);
    const flattenedIssueComments = repository.issueComments.nodes.reduce((arr, { comments: { nodes } }) => {
        return [...arr, ...nodes];
    }, []);
    const flattenedDiscussionComments = repository.discussionComments.nodes.reduce((arr, { comments: { nodes } }) => {
        return [...arr, ...nodes];
    }, []);
    const flattenedPRCommits = prReviewsAndCommits.edges.reduce((arr, { node }) => {
        const commitNodes = node.commits.nodes;
        return [...arr, ...commitNodes.map(commitNode => (Object.assign(Object.assign({}, commitNode), { pullRequest: { author: node.author } })))];
    }, []);
    const flattenedPRComments = prReviewsAndCommits.edges.map(edge => edge.node.reviews.nodes.map(node => node.comments.nodes)).flat().flat();
    const commitsToOtherPRs = (0, queryFilters_1.filterCommitsFromOtherUserOnPR)(username, flattenedPRCommits);
    const createdPRs = prsCreated.edges.map(edge => edge.node);
    const createdIssues = (0, queryFilters_1.filterCreatedThingByCreation)(repository.issues.nodes, sinceIso);
    const issueComments = (0, queryFilters_1.filterCreatedThingByAuthorAndCreation)(flattenedIssueComments, username, sinceIso);
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
            data: flattenedPRComments,
            type: shared_types_1.QueryType['pr-comment-created']
        },
    };
});
exports.getAllWorkForRepository = getAllWorkForRepository;
//# sourceMappingURL=queries.js.map