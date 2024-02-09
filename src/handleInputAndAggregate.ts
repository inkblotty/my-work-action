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
        project_field: core.getInput("project_field"),
    };

    const requiredInputs = ["owner", "repo", "queried_repos", "usernames"];
    for (const inputName of requiredInputs) {
        const workflowValue = core.getInput(inputName, { required: true });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(inputName));
        }

        endObj[inputName] = workflowValue;
    };

    const destinationBranch = core.getInput('destination_branch');
    if (destinationBranch) {
        endObj.destinationBranch = destinationBranch;
    }

    return endObj;
}

const handleInputAndAggregate = async () => {
    const inputFields = makeValidatedInput(process.env.GH_TOKEN);
    const usernames = inputFields.usernames.split(',');

    const startDate = new Date((new Date()).getTime() - (oneDayMs * (inputFields.timespan || 7)));

    // perform each user with delay so we don't get rate limited
    for (let i = 0; i < usernames.length; i++) {
        await sleep(5000);
        await handleSingleUser(inputFields, usernames[i], startDate);
    }
}
export default handleInputAndAggregate;
