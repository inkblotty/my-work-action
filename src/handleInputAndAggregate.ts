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
        output_repo: '',
        usernames: '',
        timespan: parseInt(core.getInput('timespan') || '7'),
        queried_orgs: core.getInput('queried_orgs') || '',
        queried_repos: core.getInput('queried_repos') || '',
        excluded_repos: core.getInput('excluded_repos') || '',
    };

    const requiredInputs = ["output_repo", "usernames"];
    for (const inputName of requiredInputs) {
        const workflowValue = core.getInput(inputName, { required: true });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(inputName));
        }

        endObj[inputName] = workflowValue;
    };

    // TOOD: validate output_repo to use NWO format
    // TODO: move usernames splitting to here and make usernames field of type [string]
    // TODO: move queried_orgs splitting to here and make usernames field of type [string]
    // TODO: move queried_repos splitting to here and make usernames field of type [string], add validation if repo is of NWO format
    // TODO: move excluded_repos splitting to here and make usernames field of type [string], add validation if repo is of NWO format

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
