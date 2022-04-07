import { InputFields } from "./shared.types";
import handlePRGroups from "./groupPRs";
import { getIssueCommentsInRange, getIssuesCreatedInRange, getPRCommentsInRange, getPRsCreated } from "./queries";
import makeGroupsIntoMarkdown from "./makeGroupsIntoMarkdown";
import openBranch from "./openBranch";

async function handleSingleUser(inputFields: InputFields, username: string, startDate: Date) {
    const startDateIso = startDate.toISOString();
    // query all the things
    const issuesCreated = await getIssuesCreatedInRange(inputFields, username, startDateIso);
    const issueComments = await getIssueCommentsInRange(inputFields, username, startDateIso);
    const prsCreated = await getPRsCreated(inputFields, username, startDateIso);
    const prComments = await getPRCommentsInRange(inputFields, username, startDateIso);

    // group all the things
    const prGroups = handlePRGroups(prsCreated, prComments);

    // format the groups into markdown
    const documentBody = makeGroupsIntoMarkdown([prGroups], username, startDate);

    // create a branch
    const { ref } = await openBranch(inputFields, username);

    // open a PR
}
export default handleSingleUser;
