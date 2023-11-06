const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const config = new pulumi.Config();
const hostedZoneId = config.get("hostedZoneId");

const iam = {};

iam.createRole = () => {
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

module.exports = iam;