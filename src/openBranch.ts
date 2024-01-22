import * as github from '@actions/github';
import { graphql } from "@octokit/graphql";
import { InputFields } from "./shared.types";

const createRefMutation = `\
mutation myCreateRef($input: CreateRefInput!) {
    createRef(input: $input) {
        ref {
            id
            name
            target {
                oid
            }
        }
    }
}
`;

interface RefStuff { ref: { id: string, name: string, target: { oid: string } } }
const openBranch = async ({ output_repo }: InputFields, username: string): Promise<RefStuff> => {
    const now = (new Date()).getTime();
    const branchName = `temp/my-work-${username}-${now}`;
    const requestOwner = output_repo.split('/')[0]
    const requestRepo = output_repo.split('/')[1]
    const { data: { node_id: repositoryId } } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}', {
        owner: requestOwner,
        repo: requestRepo,
    });
    const { data: { commit: { sha: latestCommitOnMain } } } = await github.getOctokit(process.env.GH_TOKEN).request('GET /repos/{owner}/{repo}/branches/{branch}', {
        owner: requestOwner,
        repo: requestRepo,
        branch: 'main',
    });
    const branchData = {
        input: {
            name: `refs/heads/${branchName}`,
            oid: latestCommitOnMain,
            repositoryId,
        },
        headers: {
            authorization: `token ${process.env.GH_TOKEN}`
        },
    };
    const data = await graphql(
        createRefMutation,
        branchData,
    );
    return {
        // @ts-ignore return type isn't great here
        ref: data.createRef.ref,
    } as RefStuff;
}
export default openBranch;
