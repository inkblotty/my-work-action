import { getIssueCommentsInRange, getIssuesCreatedInRange } from "./queries";

async function handleSingleUser(inputFields: InputFields, username: string, startDate: Date) {
    const startDateIso = startDate.toISOString();
    // query all the things
    const issuesCreated = await getIssuesCreatedInRange(inputFields, username, startDateIso);
    const issueComments = await getIssueCommentsInRange(inputFields, username, startDateIso);

    // group all the things

    // format the groups into markdown

    // create a branch

    // open a PR
}
export default handleSingleUser;
