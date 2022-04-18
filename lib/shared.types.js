"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryType = void 0;
var QueryType;
(function (QueryType) {
    QueryType[QueryType["commit"] = 0] = "commit";
    QueryType[QueryType["discussion-created"] = 1] = "discussion-created";
    QueryType[QueryType["discussion-comment-created"] = 2] = "discussion-comment-created";
    QueryType[QueryType["issue-created"] = 3] = "issue-created";
    QueryType[QueryType["issue-comment-created"] = 4] = "issue-comment-created";
    QueryType[QueryType["pr-created"] = 5] = "pr-created";
    QueryType[QueryType["pr-comment-created"] = 6] = "pr-comment-created";
    QueryType[QueryType["pr-commit"] = 7] = "pr-commit";
})(QueryType = exports.QueryType || (exports.QueryType = {}));
;
//# sourceMappingURL=shared.types.js.map