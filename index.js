const vpc = require('./src/vpc');
const subnet  = require('./src/subnet');
const internetGateway = require('./src/internetGateway');
const routeTable = require("./src/routeTable");
const securityGroup = require("./src/securityGroups");
const ec2Instance = require("./src/ec2");

const pulumi = require('@pulumi/pulumi');
const config = new pulumi.Config();

create = async (name) => {
    await subnet.getAvailabilityZones();
    subnet.calculateSubnetCidrBlocks();
    const myvpc = vpc.createVpc(name);
    await subnet.createPublicSubnets(myvpc.id, name);
    await subnet.createPrivateSubnets(myvpc.id, name);
    const igw = internetGateway.createIG(name);
    internetGateway.attachVpc(myvpc.id, igw.id, name);
    const publicRT = routeTable.createPublicRouteTable(myvpc.id, name);
    routeTable.createPublicRoute(publicRT.id, igw.id, name);
    routeTable.associatePublicSubnets(subnet.publicSubnets, publicRT.id, name);
    const privateRT = routeTable.createPrivateRouteTable(myvpc.id, name);
    routeTable.associatePrivateSubnets(subnet.privateSubnets, privateRT.id, name);
    const sgId = securityGroup.createApplicationSecurityGroup(myvpc.id);
    const ec2 = ec2Instance.createEc2(name, sgId, subnet.publicSubnets[0].id);
}

create(config.get("name"));