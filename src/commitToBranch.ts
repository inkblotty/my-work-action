import { graphql } from "@octokit/graphql";
import { base64encode } from "./shared";
import { InputFields } from "./shared.types";

const commitMutation = `\
mutation myCreateCommitOnBranch($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) {
        ref {
            id
        }
    }
}
`

const commitToBranch = async ({ owner, repo }: InputFields, username: string, branchNodeId: string, branchSha: string, documentBody: string): Promise<{ ref: { id: string } }> => {
    const now = (new Date()).toISOString();
    const commitMessage = 'Generated commit from my-work-action';
    const requestOwner = repo.includes('/') ? repo.split('/')[0] : owner;
    const changeData = {
        owner: requestOwner,
        repo,
        input: {
            branch: {
                id: branchNodeId,
            },
            expectedHeadOid: branchSha,
            fileChanges: {
                additions: [{
                    path: `my-work/${username}/${now}.md`,
                    contents: base64encode(documentBody),
                }],
            },
            message: {
                headline: commitMessage,
            },
        },
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    return graphql(
        commitMutation,
        changeData,
    );
}
export default commitToBranch;