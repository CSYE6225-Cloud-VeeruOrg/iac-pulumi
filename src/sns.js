const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");


const sns = {};

sns.createTopic = (name) => {
    const snsTopic = new aws.sns.Topic(`${name}-snsTopic`, {
        displayName: `${name}-snsTopic`
    });
    return snsTopic;
};

sns.subcribeTopic = (name, topicArn, lambdaArn) => {
    const snsSubcription = new aws.sns.TopicSubscription(`${name}-lambda-subcription`, {
        topic: topicArn,
        protocol: "lambda",
        endpoint: lambdaArn,
    });
    return snsSubcription;
}

module.exports = sns;