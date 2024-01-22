import * as core from '@actions/core';
import { oneDayMs, performWithDelay, sleep } from './shared';
import { InputFields } from './shared.types';
import handleSingleUser from './handleSingleUser';

const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;

export const makeInput = () => {
    const requiredInputs = [
        { name: "output_repo", array: false },
        { name: "usernames", array: true }
    ];
    const inputFields: InputFields = {
        output_repo: '',
        usernames: [],
        timespan: parseInt(core.getInput('timespan') || '7'),
        focused_orgs: core.getInput('focused_orgs').trim().length > 0 ? core.getInput('focused_orgs').split(",") : [],
        focused_repos: core.getInput('focused_repos').trim().length > 0 ? core.getInput('focused_repos').split(",") : [],
        excluded_repos: core.getInput('excluded_repos').trim().length > 0 ? core.getInput('excluded_repos').split(",") : [],
    };
    for (const input of requiredInputs) {
        const workflowValue = core.getInput(input.name, { required: true });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(input.name));
        }

        if (input.array) {
            inputFields[input.name] = workflowValue.split(",");
            continue;
        }

        inputFields[input.name] = workflowValue;
    };

    return inputFields
}

export const validateInput = (input: InputFields) => {
    // output_repo should use NWO format (github/docs)
    if (input.output_repo.split("/").length !== 2) {
        throw new Error("output_repo must specify repository using name-with-owner format, egz. github/docs");
    }
    // usernames should have at leat one username with non whitespace characters
    if (input.usernames.length === 0) {
        throw new Error("usernames must specify at least one username");
    }
    const invalidUsernames = input.usernames.filter(org => org.trim().length === 0);
    if (invalidUsernames.length > 0) {
        throw new Error(`usernames must specify logins with non whitespace characters. Invalid usernames: ${invalidUsernames.map(n => `'${n}'`).join(", ") }`);
    }
    // If focused_orgs has any values specified, all need to have at least 1 non whitespace character
    if (input.focused_orgs.length > 0) {
        const invalidOrgNames = input.focused_orgs.filter(org => org.trim().length === 0);
        if (invalidOrgNames.length > 0)
            throw new Error(`focused_orgs must specify organization names with non whitespace characters. Invalid organization names: ${invalidOrgNames.map(n => `'${n}'`).join(", ")}`);
    }

    // focused_repos and excluded_repos should contain an array of repos in in NWO format (github/docs)
    if (input.focused_repos.length > 0) {
        const invalidRepoNames = input.focused_repos.filter(repo => repo.split("/").length !== 2);
        if (invalidRepoNames.length > 0)
            throw new Error(`focused_repos must specify repository using name-with-owner format, egz. github/docs. Invalid repository names: ${invalidRepoNames.map(n => `'${n}'`).join(", ") }`);
    }
    if (input.excluded_repos.length > 0) {
        const invalidRepoNames = input.excluded_repos.filter(repo => repo.split("/").length !== 2);
        if (invalidRepoNames.length > 0)
            throw new Error(`excluded_repos must specify repository using name-with-owner format, egz. github/docs. Invalid repository names: ${invalidRepoNames.map(n => `'${n}'`).join(", ") }`);
    }
}

export const makeValidatedInput = (GH_TOKEN: string) => {
    if (!GH_TOKEN) {
        throw new Error(
            "Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository"
          );
    }

    const inputFields = makeInput()
    validateInput(inputFields);

    return inputFields;
}

const handleInputAndAggregate = async () => {
    const inputFields = makeValidatedInput(process.env.GH_TOKEN);
    const startDate = new Date((new Date()).getTime() - (oneDayMs * (inputFields.timespan || 7)));

    // perform each user with delay so we don't get rate limited
    for (const username of inputFields.usernames) {
        await sleep(5000);
        await handleSingleUser(inputFields, username, startDate);
    }
}
export default handleInputAndAggregate;
