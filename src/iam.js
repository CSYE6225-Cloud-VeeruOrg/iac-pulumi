const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const iam = {};

iam.createEc2Role = (snsArn) => {
  const ec2Role = new aws.iam.Role("ec2-role", {
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
    roles: [ec2Role.name],
    policyArn: "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  });

  const snsPolicy = new aws.iam.Policy("snsPolicy", {
    policy: snsArn.apply(arn => JSON.stringify({
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Action: "sns:Publish",
        Resource: arn,
      },
    ],
    })
    )
  });

  const snsPolicyAttachment = new aws.iam.RolePolicyAttachment("snsPolicyAttachment", {
    role: ec2Role.name,
    policyArn: snsPolicy.arn,
  });

  const instanceProfile = new aws.iam.InstanceProfile("ec2-instance-profile", {
    role: ec2Role.name
  });

  return instanceProfile;
}

iam.createLambdaRole = (dynamoDBArn) => {
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
            }
        ],
    }),
    )
  });

  const rolePolicyAttachment = new aws.iam.RolePolicyAttachment("lambdaRolePolicyyAttachment", {
    role: lambdaRole.name,
    policyArn: lambdaPolicy.arn,
  });

  const lambdaBasicExecutionAttachment = new aws.iam.RolePolicyAttachment("lambdaBasicExecutionAttachment", {
    role: lambdaRole.name,
    policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  });

  return lambdaRole;
}

module.exports = iam;