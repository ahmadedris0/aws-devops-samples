import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import { Construct, Stack, SecretValue, StackProps } from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";

import { CognitoStage } from "./stages/cognito.stage";
import { BackendSlsPipelineStage } from "./stages/backend-serverless-pipeline.stage";
import { FrontendPipelineStage } from "./stages/frontend-pipeline.stage";
import { RDSStage } from "./stages/rds.stage";
import { S3Stage } from "./stages/s3.stage";

export class CDKPipeline extends Stack {
  constructor(scope: Construct, stackId: string, props?: StackProps) {
    super(scope, stackId, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    let pipeline: CdkPipeline;
    pipeline = new CdkPipeline(this, "PIPELINE_ID", {
      // The pipeline name
      pipelineName: "PIPELINE_NAME",
      cloudAssemblyArtifact,

      // Where the source can be found
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        //@ts-ignore
        oauthToken: "GITHUB_AUTH_TOKEN",
        /**
         * You can save the auth token in secret managet then get it by name
         */
        // oauthToken: cdk.SecretValue.secretsManager("AUTH_TOKEN_NAME"),
        owner: "GIT_SOURCE_OWNER",
        repo: "REPO_NAME",
        branch: "master",
      }),

      // How it will be built and synthesized
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        buildCommand: "npm run build",
      }),
    });

    // This is where we add the application stage
    pipeline.addApplicationStage(
      new BackendSlsPipelineStage(this, "BackendSlsPipelineStage", {
        env: props?.env,
      })
    );

    pipeline.addApplicationStage(
      new FrontendPipelineStage(this, "FrontendPipelineStage", {
        env: props?.env,
      })
    );

    pipeline.addApplicationStage(
      new CognitoStage(this, "CognitoStage", {
        env: props?.env,
      })
    );

    pipeline.addApplicationStage(
      new S3Stage(this, "S3Stage", {
        env: props?.env,
      })
    );

    pipeline.addApplicationStage(
      new RDSStage(this, "RDSStage", {
        env: props?.env,
      })
    );
  }
}
