import { graphql } from "@octokit/graphql";
import { base64encode } from "./shared";
import { InputFields } from "./shared.types";

const commitMutation = `\
mutation myCreateCommitOnBranch($input: CreateCommitOnBranchInput!) {
    createCommitOnBranch(input: $input) {
        ref,
    }
}
`

const commitToBranch = async ({ owner, repo }: InputFields, username: string, branchNodeId: string, documentBody: string): Promise<{ ref: { id: string } }> => {
    const now = (new Date()).toISOString();
    const commitMessage = 'Generated commit from my-work-action';
    const changeData = {
        owner,
        repo,
        branch: {
            id: branchNodeId,
        },
        fileChanges: {
            additions: [{
                path: `my-work/${username}/${now}.md`,
                contents: base64encode(documentBody),
            }],
        },
        message: commitMessage,
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