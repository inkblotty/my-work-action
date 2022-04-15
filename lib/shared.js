"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.performWithDelay = exports.base64encode = exports.oneDayMs = exports.formatDate = void 0;
const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
exports.formatDate = formatDate;
exports.oneDayMs = 1000 * 60 * 60 * 24;
const base64encode = (str) => Buffer.from(str, 'utf-8').toString('base64');
exports.base64encode = base64encode;
const performWithDelay = (func, currentIndex, loopLimit) => {
    setTimeout(function () {
        func(currentIndex);
        if (currentIndex < loopLimit) {
            (0, exports.performWithDelay)(func, currentIndex + 1, loopLimit);
        }
    }, (currentIndex * 1000) + 1000);
};
exports.performWithDelay = performWithDelay;
const sleep = (time) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
});
exports.sleep = sleep;
//# sourceMappingURL=shared.js.map