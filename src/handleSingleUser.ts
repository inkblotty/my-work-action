import { InputFields } from "./shared.types";
import handlePRGroups from "./groupPRs";
import { getCommitsInRange, getIssueCommentsInRange, getIssuesCreatedInRange, getPRCommentsInRange, getPRsCreated } from "./queries";

async function handleSingleUser(inputFields: InputFields, username: string, startDate: Date) {
    const startDateIso = startDate.toISOString();
    // query all the things
    const issuesCreated = await getIssuesCreatedInRange(inputFields, username, startDateIso);
    const issueComments = await getIssueCommentsInRange(inputFields, username, startDateIso);
    const prsCreated = await getPRsCreated(inputFields, username, startDateIso);
    const prComments = await getPRCommentsInRange(inputFields, username, startDateIso);
    // const commits = await getCommitsInRange(inputFields, username, startDateIso);

    // group all the things
    const prGroups = handlePRGroups(prsCreated, prComments);

    // format the groups into markdown

    // create a branch

    // open a PR
}
export default handleSingleUser;
