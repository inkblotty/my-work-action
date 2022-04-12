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
    const { data: allPrCommits } = yield github.getOctokit(process.env.GH_TOKEN).request(pr.commits_url, {
        owner: inputFields.owner,
        repo: pr.repo.name,
    });
    return {
        repo: pr.repo.full_name,
        titleData: {
            identifier: pr,
            title: pr.title,
            url: pr.html_url,
            username: pr.user.login,
        },
        data: (0, queryFilters_1.filterCommitsByAuthorAndCreation)(allPrCommits, username, sinceIso, true),
        type: shared_types_1.QueryType['commit'],
    };
});
const getPRsCreated = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const allSecondaryPRs = [];
    const allCreatedPRs = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const { data: allRepoPRs } = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls', {
            owner: inputFields.owner,
            repo,
        });
        // @ts-ignore
        yield Promise.all(allRepoPRs.forEach((pr) => __awaiter(void 0, void 0, void 0, function* () {
            const secondaryContribution = yield getCommitsForPR(inputFields, username, sinceIso, pr);
            if (secondaryContribution) {
                allSecondaryPRs.push(secondaryContribution);
            }
        })));
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
        const { data: allRepoIssues } = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues', {
            owner: inputFields.owner,
            repo,
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
    const allPRs = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const { data: allPRComments } = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls/comments', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
        });
        return {
            repo,
            data: (0, queryFilters_1.filterCommentsByUser)(allPRComments, username),
            type: shared_types_1.QueryType['pr-comment-created'],
        };
    })));
    return allPRs;
});
exports.getPRCommentsInRange = getPRCommentsInRange;
const getIssueCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssueComents = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const { data: allRepoIssueComments } = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues/comments', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
        });
        return {
            repo,
            data: (0, queryFilters_1.filterCommentsByUser)(allRepoIssueComments, username),
            type: shared_types_1.QueryType['issue-comment-created'],
        };
    })));
    return allIssueComents;
});
exports.getIssueCommentsInRange = getIssueCommentsInRange;
const getDiscussionCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getDiscussionCommentsInRange = getDiscussionCommentsInRange;
//# sourceMappingURL=queries.js.map