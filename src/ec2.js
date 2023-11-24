const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');
const fs = require('fs');
const AWS = require('aws-sdk');
const config = new pulumi.Config();
const awsConfig = new pulumi.Config("aws");
const amiId = config.get("amiId");
const publicKeyName = config.get("aws-ec2-keyName");
const region = awsConfig.get("region");
AWS.config.update({ region: region });
const profile = config.get("stack");
const credentials = new AWS.SharedIniFileCredentials({ profile: profile });
AWS.config.credentials = credentials;
const ec2 = {};

ec2.createEc2 = (name, securityGroupId, subnetId, rds, instanceProfileName) => {
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
        iamInstanceProfile: instanceProfileName,
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
        sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
            -a fetch-config \
            -m ec2 \
            -c file:/opt/AmazonCloudWatch-config.json \
            -s
        sudo systemctl restart amazon-cloudwatch-agent
        `
    });
    return ec2Instance;
}

ec2.createLaunchTemplate = (name, securityGroupId, instanceProfileName, rds, topicArn) => {
    let userDataScript = pulumi.interpolate`#!/bin/bash
    sudo yum update -y
    echo "PGHOST=${rds.address}" >> /etc/environment
    echo "PGUSER=${rds.username}" >> /etc/environment
    echo "PGPASSWORD=${rds.password}" >> /etc/environment
    echo "PGDATABASE=${rds.dbName}" >> /etc/environment
    echo "PGPORT=${rds.port}" >> /etc/environment
    echo "ACCESS_KEY = ${AWS.config.credentials.accessKeyId}" >> /etc/environment
    echo "SECRET_ACCESS_KEY = ${AWS.config.credentials.secretAccessKey}" >> /etc/environment
    echo "AWS_REGION=${region}" >> /etc/environment
    echo "TOPIC_ARN=${topicArn}" >> /etc/environment
    sudo chown -R csye6225:csye6225 /etc/environment
    sudo chmod -R 755 /etc/environment
    sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
        -a fetch-config \
        -m ec2 \
        -c file:/opt/AmazonCloudWatch-config.json \
        -s
    sudo systemctl restart amazon-cloudwatch-agent
    `;
    const encodedUserData = pulumi.all([userDataScript]).apply(([userData]) => {
        return Buffer.from(userData).toString("base64");
    });
    const template = new aws.ec2.LaunchTemplate(`${name}-launch-template`, {
        imageId: amiId,
        instanceType: config.get("instanceType"),
        keyName: publicKeyName,
        networkInterfaces: [{
            associatePublicIpAddress: true,
            deleteOnTermination: true,
            deviceIndex: 0,
            securityGroups: [securityGroupId],
        }],
        userData: encodedUserData,
        iamInstanceProfile: {
            name: instanceProfileName,
        },
    });
    return template;
}

module.exports = ec2;