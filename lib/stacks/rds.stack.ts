import {
  Construct,
  Duration,
  SecretValue,
  Stack,
  StackProps,
} from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as ec2 from "@aws-cdk/aws-ec2";

export class RDSStack extends Stack {
  constructor(app: Construct, stackId: string, props?: StackProps) {
    super(app, stackId, props);

    /**
     * You can get an existing vpc or creating a new one
     */
    const vpcInstance = ec2.Vpc.fromLookup(this, "VPC_ID", {
      isDefault: true, // if this vpc default or not
      vpcId: "VPC_ID",
    });

    // const vpcInstance = new ec2.Vpc(this, "VPC_ID", {});

    /**
     * You can get an existing subnets or creating a new one
     */
    const subnetsArr: Array<ec2.ISubnet> = [];
    const subnets = [
      { id: "SUBNET1", subnetId: "subnet-123" },
      { id: "SUBNET2", subnetId: "subnet-456" },
      { id: "SUBNET3", subnetId: "subnet-789" },
    ];
    subnets.map((subnet) => {
      subnetsArr.push(
        ec2.Subnet.fromSubnetId(this, subnet.id, subnet.subnetId)
      );
    });

    // const subnet1 = new ec2.Subnet(this, "SUBNET_ID", {
    //   vpcId: vpcInstance.vpcId,
    //   cidrBlock: "CIDR_BLOCK",
    //   availabilityZone: "AZ",
    // });
    // subnetsArr.push(subnet1);
    // const subnet2 = new ec2.Subnet(this, "SUBNET_ID", {
    //   vpcId: vpcInstance.vpcId,
    //   cidrBlock: "CIDR_BLOCK",
    //   availabilityZone: "AZ",
    // });
    // subnetsArr.push(subnet2);

    const cluster = new rds.ServerlessCluster(this, "DATABASE_ID", {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL, // You can choose the type of engine
      defaultDatabaseName: "DATABASE_NAME",
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        "ParameterGroup",
        "default.aurora-postgresql10"
      ),
      vpc: vpcInstance,
      vpcSubnets: {
        subnets: subnetsArr,
      },
      enableDataApi: true,
      credentials: {
        username: "DATABASE_USERNAME",
        password: SecretValue.secretsManager("PASSWORD_NAME"),
      },
      scaling: {
        autoPause: Duration.minutes(5), // default is to pause after 5 minutes of idle time
        minCapacity: rds.AuroraCapacityUnit.ACU_2, // default is 2 Aurora capacity units (ACUs)
        maxCapacity: rds.AuroraCapacityUnit.ACU_16, // default is 16 Aurora capacity units (ACUs)
      },
    });
  }
}
