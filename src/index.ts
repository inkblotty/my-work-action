import * as core from '@actions/core';
import handleInputAndAggregate from "./input/handleInputAndAggregate";

(async () => {
    try {
        handleInputAndAggregate();
    } catch (err) {
        core.setFailed(err.message);
    }
})();