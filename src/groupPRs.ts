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
        if (type === QueryType['pr-created']) {
            finalPRs.primary[data[0].repo.full_name] = {
                groupTitle: `PRs Created in [${data[0].repo.full_name}](${data[0].repo.html_url})`,
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
            const key = comment.html_url.split('#')[0];
            const repo = key.split('github.com')[1];
            // if comment is on own PR, ignore
            if (finalPRs.primary[repo]) {
                if (finalPRs.primary[repo].artifacts.find(url => url === key)) {
                    return;
                }
            }
            
            // make sure that comment belongs to a PR group
            if (!finalPRs.secondary[key]) {
                finalPRs.secondary[key] = {
                    groupTitle: `Reviewed and left comments on [a PR in ${repo}](${key})`,
                    artifacts: [],
                }
            }

            finalPRs.secondary[key].artifacts.push({
                title: comment.body,
                url: comment.html_url,
            });
        })
    });
    return finalPRs;
}
export default handlePRGroups;