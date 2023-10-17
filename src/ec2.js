const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const fs = require('fs');

const config = new pulumi.Config();
const amiId = config.get("amiId");
const publicKeyName = config.get("aws-ec2-keyName");

const ec2 = {};

ec2.createEc2 = (name, securityGroupId, subnetId) => {
    const ec2Instance = new aws.ec2.Instance(`${name}-ec2-instance`, {
        ami: amiId,
        instanceType: config.get("instanceType"),
        vpcSecurityGroupIds: [securityGroupId],
        subnetId: subnetId,
        rootBlockDevice: {
            volumeSize: config.getNumber("volumeSize"),
            volumeType: config.get("volumeType"),
            deleteOnTermination: true,
        },
        associatePublicIpAddress: true,
        keyName: publicKeyName,
        tags: {
            Name: `${name}-ec2-instance`,
        },
        disableApiTermination: false,
    });
    return ec2Instance.id;
}

module.exports = ec2;