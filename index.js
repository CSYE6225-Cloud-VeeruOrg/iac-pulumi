const vpc = require('./src/vpc');
const subnet  = require('./src/subnet');
const internetGateway = require('./src/internetGateway');
const routeTable = require("./src/routeTable");
const securityGroup = require("./src/securityGroups");
const ec2Instance = require("./src/ec2");
const rds = require('./src/rds');

const pulumi = require('@pulumi/pulumi');
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
    const appsgId = securityGroup.createApplicationSecurityGroup(myvpc.id);
    const dbsgId = securityGroup.createDbSecurityGroup(name, myvpc.id, appsgId);
    const rdsParameterGroup = rds.createRdsParameterGroup();
    const myRds = await rds.createRdsInstance(name, rdsParameterGroup, dbsgId, privateSubnetGroup); 
    const ec2 = ec2Instance.createEc2(name, appsgId, subnet.publicSubnets[0].id, myRds);
}

create(config.get("name"));