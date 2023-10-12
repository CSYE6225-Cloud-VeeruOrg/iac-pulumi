const vpc = require('./src/vpc');
const subnet  = require('./src/subnet');
const internetGateway = require('./src/internetGateway');
const routeTable = require("./src/routeTable");

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
}

create(config.get("name"));