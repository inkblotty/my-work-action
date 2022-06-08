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
const groupPRs_1 = require("./groupPRs");
const queries_1 = require("./queries");
const makeGroupsIntoMarkdown_1 = require("./makeGroupsIntoMarkdown");
const openBranch_1 = require("./openBranch");
const commitToBranch_1 = require("./commitToBranch");
const openPR_1 = require("./openPR");
const createPRContent_1 = require("./createPRContent");
const groupIssues_1 = require("./groupIssues");
function handleSingleUser(inputFields, username, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const startDateIso = startDate.toISOString();
        const reposList = inputFields.queried_repos.split(',');
        const discussionComments = [];
        const discussionsCreated = [];
        const issuesCreated = [];
        const issueComments = [];
        const prComments = [];
        const prCommits = [];
        const prsCreated = [];
        yield Promise.all(reposList.map((repo) => __awaiter(this, void 0, void 0, function* () {
            const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
            // query all the things
            const repoData = yield (0, queries_1.getAllWorkForRepository)(requestOwner, repoName, username, startDateIso);
            discussionComments.push(repoData.discussionComments);
            discussionsCreated.push(repoData.discussionsCreated);
            issuesCreated.push(repoData.issuesCreated);
            issueComments.push(repoData.issueComments);
            prComments.push(repoData.prComments);
            prCommits.push(repoData.prCommits);
            prsCreated.push(repoData.prsCreated);
        })));
        // group all the things
        const prGroups = (0, groupPRs_1.default)(prsCreated, prComments, prCommits);
        const issueGroups = (0, groupIssues_1.default)(issuesCreated, issueComments);
        console.log('prGroups', prGroups);
        console.log('issueGroups', issueGroups);
        // format the groups into markdown
        const documentBody = (0, makeGroupsIntoMarkdown_1.default)([prGroups, issueGroups], username, startDate);
        // create a branch
        const { ref } = yield (0, openBranch_1.default)(inputFields, username);
        // commit to branch
        yield (0, commitToBranch_1.default)(inputFields, username, ref.id, ref.target.oid, documentBody);
        // open a PR
        const body = (0, createPRContent_1.createPRBodyText)(startDate, new Date(), username);
        return (0, openPR_1.default)(inputFields, username, ref.name, body);
    });
}
exports.default = handleSingleUser;
//# sourceMappingURL=handleSingleUser.js.map