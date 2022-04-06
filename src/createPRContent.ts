import { formatDate } from "./shared";
import { InputFields } from "./shared.types";

export const createPRBodyText = (startDate: Date, endDate: Date, username: string): string => `\
## @${username}'s Work for Week of ${formatDate(startDate)} - ${formatDate(endDate)}}

### Description
This PR aggregates everything you've done in asssociated repos within the last week.

### Next Steps for @${username}
1. Review the PR
    - If you notice missing information, add it in and ping @inkblotty to update the script
2. Merge the PR
3. Add any Highlights to your Highlights file
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
    return {
        body: createPRBodyText(prData.startDate, prData.endDate, currentUsername),
        base: prData.destinationBranch,
        head: prData.tempBranch,
        owner,
        repo,
        title: prData.title,
    }
}
export default createPRObj;
