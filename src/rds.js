const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const rds = {};

rds.createRdsParameterGroup = () => {
    const rdsParameterGroup = new aws.rds.ParameterGroup("pg-db-parameter-group", {
        family: "postgres14",
        description: "Parameter group for Postgres DB RDS",
    });
    return rdsParameterGroup;
}

rds.createRdsInstance = async (name, rdsParameterGroup, dbSecurityGroupId, privateSubnetGroupName) => {
    const rdsInstance = new aws.rds.Instance(`${name}-rds`, {
        allocatedStorage: 10,
        storageType: "gp2",
        engine: "postgres",
        engineVersion: "14.6",
        instanceClass: "db.t3.micro",
        licenseModel:"postgresql-license",
        multiAz: false,
        name: "csye6225",
        username: "csye6225",
        password: "Hitman4527",
        parameterGroupName: rdsParameterGroup.name,
        skipFinalSnapshot: true,
        vpcSecurityGroupIds: [ dbSecurityGroupId ],
        dbSubnetGroupName: privateSubnetGroupName,
        publiclyAccessible: false,
    });
    return rdsInstance;
}

module.exports = rds;
