import { Construct, Stage, StageProps } from "@aws-cdk/core";

import { CognitoStack } from "../stacks/cognito.stack";

export class CognitoStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new CognitoStack(this, "CognitoStack", {
      env: props?.env,
    });
  }
}
