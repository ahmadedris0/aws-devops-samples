import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { BlockPublicAccess, Bucket, HttpMethods } from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";

export class S3Stack extends Stack {
  constructor(app: Construct, stackId: string, props?: StackProps) {
    super(app, stackId, props);

    const corsObj = {
      allowedOrigins: ["*"],
      allowedMethods: [
        HttpMethods.GET,
        HttpMethods.HEAD,
        HttpMethods.DELETE,
        HttpMethods.POST,
        HttpMethods.PUT,
      ],
      allowedHeaders: ["*"],
    };

    const bucket = new Bucket(this, "BUCKET_ID", {
      bucketName: "BUCKET_NAME",
      cors: [corsObj],
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    /**
     * OPTIONAL
     * if you don't need CDN on S3 you can remove the below code
     */
    new cloudfront.Distribution(this, "CDN_ID", {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
    });
  }
}
