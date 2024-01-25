import { graphql } from "@octokit/graphql";
import { filterCreatedThingByAuthorAndCreation, filterCommitsFromOtherUserOnPR, filterCreatedThingByCreation, getProjectItemsForPRs, getProjectItemsForIssues, addProjectItemsToItems } from './queryFilters';
import { QueryGroup, QueryType } from './shared.types';

const GH_TOKEN = process.env.GH_TOKEN;
const repositoryQuery = `\
query getUserWork($username:String!, $owner:String!, $repo:String!, $sinceIso: DateTime!, $prsCreatedQuery:String!, $prContributionsQuery:String!, $addProjectFields:Boolean = false, $projectField:String = "") {
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
          closingIssuesReferences(first: 10) {
            edges {
              node {
                projectItems(first: 10) {
                  edges {
                    node {
                      project {
                        title
                      }
                      fieldValueByName(name: $projectField) @include(if: $addProjectFields) {
                        ... on ProjectV2ItemFieldSingleSelectValue {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
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
          author {
            login
          }
          closingIssuesReferences(first: 10) {
            edges {
              node {
                projectItems(first: 10) {
                  edges {
                    node {
                      project {
                        title
                      }
                      fieldValueByName(name: $projectField) @include(if: $addProjectFields) {
                        ... on ProjectV2ItemFieldSingleSelectValue {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
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
    discussions(last: 30, orderBy: { field:CREATED_AT, direction: DESC }) {
      nodes {
        author {
          login
        }
        createdAt
        number
        url
      }
    }
    discussionComments:discussions(last: 50, orderBy: { field:UPDATED_AT, direction: DESC }) {
      nodes {
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
    issues(last: 20, filterBy: {createdBy: $username, since: $sinceIso}, orderBy:{ field: CREATED_AT, direction:DESC }) {
      nodes {
        createdAt
        title
        url
        projectItems(first: 10) {
          edges {
            node {
              project {
                title
              }
              fieldValueByName(name: $projectField) @include(if: $addProjectFields) {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                }
              }
            }
          }
        }
      }
    }
    issueComments:issues(last:50, filterBy:{since:$sinceIso}) {
      nodes {
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
`;
export const getAllWorkForRepository = async (requestOwner: string, repoName: string, username: string, sinceIso: string, projectField?: string): Promise<{ [key: string]: QueryGroup }> => {
    const projectFieldVariables = projectField ? { addProjectFields: true, projectField } : {};
    console.log("[BR] projectFieldVariables", projectFieldVariables)
    const { repository, prsCreated, prReviewsAndCommits } = await graphql(repositoryQuery, {
        username,
        owner: requestOwner,
        repo: repoName,
        sinceIso,
        prsCreatedQuery: `repo:${requestOwner}/${repoName} is:pr created:>=${sinceIso} author:${username}`,
        prContributionsQuery: `repo:${requestOwner}/${repoName} is:pr created:>=${sinceIso} -author:${username} involves:${username}`,
        headers: {
            authorization: `token ${GH_TOKEN}`
        },
        ...projectFieldVariables
    });
    console.log('query input', '\nsince iso:', sinceIso, '\nrepo', repoName, '\nowner', requestOwner)

    const flattenedIssueComments = repository.issueComments.nodes.reduce((arr, { title, url, comments: { nodes }}) => {
      return [...arr, ...nodes.map(comment => ({ ...comment, issue: { title, url }}))];
    }, []);
    const flattenedDiscussionComments = repository.discussionComments.nodes.reduce((arr, { comments: { nodes }}) => {
      return [...arr, ...nodes];
    }, []);
    const flattenedPRCommits = prReviewsAndCommits.edges.reduce((arr, { node }) => {
      const commitNodes = node.commits.nodes;
      return [...arr, ...commitNodes.map(commitNode => ({ ...commitNode, pullRequest: { author: node.author } }))]
    }, []);
    const flattenedPRComments = prReviewsAndCommits.edges.map(edge => {
      const prTitle = edge.node.title;
      return edge.node.reviews.nodes.map(node => node.comments.nodes.map(comment => ({ ...comment, prTitle })));
    }).flat().flat();

    const commitsToOtherPRs = filterCommitsFromOtherUserOnPR(username, flattenedPRCommits);

    const createdPRs = prsCreated.edges.map(edge => edge.node);
    const createdIssues = filterCreatedThingByCreation(repository.issues.nodes, sinceIso);
    const issueComments = filterCreatedThingByAuthorAndCreation(flattenedIssueComments, username, sinceIso);
    const createdDiscussions = filterCreatedThingByAuthorAndCreation(repository.discussions.nodes, username, sinceIso);
    const commentsOnDiscussions = filterCreatedThingByAuthorAndCreation(flattenedDiscussionComments, username, sinceIso);

    const projectItemsForPRs = getProjectItemsForPRs(createdPRs, prReviewsAndCommits.edges.map(edge => edge.node));
    const projectItemsForIssues = getProjectItemsForIssues(repository.issues.nodes);

    const issuesCreatedWithProjectItems = addProjectItemsToItems(createdIssues, projectItemsForIssues);
    const issueCommentsWithProjectItems = addProjectItemsToItems(issueComments, projectItemsForIssues);
    const createdPRsWithProjectItems = addProjectItemsToItems(createdPRs, projectItemsForPRs);

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
            data: issuesCreatedWithProjectItems,
            type: QueryType['issue-created']
        },
        issueComments: {
            repo: repoName,
            data: issueCommentsWithProjectItems,
            type: QueryType['issue-comment-created'],
        },
        prsCreated: {
            repo: repoName,
            data: createdPRsWithProjectItems,
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
