# CDK - AWS Node.js Typescript

This project contains a samples of the AWS services.

## Installation/deployment instructions

### Using NPM

- Run `npm install` to install the project dependencies

### Using Yarn

- Run `yarn install` to install the project dependencies

### Bootstrapping

- Run `cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1 aws://ACCOUNT-NUMBER-2/REGION-2` to bootstrap one or more AWS environments

### Deploy Stacks

- Run `cdk deploy` to deploy the cdk pipline to create all stacks.

## Template features

### Project structure

The project code base is mainly located within the `lib` folder. This folder is divided in:

- `cdkPipeline` - this pipeline create all stacks
- `stages` - containing stages of the cdk pipline
- `stacks` - containing your stacks

```
.
├── bin
│   └── aws-devops-samples.ts   # where we define the stack we want to deploy
├── lib
│   ├── stages                  # stages of the cdk pipline
│   ├── stacks                  # containing your stacks
│   └── cdkPipeline.ts          # Pipeline for deployin all stacks
├── package.json
├── cdk.json                 # where the AWS CDK caches context values retrieved from your AWS account
└── tsconfig.json            # Typescript compiler configuration
```
