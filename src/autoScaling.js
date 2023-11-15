const pulumi = require('@pulumi/pulumi');
const aws = require('@pulumi/aws');

const autoscaling = {};

autoscaling.createAutoScalingGroup = (name, launchTemplate, publicSubnets, tg) => {
    const publicSubnetIds = publicSubnets.map(psn => {
        return psn.id;
    });
    const asg = new aws.autoscaling.Group(`${name}-asg`, {
        vpcZoneIdentifiers: publicSubnetIds,
        desiredCapacity: 1,
        maxSize: 3,
        minSize: 1,
        launchTemplate: {
            id: launchTemplate.id,
            version: launchTemplate.latestVersion,
        },
        targetGroupArns: [tg],
        healthCheckType: "EC2",
        healthCheckGracePeriod: 180,
        cooldown: 60,
        tags: [{
            key: "ASG",
            value: `${name}-asg`,
            propagateAtLaunch: true,
        }],
    });
    return asg;
};

autoscaling.createScaleUpPolicy = (name, asg) => {
    const scaleUpPolicy = new aws.autoscaling.Policy(`${name}-ScaleUp`, {
        adjustmentType: "ChangeInCapacity",
        cooldown: 60,
        metricAggregationType: "Average",
        policyType: "SimpleScaling",
        scalingAdjustment: 1, 
        autoscalingGroupName: asg.name,
    });
    const highCpuAlarm = new aws.cloudwatch.MetricAlarm(`${name}-highCpuAlarm`, {
        comparisonOperator: "GreaterThanThreshold",
        evaluationPeriods: "2",
        metricName: "CPUUtilization",
        namespace: "AWS/EC2",
        period: 60,
        statistic: "Average",
        threshold: "5",
        alarmDescription: "This metric checks cpu usage and scales up if usage is higher than 5%",
        alarmActions: [scaleUpPolicy.arn],
        dimensions: {
            AutoScalingGroupName: asg.name,
        },
    });
    return scaleUpPolicy;
};

autoscaling.createScaleDownPolicy = (name, asg) => {
    const scaleDownPolicy = new aws.autoscaling.Policy(`${name}-ScaleDown`, {
        adjustmentType: "ChangeInCapacity",
        cooldown: 60,
        metricAggregationType: "Average",
        policyType: "SimpleScaling",
        scalingAdjustment: -1, 
        autoscalingGroupName: asg.name, 
    });
      const lowCpuAlarm = new aws.cloudwatch.MetricAlarm(`${name}-lowCpuAlarm`, {
        comparisonOperator: "LessThanThreshold",
        evaluationPeriods: "2",
        metricName: "CPUUtilization",
        namespace: "AWS/EC2",
        period: 60,
        statistic: "Average",
        threshold: "3",
        alarmDescription: "This metric checks cpu usage and scales down if usage is below 3%",
        alarmActions: [scaleDownPolicy.arn],
        dimensions: {
            AutoScalingGroupName: asg.name,
        },
    });
    return scaleDownPolicy;
};

autoscaling.createasAttachment = (name, asg, tg) => {
    const autoScalingGroupAttachment = new aws.autoscaling.Attachment(`${name}-asg-attachment`, {
        autoscalingGroupName: asg,
        // albTargetGroupArn: tg,
        lbTargetGroupArn:tg
    });
    return autoScalingGroupAttachment;
}


module.exports = autoscaling;