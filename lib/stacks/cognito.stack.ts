import {
  CfnResource,
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
} from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import * as iam from "@aws-cdk/aws-iam";
import { CfnIdentityPoolRoleAttachment } from "@aws-cdk/aws-cognito/lib/cognito.generated";

export class CognitoStack extends Stack {
  constructor(app: Construct, stackId: string, props?: StackProps) {
    super(app, stackId, props);

    let userPool = new cognito.UserPool(this, "USER_POOL_ID", {
      userPoolName: "USER_POOL_NAME",
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
        phone: true,
      },
      signInCaseSensitive: true,
      passwordPolicy: {
        minLength: 6,
        requireDigits: true,
        requireLowercase: true,
        requireSymbols: false,
        requireUppercase: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.LINK,
      },
    });

    const resource = userPool.node.findChild(`Resource`) as CfnResource;
    resource.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const poolClientApp = userPool.addClient("USER_POOL_CLIENT_ID", {
      authFlows: {
        userSrp: true,
        userPassword: true,
        adminUserPassword: true,
      },
      preventUserExistenceErrors: true,
      generateSecret: false,
    });

    const identityPool = new cognito.CfnIdentityPool(
      this,
      "FEDERATED_IDENTITY_ID",
      {
        allowUnauthenticatedIdentities: true,
        allowClassicFlow: true,
        identityPoolName: "IDENTITY_NAME",
        cognitoIdentityProviders: [
          {
            clientId: poolClientApp.userPoolClientId,
            providerName: userPool.userPoolProviderName,
          },
        ],
      }
    );
  }
}
