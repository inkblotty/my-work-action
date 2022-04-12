import * as core from '@actions/core';
import handleInputAndAggregate from "./handleInputAndAggregate";

(async () => {
    try {
        handleInputAndAggregate();
    } catch (err) {
        core.setFailed(err.message);
    }
})();