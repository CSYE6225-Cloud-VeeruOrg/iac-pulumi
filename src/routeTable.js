const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const config = new pulumi.Config();
const destinationCidrBlock = config.require("destinationCidrBlock");

const routeTable = {};

routeTable.createPublicRouteTable = (vpcId, name) => {
    const publicRT = new aws.ec2.RouteTable(`${name}-Public-Route-Table`, {
        vpcId: vpcId,
        tags: {
            Name: `${name}-public-route-table`
        }
    })

    return publicRT;
}

routeTable.createPublicRoute = (pRTId, igwId, name) => {
    new aws.ec2.Route(`${name}-public-route`, {
        routeTableId: pRTId,
        destinationCidrBlock: destinationCidrBlock,
        gatewayId: igwId,
        tags: {
            Name: `${name}-public-route`
        }
    });
}

routeTable.associatePublicSubnets = (publicSubnets, pRTId, name) => {
    publicSubnets.map((subnet, index) => {
        new aws.ec2.RouteTableAssociation(`${name}-public-subnet-association-${index}`, {
            subnetId: subnet.id,
            routeTableId: pRTId,
            tags: {
                Name: `${name}-public-subnet-association-${index}`
            }
        });
    });
}

routeTable.createPrivateRouteTable = (vpcId, name) => {
    const privateRT = new aws.ec2.RouteTable(`${name}-Private-Route-Table`, {
        vpcId: vpcId,
        tags: {
            Name: `${name}-private-route-table`
        }
    })
    return privateRT;
}

routeTable.associatePrivateSubnets = (privateSubnets, pRTId, name) => {
    privateSubnets.map((subnet, index) => {
        new aws.ec2.RouteTableAssociation(`${name}-private-subnet-association-${index}`, {
            subnetId: subnet.id,
            routeTableId: pRTId,
            tags: {
                Name: `${name}-private-public-subnet-association-${index}`
            }
        });
    });
}

module.exports = routeTable;