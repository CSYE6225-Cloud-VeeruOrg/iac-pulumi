const aws = require("@pulumi/aws");
const pulumi = require("@pulumi/pulumi");

const config = new pulumi.Config();
const cidrBlock = config.require("baseCIDR");

const vpc = {};

vpc.createVpc = (name) => {
    const vpc = new aws.ec2.Vpc(`${name}-vpc-dev`, {
        cidrBlock: cidrBlock,
        enableDnsHostnames: true,
        enableDnsSupport: true,
        tags: {
            Name: `${name}-vpc`
        }
    });
    return vpc;
};

module.exports = vpc;