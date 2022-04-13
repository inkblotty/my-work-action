import { OutputGroupGroup, QueryGroup, QueryType } from "./shared.types";

const handlePRGroups = (allPRsCreated: QueryGroup[], allPRComments: QueryGroup[]): OutputGroupGroup => {
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
        const { data, type, titleData } = repoGroup;
        if (type === QueryType['pr-created'] && data[0]) {
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

        if (type === QueryType['commit']) {
            finalPRs.secondary[titleData.url] = {
                groupTitle: `Added ${data.length} commits to @${titleData.username}'s PR: [${titleData.title}](${titleData.url})`,
                artifacts: data.map(commit => ({
                    title: commit.message,
                    url: commit.html_url,
                })),
            }
        }
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
                    groupTitle: `Reviewed and left comments on [a PR in ${repo}](${prUrl})`,
                    artifacts: [],
                }
            }

            finalPRs.secondary[prUrl].artifacts.push({
                title: comment.body,
                url: comment.html_url,
            });
        })
    });

    console.log('finalPRs', finalPRs);

    return finalPRs;
}
export default handlePRGroups;
