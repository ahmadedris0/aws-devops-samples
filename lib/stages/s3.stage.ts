import { Construct, Stage, StageProps } from "@aws-cdk/core";

import { S3Stack } from "../stacks/s3.stack";

export class S3Stage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new S3Stack(this, "S3Stack", {
      env: props?.env,
    });
  }
}
