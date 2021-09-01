import { Construct, Stack, StackProps } from "@aws-cdk/core";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
import * as CodeBuild from "@aws-cdk/aws-codebuild";
import * as CodePipeline from "@aws-cdk/aws-codepipeline";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";

export class FrontendPipelineStack extends Stack {
  constructor(app: Construct, stackId: string, props?: StackProps) {
    super(app, stackId, props);

    // Create S3 bucket
    const bucketWebsite: s3.IBucket = new s3.Bucket(this, "BUCKET_ID", {
      bucketName: "BUCKET_NAME",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.HEAD,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedHeaders: ["*"],
        },
      ],
    });

    // Create cloud front
    const cdn = new cloudfront.Distribution(this, "bucketWebsiteCDN", {
      defaultBehavior: {
        origin: new origins.S3Origin(bucketWebsite),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    // Create Pipeline
    const outputSources = new CodePipeline.Artifact();
    const outputWebsite = new CodePipeline.Artifact();
    const outputCDN = new CodePipeline.Artifact();

    const pipeline = new CodePipeline.Pipeline(this, "PIPELINE_ID", {
      pipelineName: "PIPELINE_NAME",
      restartExecutionOnUpdate: true,
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
          output: outputSources,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
        }),
      ],
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "Repo_Build",
          project: new CodeBuild.PipelineProject(this, "BuildFEId", {
            buildSpec:
              CodeBuild.BuildSpec.fromSourceFilename("./buildspec.yml"),
          }),
          input: outputSources,
          outputs: [outputWebsite],
        }),
      ],
    });

    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        new CodePipelineAction.S3DeployAction({
          actionName: "Website",
          input: outputWebsite,
          bucket: bucketWebsite,
        }),
      ],
    });

    /**
     * OPTIONAL
     * Remove objects and files from the CloudFront cache
     */
    pipeline.addStage({
      stageName: "InvalidateCDNCache",
      actions: [
        new CodePipelineAction.CodeBuildAction({
          actionName: "InvalidateCache",
          project: new CodeBuild.PipelineProject(this, "InvalidateCacheId", {
            buildSpec: CodeBuild.BuildSpec.fromObject({
              version: "0.2",
              phases: {
                build: {
                  commands: [
                    `aws cloudfront create-invalidation --distribution-id ${cdn.distributionId} --paths "/*"`,
                  ],
                },
              },
            }),
          }),
          input: outputSources,
          outputs: [outputCDN],
        }),
      ],
    });
  }
}
