import * as core from '@actions/core';
import { oneDayMs, performWithDelay, sleep } from './shared';
import { InputFields } from './shared.types';
import handleSingleUser from './handleSingleUser';

const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;

export const makeValidatedInput = (GH_TOKEN: string) => {
    if (!GH_TOKEN) {
        throw new Error(
            "Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository"
          );
    }

    const endObj: InputFields = {
        owner: '',
        repo: '',
        queried_repos: '',
        timespan: parseInt(core.getInput('timespan') || '7'),
        usernames: '',
    };
    const requiredInputs = ["owner", "repo", "queried_repos", "usernames"];
    requiredInputs.forEach(inputName => {
        const workflowValue = core.getInput(inputName, { required: true });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(inputName));
        }

        endObj[inputName] = workflowValue;
    });

    return endObj;
}

const handleInputAndAggregate = async () => {
    const inputFields = makeValidatedInput(process.env.GH_TOKEN);
    const usernames = inputFields.usernames.split(',');

    const startDate = new Date((new Date()).getTime() - (oneDayMs * (inputFields.timespan || 7)));

    // perform each user with delay so we don't get rate limited
    usernames.forEach(async username => {
        await sleep(5000);
        await handleSingleUser(inputFields, username, startDate);
    })
}
export default handleInputAndAggregate;
