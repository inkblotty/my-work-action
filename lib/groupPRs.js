"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("./shared");
const handlePRGroups = (allPRsCreated, allPRComments, allPRCommits) => {
    const finalPRs = {
        // primary, meaning directly authored
        primary: {},
        // secondary, meaning contributed to or reviewed
        secondary: {},
        // unknown, meaning the commits are unattached to a PR
        unknown: {}
    };
    console.log('handle PRs', allPRsCreated, allPRComments, allPRComments);
    allPRsCreated.forEach(repoGroup => {
        console.log('repoGroup', repoGroup);
        const { data } = repoGroup;
        if (data[0]) {
            const [repoUrl] = data[0].url.split('/pull');
            const [_, repoName] = repoUrl.split('github.com/');
            finalPRs.primary[repoName] = {
                groupTitle: `PRs Created in [${repoName}](${repoUrl})`,
                artifacts: data.map(pr => ({
                    title: pr.title,
                    url: pr.url,
                }))
            };
        }
    });
    allPRCommits.forEach(repoGroup => {
        const { data } = repoGroup;
        const tempSecondary = {};
        if (data[0]) {
            data.forEach(({ commit }) => {
                const [firstPR] = commit.associatedPullRequests.nodes;
                const prAuthor = firstPR.author.user;
                const prUrl = firstPR.url;
                if (!tempSecondary[prUrl]) {
                    tempSecondary[prUrl] = {
                        groupTitle: `Added <data.length> commits to @${prAuthor}'s PR: [${firstPR.title}](${prUrl})`,
                        artifacts: [],
                    };
                }
                tempSecondary[prUrl].artifacts.push({
                    title: `Commit at ${(0, shared_1.formatDateTime)(new Date(commit.pushedDate))}`,
                    url: commit.url,
                });
            });
        }
        Object.entries(tempSecondary).forEach(([prUrl, value]) => {
            finalPRs.secondary[prUrl] = {
                groupTitle: value.groupTitle.replace('<data.length>', `${value.artifacts.length}`),
                artifacts: value.artifacts,
            };
        });
    });
    allPRComments.forEach(repoGroup => {
        repoGroup.data.forEach(comment => {
            // use the specific PR as key
            const key = comment.url.split('#')[0];
            const prUrl = key.split('github.com')[1];
            const [repo, prNumber] = prUrl.split('/pull/');
            // if comment is on own PR, ignore
            if (finalPRs.primary[repo]) {
                if (finalPRs.primary[repo].artifacts.find(url => url === key)) {
                    return;
                }
            }
            // make sure that comment belongs to a PR group
            if (!finalPRs.secondary[prUrl]) {
                finalPRs.secondary[prUrl] = {
                    groupTitle: `Reviewed and left comments on PR [#${prNumber}](${prUrl}) in ${repoGroup.repo}`,
                    artifacts: [],
                };
            }
            finalPRs.secondary[prUrl].artifacts.push({
                title: `#${finalPRs.secondary[prUrl].artifacts.length + 1}`,
                url: comment.url,
            });
        });
    });
    return finalPRs;
};
exports.default = handlePRGroups;
//# sourceMappingURL=groupPRs.js.map