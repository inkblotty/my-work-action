import * as github from '@actions/github';
import { formatDate } from "./shared";
import { InputFields } from "./shared.types";

const openPR = async ({ owner, repo }: InputFields, username: string, branchName: string, body: string, destinationBranch: string): Promise<{ html_url: string }> => {
    const now = formatDate(new Date());
    const requestOwner = repo.includes('/') ? repo.split('/')[0] : owner;
    const octokit = github.getOctokit(process.env.GH_TOKEN);

    const prData = {
        owner: requestOwner,
        repo,
        base: destinationBranch || 'main',
        head: `refs/heads/${branchName}`,
        title: `@${username}'s Work: ${now}`,
        draft: true,
        body, 
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    const { data } = await octokit.request('POST /repos/{owner}/{repo}/pulls', prData);

    const assigneeData = {
        owner: requestOwner,
        repo,
        issue_number: data.number,
        assignees: [
            username
        ],
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        }
    }
    octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/assignees', assigneeData)

    return { html_url: data.html_url };
}
export default openPR;
