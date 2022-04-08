"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64encode = exports.oneDayMs = exports.formatDate = void 0;
const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
exports.formatDate = formatDate;
exports.oneDayMs = 1000 * 60 * 60 * 24;
const base64encode = (str) => Buffer.from(str, 'utf-8').toString('base64');
exports.base64encode = base64encode;
//# sourceMappingURL=shared.js.map