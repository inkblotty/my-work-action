import { graphql } from "@octokit/graphql";
import { InputFields } from "./shared.types";

const createRefMutation = `\
mutation myCreateRef($input: CreateRefInput!) {
    createRef(input: $input) {
        ref,
    }
}
`

const openBranch = async ({ owner, repo }: InputFields, username: string): Promise<{ ref: { id: string } }> => {
    const now = (new Date()).getTime();
    const branchName = `temp/my-work-${username}-${now}`
    const branchData = {
        owner,
        repo,
        name: `refs/heads/${branchName}`,
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    return graphql(
        createRefMutation,
        branchData,
    );
}
export default openBranch;
