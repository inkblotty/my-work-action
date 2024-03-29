import { formatDateTime } from "./shared";
import {
  OutputGroup,
  OutputGroupGroup,
  QueryGroup,
  QueryType,
} from "./shared.types";

const handlePRGroups = (
  allPRsCreated: QueryGroup[],
  allPRComments: QueryGroup[],
  allPRCommits: QueryGroup[]
): OutputGroupGroup => {
  const finalPRs = {
    // primary, meaning directly authored
    primary: {},
    // secondary, meaning contributed to or reviewed
    secondary: {},
    // unknown, meaning the commits are unattached to a PR
    unknown: {},
  };

  for (const repoGroup of allPRsCreated) {
    const { data } = repoGroup;
    if (data[0]) {
      const [repoUrl] = data[0].url.split("/pull");
      const [_, repoName] = repoUrl.split("github.com/");

      finalPRs.primary[repoName] = {
        groupTitle: `PRs Created in [${repoName}](${repoUrl})`,
        itemType: 'PR',
        artifacts: data.map((pr) => ({
          title: pr.title,
          url: pr.url,
          projectItems: pr.projectItems,
        })),
      };
    }
  }

  for (const repoGroup of allPRCommits) {
    const { data } = repoGroup;
    const tempSecondary: OutputGroup = {};
    if (data[0]) {
      for (const commit of data) {
        const [firstPR] = commit.associatedPullRequests.nodes;
        const prAuthor = firstPR.author.user;
        const prUrl = firstPR.url;
        if (!tempSecondary[prUrl]) {
          tempSecondary[prUrl] = {
            groupTitle: `Added <data.length> commits to @${prAuthor}'s PR: [${firstPR.title}](${prUrl})`,
            itemType: 'PRCommit',
            artifacts: [],
          };
        }

        tempSecondary[prUrl].artifacts.push({
          title: `Commit at ${formatDateTime(new Date(commit.pushedDate))}`,
          url: commit.url,
          projectItems: [],
        });
      }
    }

    for (const entry of Object.entries(tempSecondary)) {
      const [prUrl, value] = entry;
      finalPRs.secondary[prUrl] = {
        groupTitle: value.groupTitle.replace(
          "<data.length>",
          `${value.artifacts.length}`
        ),
        artifacts: value.artifacts,
      };
    }
  }

  for (const repoGroup of allPRComments) {
    for (const comment of repoGroup.data) {
      // use the specific PR as key
      const { prTitle } = comment;
      const prUrl = comment.url.split("#")[0];
      const prUrlTrimmed = prUrl.split("github.com")[1];
      const [repo, prNumber] = prUrlTrimmed.split("/pull/");
      // if comment is on own PR, ignore
      if (finalPRs.primary[repo]) {
        if (finalPRs.primary[repo].artifacts.find((url) => url === prUrl)) {
          return;
        }
      }

      // make sure that comment belongs to a PR group
      if (!finalPRs.secondary[prUrlTrimmed]) {
        finalPRs.secondary[prUrlTrimmed] = {
          groupTitle: `Reviewed and left comments on PR [${prTitle} #${prNumber}](${prUrl}) in ${repoGroup.repo}`,
          itemType: 'PRReview',
          artifacts: [],
        };
      }

      finalPRs.secondary[prUrlTrimmed].artifacts.push({
        title: `#${finalPRs.secondary[prUrlTrimmed].artifacts.length + 1}`,
        url: comment.url,
        projectItems: [],
      });
    }
  }

  return finalPRs;
};
export default handlePRGroups;
