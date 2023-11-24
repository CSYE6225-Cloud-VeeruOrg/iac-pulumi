const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const iam = {};

iam.createec2CloudWatchRole = () => {
    const ec2CloudWatchRole = new aws.iam.Role("ec2-cloudwatch-role", {
        assumeRolePolicy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: "ec2.amazonaws.com",
                },
                Action: "sts:AssumeRole",
              },
            ],
        }),
    });

    const policyAttachment = new aws.iam.PolicyAttachment("ec2-cloudwatch-policy", {
        roles: [ec2CloudWatchRole.name],
        policyArn: "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
    });

    const instanceProfile = new aws.iam.InstanceProfile("ec2-cloudwatch-instance-profile", {
        role: ec2CloudWatchRole.name
    });

    return instanceProfile;
}

iam.createLambdaRole = (dynamoDBArn, secretsARN) => {
  const lambdaRole = new aws.iam.Role(`lambda-function-role`, {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
            Action: "sts:AssumeRole",
        }],
    }),
    
  });

  const lambdaPolicy = new aws.iam.Policy("lambdaPolicy", {
    policy: dynamoDBArn.apply(arn => JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["ses:SendEmail", "ses:SendRawEmail"],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"],
                "Resource": arn
            },
            {
                "Effect": "Allow",
                "Action": ["sns:Publish"],
                "Resource": "*" 
            }
        ],
    }),
    )
  });

  // const secretsPolicy = new aws.iam.Policy("secretsPolicy", {
  //   policy: secretsARN.apply(arn => JSON.stringify({
  //       "Version": "2012-10-17",
  //       "Statement": [
  //           {
  //               "Action": ["secretsmanager:GetSecretValue"],
  //               "Effect": "Allow",
  //               "Resource": arn
  //           }
  //       ],
  //   }),
  //   )
  // });

  const rolePolicyAttachment = new aws.iam.RolePolicyAttachment("lambdaRolePolicyyAttachment", {
    role: lambdaRole.name,
    policyArn: lambdaPolicy.arn,
  });

//   const roleSecretsPolicyAttachment = new aws.iam.RolePolicyAttachment("lambdaRoleSecretPolicyyAttachment", {
//     role: lambdaRole.name,
//     policyArn: secretsPolicy.arn,
// });

  const lambdaBasicExecutionAttachment = new aws.iam.RolePolicyAttachment("lambdaBasicExecutionAttachment", {
    role: lambdaRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  });

  return lambdaRole;
}

module.exports = iam;