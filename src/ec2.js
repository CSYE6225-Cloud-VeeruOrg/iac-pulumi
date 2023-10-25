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

ec2.createEc2 = (name, securityGroupId, subnetId, rds) => {
    // const rdsEndpoint = rds.endpoint.apply(endpoint => `PGHOST=${endpoint}`.toString());
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
        userData: pulumi.interpolate`#!/bin/bash
        sudo yum update -y
        echo "PGHOST=${rds.address}" >> /etc/environment
        echo "PGUSER=${rds.username}" >> /etc/environment
        echo "PGPASSWORD=${rds.password}" >> /etc/environment
        echo "PGDATABASE=${rds.dbName}" >> /etc/environment
        echo "PGPORT=${rds.port}" >> /etc/environment
        sudo chown -R csye6225:csye6225 /etc/environment
        sudo chmod -R 755 /etc/environment
        `
    });
    return ec2Instance.id;
}

module.exports = ec2;