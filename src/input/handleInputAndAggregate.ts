import * as core from '@actions/core';
import * as camelcase from 'camelcase';
import { oneDayMs } from '../shared';

const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;

interface ValidatedInput {
    owner: string;
    queried_repos: string;
    repo: string;
    timespan: number;
    usernames: string;
}
export const makeValidatedInput = (GH_TOKEN: string) => {
    if (!GH_TOKEN) {
        throw new Error(
            "Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository"
          );
    }

    const endObj: Partial<ValidatedInput> = {};
    const requiredInputs = ["owner", "repo", "queried_repos", "usernames"];
    requiredInputs.forEach(inputName => {
        const workflowValue = core.getInput(inputName, { required: true });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(inputName));
        }

        endObj[camelcase(inputName)] = workflowValue;
    });

    return endObj;
}

const handleInputAndAggregate = async () => {
    const inputFields = makeValidatedInput(process.env.GH_TOKEN);
    const usernames = inputFields.usernames.split(',');

    const endDate = new Date();
    const startDate = new Date((new Date()).getTime() - (oneDayMs * (inputFields.timespan || 7)));

    const allGroupsOfWork = usernames.forEach(username => {

    });
}
export default handleInputAndAggregate;
