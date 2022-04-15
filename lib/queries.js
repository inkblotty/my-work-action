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
exports.getDiscussionCommentsInRange = exports.getIssueCommentsInRange = exports.getPRCommentsInRange = exports.getDiscussionsCreatedInRange = exports.getIssuesCreatedInRange = exports.getPRsCreated = void 0;
const github = require("@actions/github");
const queryFilters_1 = require("./queryFilters");
const shared_types_1 = require("./shared.types");
const getCommitsForPR = (inputFields, username, sinceIso, pr) => __awaiter(void 0, void 0, void 0, function* () {
    if (pr.user.login === username) {
        return;
    }
    const [repoUrl] = pr.html_url.split('/pull');
    const [_, repoName] = repoUrl.split('github.com/');
    const requestOwner = repoName.includes('/') ? repoName.split('/')[0] : inputFields.owner;
    const { data: allPrCommits } = yield github.getOctokit(process.env.GH_TOKEN).request(pr.commits_url, {
        owner: requestOwner,
        repo: repoName,
    });
    return {
        repo: repoName,
        titleData: {
            identifier: pr,
            title: pr.title,
            url: pr.html_url,
            username: pr.user.login,
        },
        data: (0, queryFilters_1.filterCommitsByAuthorAndCreation)(allPrCommits, username, sinceIso),
        type: shared_types_1.QueryType['commit'],
    };
});
const getPRsCreated = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const allSecondaryPRs = [];
    const allCreatedPRs = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const allRepoPRs = yield github.getOctokit(process.env.GH_TOKEN).paginate('GET /repos/{owner}/{repo}/pulls', {
            owner: requestOwner,
            repo: repoName,
            state: 'all',
        });
        allRepoPRs.forEach((pr) => __awaiter(void 0, void 0, void 0, function* () {
            const secondaryContribution = yield getCommitsForPR(inputFields, username, sinceIso, pr);
            if (secondaryContribution && secondaryContribution.data.length) {
                allSecondaryPRs.push(secondaryContribution);
            }
        }));
        return {
            repo,
            data: (0, queryFilters_1.filterPRsByAuthorAndCreation)(allRepoPRs, username, sinceIso),
            type: shared_types_1.QueryType['pr-created'],
        };
    })));
    return [...allCreatedPRs, ...allSecondaryPRs];
});
exports.getPRsCreated = getPRsCreated;
const getIssuesCreatedInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssues = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const { data: allRepoIssues } = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues', {
            owner: requestOwner,
            repo: repoName,
            since: sinceIso,
            creator: username,
        });
        return {
            repo,
            data: allRepoIssues,
            type: shared_types_1.QueryType['issue-created'],
        };
    })));
    return allIssues;
});
exports.getIssuesCreatedInRange = getIssuesCreatedInRange;
const getDiscussionsCreatedInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getDiscussionsCreatedInRange = getDiscussionsCreatedInRange;
const getPRCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const commentsGroupedByPr = {};
    yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const { data: allPRComments } = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls/comments', {
            owner: requestOwner,
            repo: repoName,
            since: sinceIso,
            state: 'all'
        });
        const filteredComments = (0, queryFilters_1.filterCommentsByUser)(allPRComments, username);
        filteredComments.forEach(comment => {
            const [prUrl] = comment.html_url.split('#');
            const [repoUrl, prNumber] = prUrl.split('/pull/');
            const [_, repoName] = repoUrl.split('github.com/');
            if (!commentsGroupedByPr[prUrl]) {
                commentsGroupedByPr[prUrl] = {
                    repo: repoName,
                    data: [],
                    titleData: {
                        identifier: comment.html_url,
                        title: `#${prNumber} in ${repo}`,
                        url: prUrl,
                        username: comment.user.login,
                    },
                    type: shared_types_1.QueryType['pr-comment-created'],
                };
            }
            commentsGroupedByPr[prUrl].data.push(comment);
        });
        return '';
    })));
    return Object.values(commentsGroupedByPr);
});
exports.getPRCommentsInRange = getPRCommentsInRange;
const getIssueCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const commentsGroupedByIssue = {};
    yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        const { data: allRepoIssueComments } = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues/comments', {
            owner: requestOwner,
            repo: repoName,
            since: sinceIso,
        });
        const filteredComments = (0, queryFilters_1.filterCommentsByUser)(allRepoIssueComments, username);
        filteredComments.forEach(comment => {
            const [issueUrl] = comment.html_url.split('#');
            const [repoUrl, issueNumber] = issueUrl.split('/issues/');
            const [_, repoName] = repoUrl.split('github.com/');
            if (!commentsGroupedByIssue[issueUrl]) {
                commentsGroupedByIssue[issueUrl] = {
                    repo: repoName,
                    data: [],
                    titleData: {
                        identifier: comment.html_url,
                        title: `#${issueNumber} in ${repo}`,
                        url: issueUrl,
                        username: comment.user.login,
                    },
                    type: shared_types_1.QueryType['issue-comment-created'],
                };
            }
            commentsGroupedByIssue[issueUrl].data.push(comment);
        });
        return;
    })));
    return Object.values(commentsGroupedByIssue);
});
exports.getIssueCommentsInRange = getIssueCommentsInRange;
const getDiscussionCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getDiscussionCommentsInRange = getDiscussionCommentsInRange;
//# sourceMappingURL=queries.js.map