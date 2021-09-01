#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CDKPipeline } from "../lib/cdkPipeline";

const app = new cdk.App();
const env = { account: "ACCOUNT_ID", region: "REGION" };

/**
 * Pipeline to deploy all stacks
 */
new CDKPipeline(app, "CdkPipelineStack", {
  env,
});
