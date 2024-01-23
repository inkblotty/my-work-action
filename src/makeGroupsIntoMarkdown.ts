import { formatDate } from "./shared";
import { Artifact, GroupData, OutputGroupGroup } from "./shared.types";

const noWorkMessage = "No work items";
const makeGroupsIntoMarkdown = (
  groupGroups: OutputGroupGroup[],
  username: string,
  startDate: Date,
  projectItem?: string,
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
    primaryArr.push(...markdownLinesFromGroup(Object.values(groups.primary), projectItem));
    secondaryArr.push(...markdownLinesFromGroup(Object.values(groups.secondary), projectItem));
    unknownArr.push(...markdownLinesFromGroup(Object.values(groups.unknown), projectItem));
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

const markdownLinesFromGroup = (groups: GroupData[], projectItem?: string): string[] => {
  const lines = []

  for (const item of groups) {
    lines.push(...markdownSectionHeader(item, projectItem));
    lines.push(...markdownSectionContent(item.artifacts, item.itemType, projectItem));
  }

  return lines;
}

const markdownSectionContent = (artifacts: Artifact[], itemType: string, projectItem?: string): string[] => {
  const lines = []

  for (const lineItem of artifacts) {
    if (projectItem) {
      const projectItems = lineItem.projectItems ? lineItem.projectItems.map((projectItem) => `\`${projectItem.projectItemName}\` (${projectItem.projectName})`).join(", ") : "";
      if (itemType === "PR" || itemType === "Issue") {
        lines.push(`| [${lineItem.title}](${lineItem.url}) | ${projectItems} |\n`);
      } else {
        lines.push(`- [${lineItem.title}](${lineItem.url})\n`);
      }
    } else {
      lines.push(`- [${lineItem.title}](${lineItem.url})\n`);
    }
  }

  return lines;
}

const markdownSectionHeader = (item: GroupData, projectItem?: string): string[] => {
  const lines = []

  lines.push(`### ${item.groupTitle}\n`);
  if (projectItem && (item.itemType === "PR" || item.itemType === "Issue")) {
    lines.push(`| ${item.itemType} | ${projectItem} (Project) |\n| ------------- | ------------- |\n`)
  }
  
  return lines;
}

export default makeGroupsIntoMarkdown;
