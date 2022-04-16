import { InputFields, OutputGroupGroup } from "./shared.types";
import handlePRGroups from "./groupPRs";
import { getAllWorkForRepository, getIssueCommentsInRange, getIssuesCreatedInRange, getPRCommentsInRange, getPRsCreated } from "./queries";
import makeGroupsIntoMarkdown from "./makeGroupsIntoMarkdown";
import openBranch from "./openBranch";
import commitToBranch from "./commitToBranch";
import openPR from "./openPR";
import { createPRBodyText } from "./createPRContent";
import handleIssueGroups from "./groupIssues";

async function handleSingleUser(inputFields: InputFields, username: string, startDate: Date) {
    const startDateIso = startDate.toISOString();
    
    const reposList = inputFields.queried_repos.split(',');

    reposList.forEach(async repo => {
        const [requestOwner, repoName] = repo.includes('/') ? repo.split('/') : [inputFields.owner, repo];
        // query all the things
        const {
            prComments,
            prsCreated,
            issuesCreated,
            issueComments,
        } = await getAllWorkForRepository(requestOwner, repoName, username, startDateIso);
    });

    // group all the things
    const prGroups = handlePRGroups(prsCreated, prComments);
    const issueGroups = handleIssueGroups(issuesCreated, issueComments);

    // format the groups into markdown
    const documentBody = makeGroupsIntoMarkdown([prGroups, issueGroups], username, startDate);

    // create a branch
    const { ref } = await openBranch(inputFields, username);

    // commit to branch
    await commitToBranch(inputFields, username, ref.id, ref.target.oid, documentBody);

    // open a PR
    const body = createPRBodyText(startDate, new Date(), username);
    return openPR(inputFields, username, ref.name, body);
}
export default handleSingleUser;
