const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const config = new pulumi.Config();
const ports = config.getObject("ports");

const loadBalancer = {};

loadBalancer.create = (name, lbsgId, publicSubnets) => {
    const publicSubnetIds = publicSubnets.map(psn => {
        return psn.id;
    });
    const alb = new aws.lb.LoadBalancer(`${name}-loadbalancer`, {
        internal: false,
        loadBalancerType: "application",
        securityGroups: [lbsgId],
        subnets: publicSubnetIds,
        enableDeletionProtection: false
    });
    return alb;
};

loadBalancer.createTragetGroup = (name, vpcId) => {
    const targetGroup = new aws.lb.TargetGroup(`${name}-targetgroup`, {
        port: ports[3],
        protocol: "HTTP",
        targetType: "instance",
        vpcId: vpcId,
        deregistrationDelay: "180",
        healthCheck: {
            enabled: true,
            path: "/healthz",
            protocol: "HTTP",
            interval: 300,
            port: ports[3]
        },
    });
    return targetGroup;
};

loadBalancer.createListener = (name, alb, tg) => {
    const listener = new aws.lb.Listener(`${name}-listener`, {
        loadBalancerArn: alb.arn,
        port: ports[1],
        protocol: "HTTP",
        defaultActions: [{
            type: "forward",
            targetGroupArn: tg.arn,
        }],
    });
    return listener;
};

module.exports = loadBalancer;