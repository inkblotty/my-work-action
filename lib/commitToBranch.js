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
const graphql_1 = require("@octokit/graphql");
const shared_1 = require("./shared");
const commitMutation = `\
mutation myCreateCommitOnBranch($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) {
        ref {
            id
        }
    }
}
`;
const commitToBranch = ({ owner, repo }, username, branchNodeId, branchSha, documentBody) => __awaiter(void 0, void 0, void 0, function* () {
    const now = (new Date()).toISOString();
    const commitMessage = 'Generated commit from my-work-action';
    const changeData = {
        owner,
        repo,
        input: {
            branch: {
                id: branchNodeId,
            },
            expectedHeadOid: branchSha,
            fileChanges: {
                additions: [{
                        path: `my-work/${username}/${now}.md`,
                        contents: (0, shared_1.base64encode)(documentBody),
                    }],
            },
            message: { to_h: commitMessage },
        },
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    return (0, graphql_1.graphql)(commitMutation, changeData);
});
exports.default = commitToBranch;
//# sourceMappingURL=commitToBranch.js.map