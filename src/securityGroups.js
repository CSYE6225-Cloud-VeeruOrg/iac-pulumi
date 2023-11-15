const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

const config = new pulumi.Config();
const ports = config.getObject("ports");

const securityGroup = {};

securityGroup.createApplicationSecurityGroup = (vpcId, lbsgId) => {
    const securityGroup = new aws.ec2.SecurityGroup(`applicationSecurityGroup`, {
    vpcId: vpcId,
    ingress: [
        {
            protocol: 'tcp',
            fromPort: ports[0],
            toPort: ports[0],
            cidrBlocks: ['0.0.0.0/0']
            // securityGroups: [lbsgId]
        },
        {
            protocol: 'tcp',
            fromPort: ports[3],
            toPort: ports[3],
            securityGroups: [lbsgId]
        },
    ],
    egress: [
            {
                protocol: '-1',
                fromPort: 0,
                toPort: 0,
                cidrBlocks: ['0.0.0.0/0'],
            },
        ],
    tags: {
        name: `applicationSecurityGroup`
    }
});
    return securityGroup.id;
}

securityGroup.createDbSecurityGroup = (name, vpcId, appsgId) => {
    const dbSecurityGroup = new aws.ec2.SecurityGroup(`${name}-databaseSecurityGroup`, {
        description: "DB Security Group for RDS",
        vpcId: vpcId,
        ingress: [
            {
                protocol: 'tcp',
                fromPort: ports[4],
                toPort: ports[4],
                securityGroups: [appsgId]
            },
        ],
        tags: {
            name: `databaseSecurityGroup`
        }
    });
    return dbSecurityGroup.id;
}

securityGroup.createLbSecurityGroup = (name, vpcId) => {
    const lbSecurityGroup = new aws.ec2.SecurityGroup(`${name}-lbSecurityGroup`, {
        description: 'Load Balancer Security Group',
        vpcId: vpcId,
        ingress: [
            {
                protocol: 'tcp',
                fromPort: ports[1],
                toPort: ports[1],
                cidrBlocks: ['0.0.0.0/0'],
            },
            {
                protocol: 'tcp',
                fromPort: ports[2],
                toPort: ports[2],
                cidrBlocks: ['0.0.0.0/0'],
            },
        ],
        egress: [{
            protocol: '-1', 
            toPort: 0, 
            fromPort: 0, 
            cidrBlocks: ['0.0.0.0/0'],
        }],
        tags: {
            name: `loadBalancerSecurityGroup`
        }
    });
    return lbSecurityGroup.id;
}

module.exports = securityGroup;