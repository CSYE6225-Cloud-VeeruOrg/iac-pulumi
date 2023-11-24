const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const config = new pulumi.Config();
const gcpAccount = config.get("gcp:project");

const dynamoDB = {};

dynamoDB.createTable = (name) => {
    const dynamoDbTable = new aws.dynamodb.Table(`${name}-emailTracking`, {
        attributes: [{
            name: "id",
            type: "S",
        }],
        hashKey: "id",
        readCapacity: 20,
        writeCapacity: 20,
    });
    return dynamoDbTable;
};

module.exports = dynamoDB;