const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const path = require('path');
const gcpConfig = new pulumi.Config("gcp");
const gcpAccount = gcpConfig.get("project");

const lambda = {};

lambda.createLambdaFunction = (name, iamRole, gcpBucket, dynamoDB, snsTopic, key, serviceEmail) => {
    const lambdaFunction = new aws.lambda.Function(`${name}-lambda-function`, {
        code: new pulumi.asset.FileArchive(path.join(__dirname, '..', 'lambda')),
        role: iamRole.arn,
        handler: "index.handler",
        runtime: "nodejs18.x",
        environment: {
            variables: {
                GCP_PROJECT_ID: gcpAccount,
                BUCKET_NAME: gcpBucket,
                DYNAMODB_TABLE: dynamoDB,
                SERVICE_EMAIL: serviceEmail,
                ACCESS_KEY: key
            },
        },
    });

    new aws.lambda.Permission("permission", {
        action: "lambda:InvokeFunction",
        "function": lambdaFunction.name,
        principal: "sns.amazonaws.com",
        sourceArn: snsTopic.arn,
    });
    return lambdaFunction;
};

module.exports = lambda;