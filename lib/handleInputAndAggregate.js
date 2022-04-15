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
exports.makeValidatedInput = void 0;
const core = require("@actions/core");
const shared_1 = require("./shared");
const handleSingleUser_1 = require("./handleSingleUser");
const makeRequiredErrorMessage = (inputName) => `Failed to retrieve input "${inputName}". Does the workflow include "${inputName}"?`;
const makeValidatedInput = (GH_TOKEN) => {
    if (!GH_TOKEN) {
        throw new Error("Failed to retrieve a GitHub token. Does this repository have a secret named 'GH_TOKEN'? https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository");
    }
    const endObj = {
        owner: '',
        repo: '',
        queried_repos: '',
        timespan: parseInt(core.getInput('timespan') || '7'),
        usernames: '',
    };
    const requiredInputs = ["owner", "repo", "queried_repos", "usernames"];
    requiredInputs.forEach(inputName => {
        const workflowValue = core.getInput(inputName, { required: true });
        if (!workflowValue) {
            throw new Error(makeRequiredErrorMessage(inputName));
        }
        endObj[inputName] = workflowValue;
    });
    return endObj;
};
exports.makeValidatedInput = makeValidatedInput;
const handleInputAndAggregate = () => __awaiter(void 0, void 0, void 0, function* () {
    const inputFields = (0, exports.makeValidatedInput)(process.env.GH_TOKEN);
    const usernames = inputFields.usernames.split(',');
    const startDate = new Date((new Date()).getTime() - (shared_1.oneDayMs * (inputFields.timespan || 7)));
    let userIndex = 0;
    // delay each user call so that we don't get rate limited
    function loopUsersWithDelay() {
        setTimeout(function () {
            (0, handleSingleUser_1.default)(inputFields, usernames[userIndex], startDate);
            userIndex++;
            if (userIndex < usernames.length) {
                loopUsersWithDelay();
            }
        }, (userIndex * 1000) + 3000);
    }
    loopUsersWithDelay();
});
exports.default = handleInputAndAggregate;
//# sourceMappingURL=handleInputAndAggregate.js.map