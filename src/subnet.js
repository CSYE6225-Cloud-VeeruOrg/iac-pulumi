const aws = require("@pulumi/aws");
const pulumi = require('@pulumi/pulumi');

var SubnetCIDRAdviser = require('subnet-cidr-calculator');

const config = new pulumi.Config();
const region = config.get("aws:region");
const baseCIDR = config.get("baseCIDR");
let noOfPublicSubnets = config.getNumber("noOfPublicSubnets");
let noOfPrivateSubnets = config.getNumber("noOfPrivateSubnets");
// const subnetCidrBlocks = config.getObject("subnetCidrBlocks");

const subnet = {};
let subnetCidrBlocks = {};
subnet.publicSubnets = [];
subnet.privateSubnets = [];
let availabilityZones = [];

subnet.calculateSubnetCidrBlocks = () => {
   subnetCidrBlocks = SubnetCIDRAdviser.calculate(baseCIDR.split('/')[0], baseCIDR.split('/')[1]);
}

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
            cidrBlock: subnetCidrBlocks.subnets[i].value,
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
            cidrBlock: subnetCidrBlocks.subnets[i + 3].value,
            availabilityZone: availabilityZones[i],
            tags: {
                Name: `${name}-private-subnet-${i}`
            }
        });
        subnets.push(privateSubnet);
        subnet.privateSubnets = subnets;
    }
}

module.exports = subnet;