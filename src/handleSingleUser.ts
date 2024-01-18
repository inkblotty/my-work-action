import { InputFields, OutputGroupGroup, QueryGroup } from "./shared.types";
import handlePRGroups from "./groupPRs";
import { getAllWork } from "./queries";
import makeGroupsIntoMarkdown from "./makeGroupsIntoMarkdown";
import openBranch from "./openBranch";
import commitToBranch from "./commitToBranch";
import openPR from "./openPR";
import { createPRBodyText } from "./createPRContent";
import handleIssueGroups from "./groupIssues";
import handleDiscussionGroups from "./groupDiscussions";
import { sleep } from './shared';

async function handleSingleUser(inputFields: InputFields, username: string, startDate: Date) {
    const startDateIso = startDate.toISOString();

    const workData: { [key: string]: QueryGroup }[] = []
    if (inputFields.focused_orgs.length === 0) {
        // Query global activity
        const globalData = await getAllWork(null, username, startDateIso, inputFields.excluded_repos, inputFields.focused_repos);
        workData.push(globalData);
        await sleep(1000);
    } else {
        // Query activity per each org
        for (const org of inputFields.focused_orgs) {
            const orgData = await getAllWork(org, username, startDateIso, inputFields.excluded_repos, inputFields.focused_repos);
            workData.push(orgData);
            await sleep(1000);
        }
    }

    const discussionComments = workData.flatMap((data) => data.discussionComments);
    const discussionsCreated = workData.flatMap((data) => data.discussionsCreated);
    const issuesCreated = workData.flatMap((data) => data.issuesCreated);
    const issueComments = workData.flatMap((data) => data.issueComments);
    const prComments = workData.flatMap((data) => data.prComments);
    const prCommits = workData.flatMap((data) => data.prCommits);
    const prsCreated = workData.flatMap((data) => data.prsCreated);

    // group all the things
    const prGroups = handlePRGroups(prsCreated, prComments, prCommits);
    const issueGroups = handleIssueGroups(issuesCreated, issueComments);
    const discussionsGroups = handleDiscussionGroups(discussionsCreated, discussionComments);

    // format the groups into markdown
    const documentBody = makeGroupsIntoMarkdown([prGroups, issueGroups, discussionsGroups], username, startDate);

    // create a branch
    const { ref } = await openBranch(inputFields, username);

    // commit to branch
    await commitToBranch(inputFields, username, ref.id, ref.target.oid, documentBody);

    // open a PR
    const body = createPRBodyText(startDate, new Date(), username);
    return openPR(inputFields, username, ref.name, body);
}
export default handleSingleUser;
