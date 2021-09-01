import { Construct, Stage, StageProps } from "@aws-cdk/core";

import { RDSStack } from "../stacks/rds.stack";

export class RDSStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new RDSStack(this, "RDSStack", {
      env: props?.env,
    });
  }
}
