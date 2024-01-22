import { OutputGroup, OutputGroupGroup, QueryGroup, QueryType } from "./shared.types";

const handleIssueGroups = (allIssuesCreated: QueryGroup[], allIssueComments: QueryGroup[]): OutputGroupGroup => {
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

    for (const repoGroup of allIssuesCreated) {

        const { data, type } = repoGroup;
        if (type === QueryType['issue-created'] && data[0]) {
            const [repoUrl] = data[0].url.split('/issues');
            const [_, repoName] = repoUrl.split('github.com/');

            finalIssues.primary[repoName] = {
                groupTitle: `Issues Created in [${repoName}](${repoUrl})`,
                artifacts: data.map(pr => ({
                    title: pr.title,
                    url: pr.url,
                }))
            }
        }
    };

    for (const repoGroup of allIssueComments) {
        for (const comment of repoGroup.data) {
            // use the specific issue as key
            const issueUrl = comment.url.split('#')[0];

            // make sure that comment belongs to a PR group
            if (!finalIssues.secondary[issueUrl]) {
                finalIssues.secondary[issueUrl] = {
                    groupTitle: `Left comments on issue: [${comment.issue.title}](${issueUrl})`,
                    artifacts: [],
                }
            }

            finalIssues.secondary[issueUrl].artifacts.push({
                title: `Comment #${finalIssues.secondary[issueUrl].artifacts.length + 1}`,
                url: comment.url,
            });
        }
    };
    return finalIssues as OutputGroupGroup;
}
export default handleIssueGroups;
