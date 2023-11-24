const aws = require("@pulumi/aws");

const secrets = {};

secrets.createSecret = (name, key) => {
    let gcpKeySecret = new aws.secretsmanager.Secret(`${name}-GcpKeySecret4`, {
        name: "GcpKey4",
        description: "This secret holds the GCP Service account key",
    });
    
    new aws.secretsmanager.SecretVersion("GcpKeySecretVersion", {
        secretId: gcpKeySecret.id,
        secretString: key
    });

    return gcpKeySecret;
};

module.exports = secrets;