import { formatDate } from "./shared";
import { OutputGroupGroup } from "./shared.types";

const noWorkMessage = 'No work items';
const makeGroupsIntoMarkdown = (groupsArr: OutputGroupGroup[], username: string, startDate: Date): string => {
    const now = new Date();
    const markdownBodyArr = [
        `# @${username}'s update for ${formatDate(startDate)} - ${formatDate(now)}\n\n`,
    ];

    const primaryArr = [
        '## Primary Work\n\nThis usually refers to work that you created, started, and drove forward\n\n',
    ];
    const secondaryArr = [
        '## Secondary Work\n\nThis usually refers to reviews, contributions to other\'s PRs, and other secondary work\n\n',
    ];
    const unknownArr = [];

    groupsArr.forEach(group => {
        Object.values(group.primary).forEach(primaryVal => {
            primaryArr.push(`### ${primaryVal.groupTitle}\n`);
            primaryVal.artifacts.forEach(lineItem => primaryArr.push(`- [${lineItem.text}](${lineItem.url})\n`))
        });

        Object.values(group.secondary).forEach(secondaryVal => {
            secondaryArr.push(`### ${secondaryVal.groupTitle}\n`);
            secondaryVal.artifacts.forEach(lineItem => secondaryArr.push(`- [${lineItem.text}](${lineItem.url})\n`))
        });

        Object.values(group.unknown).forEach(unknownVal => {
            unknownArr.push(`### ${unknownVal.groupTitle}\n`);
            unknownVal.artifacts.forEach(lineItem => unknownArr.push(`- [${lineItem.text}](${lineItem.url})\n`))
        });
    });

    if (primaryArr.length === 1) {
        primaryArr.push(noWorkMessage);
    }

    if (secondaryArr.length === 1) {
        secondaryArr.push(noWorkMessage);
    }

    return markdownBodyArr.join('');
}
export default makeGroupsIntoMarkdown;
