const vpc = require('./src/vpc');
const subnet  = require('./src/subnet');
const internetGateway = require('./src/internetGateway');
const routeTable = require("./src/routeTable");
const securityGroup = require("./src/securityGroups");
const ec2Instance = require("./src/ec2");
const rds = require('./src/rds');
const route53 = require('./src/route53');
const iam = require('./src/iam');
const autoScaling = require('./src/autoScaling');

const pulumi = require('@pulumi/pulumi');
const loadBalancer = require('./src/loadBalancer');
const config = new pulumi.Config();

create = async (name) => {
    await subnet.getAvailabilityZones();
    const myvpc = vpc.createVpc(name);
    await subnet.createPublicSubnets(myvpc.id, name);
    await subnet.createPrivateSubnets(myvpc.id, name);
    const privateSubnetGroup = await subnet.createPrivateSubnetsGroup(name, subnet.privateSubnets);
    const igw = internetGateway.createIG(name);
    internetGateway.attachVpc(myvpc.id, igw.id, name);
    const publicRT = routeTable.createPublicRouteTable(myvpc.id, name);
    routeTable.createPublicRoute(publicRT.id, igw.id, name);
    routeTable.associatePublicSubnets(subnet.publicSubnets, publicRT.id, name);
    const privateRT = routeTable.createPrivateRouteTable(myvpc.id, name);
    routeTable.associatePrivateSubnets(subnet.privateSubnets, privateRT.id, name);
    const lbsgId = securityGroup.createLbSecurityGroup(name, myvpc.id);
    const appsgId = securityGroup.createApplicationSecurityGroup(myvpc.id, lbsgId);
    const dbsgId = securityGroup.createDbSecurityGroup(name, myvpc.id, appsgId);
    const rdsParameterGroup = rds.createRdsParameterGroup();
    const myRds = await rds.createRdsInstance(name, rdsParameterGroup, dbsgId, privateSubnetGroup); 
    const instanceProfile = iam.createRole();
    const targetGroup = loadBalancer.createTragetGroup(name, myvpc.id);
    const launchTemplate = ec2Instance.createLaunchTemplate(name, appsgId, instanceProfile.name, myRds);
    const asGroup = autoScaling.createAutoScalingGroup(name, launchTemplate, subnet.publicSubnets, targetGroup.arn);
    autoScaling.createScaleUpPolicy(name, asGroup);
    autoScaling.createScaleDownPolicy(name, asGroup);
    const alb = loadBalancer.create(name, lbsgId, subnet.publicSubnets);
    const listener = loadBalancer.createListener(name, alb, targetGroup);
    // const asAttachment = autoScaling.createasAttachment(name, asGroup.name, targetGroup.arn);
    const aRecord = route53.createArecord(alb);
}

create(config.get("name"));