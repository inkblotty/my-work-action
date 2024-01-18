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

const commitToBranch = async ({ output_repo }: InputFields, username: string, branchNodeId: string, branchSha: string, documentBody: string): Promise<{ ref: { id: string } }> => {
    const today = (new Date()).toISOString().replace(/T.*$/, "");
    const commitMessage = 'Generated commit from my-work-action';
    const requestOwner = output_repo.split('/')[0]
    const requestRepo = output_repo.split('/')[1]
    const changeData = {
        owner: requestOwner,
        repo: requestRepo,
        input: {
            branch: {
                id: branchNodeId,
            },
            expectedHeadOid: branchSha,
            fileChanges: {
                additions: [{
                    path: `my-work/${username}/${today}.md`,
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
