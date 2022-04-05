import { formatDate } from "../shared";

const createPRBodyText = (startDate: Date, endDate: Date, username: string) => `\
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
export default createPRBodyText;
