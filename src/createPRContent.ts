import { formatDate } from "./shared";
import { InputFields } from "./shared.types";

export const createPRBodyText = (startDate: Date, endDate: Date, username: string): string => `\
## @${username}'s Work for Week of ${formatDate(startDate)} - ${formatDate(endDate)}

### Description
This PR aggregates everything you've done in associated repos within the last week.

### Next Steps for @${username}
1. Review the PR
    - If you notice missing information, add it in and create an issue in inkblotty/my-work-action
2. Add any Highlights to your Highlights file
3. Merge the PR
4. In your next meeting with your manager, if there are any trends you want to discuss, bring up this document
`;

interface PRData {
    destinationBranch: string;
    endDate: Date; // usually today
    startDate: Date;
    tempBranch: string;
    title: string;
}
// object to be submitted for PR creation
// see https://docs.github.com/en/rest/reference/pulls#create-a-pull-request
const createPRObj = ({ owner, repo }: Pick<InputFields, 'owner' | 'repo'>, currentUsername: string, prData: PRData) => {
    const requestOwner = repo.includes('/') ? repo.split('/')[0] : owner;
    return {
        body: createPRBodyText(prData.startDate, prData.endDate, currentUsername),
        base: prData.destinationBranch || 'main',
        head: prData.tempBranch,
        owner: requestOwner,
        repo,
        title: prData.title,
    }
}
export default createPRObj;
