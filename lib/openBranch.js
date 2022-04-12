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
const createRefMutation = `\
mutation myCreateRef($input: CreateRefInput!) {
    createRef(input: $input) {
        ref {
            id
            name
        }
    }
}
`;
const openBranch = ({ owner, repo }, username) => __awaiter(void 0, void 0, void 0, function* () {
    const now = (new Date()).getTime();
    const branchName = `temp/my-work-${username}-${now}`;
    const branchData = {
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    return (0, graphql_1.graphql)(createRefMutation, branchData);
});
exports.default = openBranch;
//# sourceMappingURL=openBranch.js.map