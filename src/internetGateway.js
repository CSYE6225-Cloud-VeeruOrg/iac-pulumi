const aws = require("@pulumi/aws");

const internetGateway = {};

internetGateway.createIG = (name) => {
    const igw = new aws.ec2.InternetGateway(`${name}-igw`, {
        tags: {
            Name: `${name}-igw-1`
        }
    });
    console.log(igw.id);
    return igw;
}

internetGateway.attachVpc = (vpcId, igwId, name) => {
    const igwAttachement = new aws.ec2.InternetGatewayAttachment(`${name}-igw`, {
        vpcId: vpcId,
        internetGatewayId: igwId,
        tags: {
            Name: `${name}-igw-1`
        }
    });
    return igwAttachement;
}

module.exports = internetGateway;