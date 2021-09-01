import { Construct, Stage, StageProps } from "@aws-cdk/core";

import { BackendSlsPipelineStack } from "../stacks/backend-serverless-pipeline.stack";

export class BackendSlsPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new BackendSlsPipelineStack(this, "BackendSlsPipelineStack", {
      env: props?.env,
    });
  }
}
