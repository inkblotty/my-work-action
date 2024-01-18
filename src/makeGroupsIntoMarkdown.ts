import { formatDate } from "./shared";
import { OutputGroupGroup } from "./shared.types";

const noWorkMessage = "No work items";
const makeGroupsIntoMarkdown = (
  groupGroups: OutputGroupGroup[],
  username: string,
  startDate: Date
): string => {
  const now = new Date();
  const markdownBodyArr = [
    `# @${username}'s update for ${formatDate(startDate)} - ${formatDate(
      now
    )}\n\n`,
  ];

  const primaryArr = [
    "## Driver Work\n\nThis usually refers to work that you created, started, and drove forward\n\n",
  ];
  const secondaryArr = [
    "## Partnership Work\n\nThis usually refers to reviews, contributions to other's PRs, and other secondary work\n\n",
  ];
  const unknownArr = ["## Unknown Work\n\n"];

  for (const groups of groupGroups) {
    for (const primaryVal of Object.values(groups.primary)) {
      primaryArr.push(`### ${primaryVal.groupTitle}\n`);
      if (primaryVal.itemType === "PR" || primaryVal.itemType === "Issue") {
        primaryArr.push(`| ${primaryVal.itemType} | Epic (Project) |\n| ------------- | ------------- |\n`)
      }

      for (const lineItem of primaryVal.artifacts) {
        const epics = lineItem.epics ? lineItem.epics.map((epic) => `\`${epic.epicName}\` (${epic.projectName})`).join(", ") : "";
        if (primaryVal.itemType === "PR" || primaryVal.itemType === "Issue") {
          primaryArr.push(`| [${lineItem.title}](${lineItem.url}) | ${epics} |\n`);
        } else {
          primaryArr.push(`- [${lineItem.title}](${lineItem.url})\n`);
        }
      }
    }

    for (const secondaryVal of Object.values(groups.secondary)) {
      secondaryArr.push(`### ${secondaryVal.groupTitle}\n`);
      if (secondaryVal.itemType === "PR" || secondaryVal.itemType === "Issue") {
        secondaryArr.push(`| ${secondaryVal.itemType} | Epic (Project) |\n| ------------- | ------------- |\n`)
      }
      for (const lineItem of secondaryVal.artifacts) {
        const epics = lineItem.epics ? lineItem.epics.map((epic) => `\`${epic.epicName}\` (${epic.projectName})`).join(", ") : "";
        if (secondaryVal.itemType === "PR" || secondaryVal.itemType === "Issue") {
          secondaryArr.push(`| [${lineItem.title}](${lineItem.url}) | ${epics} |\n`);
        } else {
          secondaryArr.push(`- [${lineItem.title}](${lineItem.url})\n`);
        }
      }
    }

    for (const unknownVal of Object.values(groups.unknown)) {
      unknownArr.push(`### ${unknownVal.groupTitle}\n`);
      if (unknownVal.itemType === "PR" || unknownVal.itemType === "Issue") {
        unknownArr.push(`| ${unknownVal.itemType} | Epic (Project) |\n| ------------- | ------------- |\n`)
      }
      for (const lineItem of unknownVal.artifacts) {
        const epics = lineItem.epics ? lineItem.epics.map((epic) => `\`${epic.epicName}\` (${epic.projectName})`).join(", ") : "";
        if (unknownVal.itemType === "PR" || unknownVal.itemType === "Issue") {
          unknownArr.push(`| [${lineItem.title}](${lineItem.url}) | ${epics} |\n`);
        } else {
          unknownArr.push(`- [${lineItem.title}](${lineItem.url})\n`);
        }
      }
    }
  }

  if (primaryArr.length === 1) {
    primaryArr.push(noWorkMessage);
  }
  for (const item of primaryArr) {
    markdownBodyArr.push(item);
  }

  markdownBodyArr.push("\n");

  if (secondaryArr.length === 1) {
    secondaryArr.push(noWorkMessage);
  }
  for (const item of secondaryArr) {
    markdownBodyArr.push(item);
  }
  markdownBodyArr.push("\n");

  if (unknownArr.length !== 1) {
    for (const item of unknownArr) {
      markdownBodyArr.push(item);
    }
  }

  return markdownBodyArr.join("");
};
export default makeGroupsIntoMarkdown;
