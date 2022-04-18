import { OutputGroup, OutputGroupGroup, QueryGroup, QueryType } from "./shared.types";

const handlePRGroups = (allPRsCreated: QueryGroup[], allPRComments: QueryGroup[], allPRCommits: QueryGroup[]): OutputGroupGroup => {
    const finalPRs = {
        // primary, meaning directly authored
        primary: {
        },
        // secondary, meaning contributed to or reviewed
        secondary: {
        },
        // unknown, meaning the commits are unattached to a PR
        unknown: {
        }
    };

    allPRsCreated.forEach(repoGroup => {
        const { data } = repoGroup;
        if (data[0]) {
            const [repoUrl] = data[0].html_url.split('/pull');
            const [_, repoName] = repoUrl.split('github.com/');

            finalPRs.primary[repoName] = {
                groupTitle: `PRs Created in [${repoName}](${repoUrl})`,
                artifacts: data.map(pr => ({
                    title: pr.title,
                    url: pr.html_url,
                }))
            }
        }
    });

    allPRCommits.forEach(repoGroup => {
        const { data } = repoGroup;
        const tempSecondary: OutputGroup = {}
        if (data[0]) {
            repoGroup.data.forEach(group => {
                const prAuthor = group.pullRequest.author.login;
                const prUrl = group.pullRequest.url;
                if (!tempSecondary[prUrl]) {
                    tempSecondary[prUrl] = {
                        groupTitle: `Added <data.length> commits to @${prAuthor}'s PR: [${group.pullRequest.title}](${prUrl})`,
                        artifacts: [],
                    }
                }

                tempSecondary[prUrl].artifacts.push({
                    title: group.commit.pushedDate,
                    url: group.commit.url,
                });
            });
        }

        Object.entries(tempSecondary).forEach(([prUrl, value]) => {
            finalPRs.secondary[prUrl] = {
                groupTitle: value.groupTitle.replace('<data.length>', `${value.artifacts.length}`),
                artifacts: value.artifacts,
            }
        });
    });

    allPRComments.forEach(repoGroup => {
        repoGroup.data.forEach(comment => {
            // use the specific PR as key
            const key = comment.html_url.split('#')[0];
            const prUrl = key.split('github.com')[1];
            const repo = prUrl.split('/pull')[0];
            // if comment is on own PR, ignore
            if (finalPRs.primary[repo]) {
                if (finalPRs.primary[repo].artifacts.find(url => url === key)) {
                    return;
                }
            }
            
            // make sure that comment belongs to a PR group
            if (!finalPRs.secondary[prUrl]) {
                finalPRs.secondary[prUrl] = {
                    groupTitle: `Reviewed and left comments on PR [${repoGroup.titleData.title}](${prUrl})`,
                    artifacts: [],
                }
            }

            finalPRs.secondary[prUrl].artifacts.push({
                title: `#${finalPRs.secondary[prUrl].artifacts.length + 1}`,
                url: comment.html_url,
            });
        })
    });

    return finalPRs;
}
export default handlePRGroups;
