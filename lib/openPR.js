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
const github = require("@actions/github");
const shared_1 = require("./shared");
const openPR = ({ owner, repo }, username, branchName, body) => __awaiter(void 0, void 0, void 0, function* () {
    const now = (0, shared_1.formatDate)(new Date());
    const prData = {
        owner,
        repo,
        base: 'main',
        head: `refs/heads/${branchName}`,
        title: `@${username}'s Work: ${now}`,
        body,
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    const { data } = yield github.getOctokit(process.env.GH_TOKEN).request('POST /repos/{owner}/{repo}/pulls', prData);
    return { html_url: data.html_url };
});
exports.default = openPR;
//# sourceMappingURL=openPR.js.map