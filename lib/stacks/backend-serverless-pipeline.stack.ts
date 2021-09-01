import { Construct, Stack, RemovalPolicy, StackProps } from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
import * as CodeBuild from "@aws-cdk/aws-codebuild";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";

export class BackendSlsPipelineStack extends Stack {
  constructor(app: Construct, stackId: string, props?: StackProps) {
    super(app, stackId, props);

    const sourceOutput = new CodePipeline.Artifact();
    const buildOutput = new CodePipeline.Artifact("ARTIFACT_NAME");

    const artifactBucket = new s3.Bucket(this, "BUCKET_ID", {
      bucketName: "BUCKET_NAME",
      blockPublicAccess: new s3.BlockPublicAccess(
        s3.BlockPublicAccess.BLOCK_ALL
      ),
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const pipeline = new CodePipeline.Pipeline(this, "PIPELINE_ID", {
      pipelineName: "PIPELINE_NAME",
      restartExecutionOnUpdate: true,
      artifactBucket: artifactBucket,
    });

    pipeline.addStage({
      stageName: "Source",
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: "Checkout",
          owner: "GIT_SOURCE_OWNER",
          repo: "REPO_NAME",
          branch: "master",
          //@ts-ignore
          oauthToken: "GITHUB_AUTH_TOKEN",
          /**
           * You can save the auth token in secret managet then get it by name
           */
          // oauthToken: cdk.SecretValue.secretsManager("AUTH_TOKEN_NAME"),
          output: sourceOutput,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
        }),
      ],
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          environmentVariables: {
            DEPLOYMENT_BUCKET: {
              value: artifactBucket.bucketName,
              type: CodeBuild.BuildEnvironmentVariableType.PLAINTEXT,
            },
          },
          actionName: "BUILD_ACTION_NAME",
          project: new CodeBuild.PipelineProject(this, "BUILD_ACTION_ID", {
            buildSpec: CodeBuild.BuildSpec.fromSourceFilename("buildspec.yml"),
            environment: {
              buildImage: CodeBuild.LinuxBuildImage.STANDARD_4_0,
            },
          }),
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });
  }
}
