const aws = require("@pulumi/aws");
const pulumi = require('@pulumi/pulumi');

const config = new pulumi.Config();
const region = config.get("aws:region");
let noOfPublicSubnets = config.getNumber("noOfPublicSubnets");
let noOfPrivateSubnets = config.getNumber("noOfPrivateSubnets");
const publicSubnetCidrBlocks = config.getObject("publicSubnetCidrBlocks");
const privateSubnetCidrBlocks = config.getObject("privateSubnetCidrBlocks");

const subnet = {};
subnet.publicSubnets = [];
subnet.privateSubnets = [];
let availabilityZones = [];

subnet.getAvailabilityZones = async () => {
    availabilityZones = (await aws.getAvailabilityZones({ state: "available", region: region })).names;
    noOfPublicSubnets = Math.min(noOfPublicSubnets, availabilityZones.length);
    noOfPrivateSubnets = Math.min(noOfPrivateSubnets, availabilityZones.length);
    return availabilityZones;
}

subnet.createPublicSubnets = async (vpcId, name) => {
    const subnets = [];
    for(let i = 0; i < noOfPublicSubnets; i++) {
        const publicSubnet = new aws.ec2.Subnet(`${name}-public-subnet-${i}`, {
            vpcId: vpcId,
            mapPublicIpOnLaunch: true,
            cidrBlock: publicSubnetCidrBlocks[i],
            availabilityZone: availabilityZones[i],
            mapPublicIpOnLaunch: true,
            tags: {
                Name: `${name}-public-subnet-${i}`
            }
        });
        subnets.push(publicSubnet);
        subnet.publicSubnets = subnets;
    }
}

subnet.azs = availabilityZones;

subnet.createPrivateSubnets = async (vpcId, name) => {
    const subnets = [];
    for(let i = 0; i < noOfPrivateSubnets; i++) {
        const privateSubnet = new aws.ec2.Subnet(`${name}-private-subnet-${i}`, {
            vpcId: vpcId,
            cidrBlock: privateSubnetCidrBlocks[i],
            availabilityZone: availabilityZones[i],
            tags: {
                Name: `${name}-private-subnet-${i}`
            }
        });
        subnets.push(privateSubnet);
        subnet.privateSubnets = subnets;
    }
}

subnet.createPrivateSubnetsGroup = async (name, privateSubnets) => {
    const privateSubnetIds = privateSubnets.map(psn => {
        return psn.id;
    })
    const privateSubnetGroup = new aws.rds.SubnetGroup(`${name}-private-subnet-group`, {
        subnetIds: privateSubnetIds,
    });
    return privateSubnetGroup;
}

module.exports = subnet;