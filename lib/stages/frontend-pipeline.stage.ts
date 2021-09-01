import { Construct, Stage, StageProps } from "@aws-cdk/core";

import { FrontendPipelineStack } from "../stacks/frontend-pipeline.stack";

export class FrontendPipelineStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new FrontendPipelineStack(this, "FrontendPipelineStack", {
      env: props?.env,
    });
  }
}
