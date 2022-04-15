import { OutputGroup, OutputGroupGroup, QueryGroup, QueryType } from "./shared.types";

const handleIssueGroups = (allIssuesCreated: QueryGroup[], allIssueComents: QueryGroup[]): OutputGroupGroup => {
    const finalIssues: OutputGroupGroup = {
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

    allIssuesCreated.forEach(repoGroup => {
        const { data, type } = repoGroup;
        if (type === QueryType['issue-created'] && data[0]) {
            const [repoUrl] = data[0].html_url.split('/issues');
            const [_, repoName] = repoUrl.split('github.com/');

            finalIssues.primary[repoName] = {
                groupTitle: `Issues Created in [${repoName}](${repoUrl})`,
                artifacts: data.map(pr => ({
                    title: pr.title,
                    url: pr.html_url,
                }))
            }
        }
    });

    allIssueComents.forEach(repoGroup => {
        repoGroup.data.forEach(comment => {
            // use the specific PR as key
            const key = comment.html_url.split('#')[0];
            const issueUrl = key.split('github.com')[1];
            const repo = issueUrl.split('/pull')[0];
            // if comment is on own PR, ignore
            if (finalIssues.primary[repo]) {
                if (finalIssues.primary[repo].artifacts.find(url => url === key)) {
                    return;
                }
            }
            
            // make sure that comment belongs to a PR group
            if (!finalIssues.secondary[issueUrl]) {
                finalIssues.secondary[issueUrl] = {
                    groupTitle: `Left comments on issue: [${repoGroup.titleData.title}](${issueUrl})`,
                    artifacts: [],
                }
            }

            finalIssues.secondary[issueUrl].artifacts.push({
                title: `Comment #${finalIssues.secondary[issueUrl].artifacts.length + 1}`,
                url: comment.html_url,
            });
        })
    });
    return finalIssues as OutputGroupGroup;
}
export default handleIssueGroups;
