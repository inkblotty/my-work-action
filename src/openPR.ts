import * as github from '@actions/github';
import { formatDate } from "./shared";
import { InputFields } from "./shared.types";

const openPR = async ({ owner, repo }: InputFields, username: string, branchName: string, body: string, destinationBranch: string): Promise<{ html_url: string }> => {
    const now = formatDate(new Date());
    const requestOwner = repo.includes('/') ? repo.split('/')[0] : owner;
    const prData = {
        owner: requestOwner,
        repo,
        base: destinationBranch,
        head: `refs/heads/${branchName}`,
        title: `@${username}'s Work: ${now}`,
        draft: true,
        body, 
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    const { data } = await github.getOctokit(process.env.GH_TOKEN).request('POST /repos/{owner}/{repo}/pulls', prData);
    return { html_url: data.html_url };
}
export default openPR;
