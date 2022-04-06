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
exports.getCommitsInRange = exports.getPRsReviewedInRange = exports.getDiscussionCommentsInRange = exports.getIssueCommentsInRange = exports.getPRCommentsInRange = exports.getDiscussionsCreatedInRange = exports.getIssuesCreatedInRange = exports.getPRsCreatedAndReviewedInRange = void 0;
const github = require("@actions/github");
const queryFilters_1 = require("./queryFilters");
const getPRsCreatedAndReviewedInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const allPRs = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const allRepoPRs = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/pulls', {
            owner: inputFields.owner,
            repo,
        });
        return {
            repo,
            // @ts-ignore
            data: (0, queryFilters_1.filterPRsByAuthorAndCreation)(allRepoPRs, username, sinceIso),
            type: 'prs-created',
        };
    })));
    return allPRs;
});
exports.getPRsCreatedAndReviewedInRange = getPRsCreatedAndReviewedInRange;
const getIssuesCreatedInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssues = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const allRepoIssues = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
            creator: username,
        });
        return {
            repo,
            data: allRepoIssues,
            type: 'issues-created',
        };
    })));
    return allIssues;
});
exports.getIssuesCreatedInRange = getIssuesCreatedInRange;
const getDiscussionsCreatedInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getDiscussionsCreatedInRange = getDiscussionsCreatedInRange;
const getPRCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getPRCommentsInRange = getPRCommentsInRange;
const getIssueCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
    const allRepos = inputFields.queried_repos.split(',');
    const allIssueComents = yield Promise.all(allRepos.map((repo) => __awaiter(void 0, void 0, void 0, function* () {
        const allRepoIssueComments = yield github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/issues/comments', {
            owner: inputFields.owner,
            repo,
            since: sinceIso,
        });
        console.log('allRepoIssueComments', allRepoIssueComments);
        return {
            repo,
            // @ts-ignore -- the type here is different than the docs
            data: (0, queryFilters_1.filterCommentsByUser)(allRepoIssueComments, username),
            type: 'issue-comments-created',
        };
    })));
    return allIssueComents;
});
exports.getIssueCommentsInRange = getIssueCommentsInRange;
const getDiscussionCommentsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getDiscussionCommentsInRange = getDiscussionCommentsInRange;
const getPRsReviewedInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getPRsReviewedInRange = getPRsReviewedInRange;
const getCommitsInRange = (inputFields, username, sinceIso) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getCommitsInRange = getCommitsInRange;
//# sourceMappingURL=queries.js.map