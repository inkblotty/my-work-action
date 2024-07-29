import * as core from '@actions/core';
import handleInputAndAggregate from "./handleInputAndAggregate";

export default async function run() {
  try {
    await handleInputAndAggregate();
  } catch (err) {
    core.setFailed(err.message);
  }
}