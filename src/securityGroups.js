const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

const config = new pulumi.Config();

const securityGroup = {};

securityGroup.createApplicationSecurityGroup = (vpcId) => {
    const securityGroup = new aws.ec2.SecurityGroup(`applicationSecurityGroup`, {
    vpcId: vpcId,
    ingress: [
        {
            protocol: 'tcp',
            fromPort: 22,
            toPort: 22,
            cidrBlocks: ['0.0.0.0/0'],
        },
        {
            protocol: 'tcp',
            fromPort: 80,
            toPort: 80,
            cidrBlocks: ['0.0.0.0/0'],
        },
        {
            protocol: 'tcp',
            fromPort: 443,
            toPort: 443,
            cidrBlocks: ['0.0.0.0/0'],
        },
        {
            protocol: 'tcp',
            fromPort: config.get("applicationPort"),
            toPort: config.get("applicationPort"),
            cidrBlocks: ['0.0.0.0/0'],
        },
    ],
    tags: {
        name: `applicationSecurityGroup`
    }
});
    return securityGroup.id;
}

module.exports = securityGroup;