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
function handleSingleUser(inputFields, username, startDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const startDateIso = startDate.toISOString();
        // query all the things
        const issuesCreated = yield (0, queries_1.getIssuesCreatedInRange)(inputFields, username, startDateIso);
        const issueComments = yield (0, queries_1.getIssueCommentsInRange)(inputFields, username, startDateIso);
        const prsCreated = yield (0, queries_1.getPRsCreated)(inputFields, username, startDateIso);
        const prComments = yield (0, queries_1.getPRCommentsInRange)(inputFields, username, startDateIso);
        // group all the things
        const prGroups = (0, groupPRs_1.default)(prsCreated, prComments);
        // format the groups into markdown
        const documentBody = (0, makeGroupsIntoMarkdown_1.default)([prGroups], username, startDate);
        // create a branch
        const { ref } = yield (0, openBranch_1.default)(inputFields, username);
        // open a PR
    });
}
exports.default = handleSingleUser;
//# sourceMappingURL=handleSingleUser.js.map