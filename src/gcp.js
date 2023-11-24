const pulumi = require('@pulumi/pulumi');
const gcp = require('@pulumi/gcp');

const gcloud = {};

gcloud.createBucket = (name) => {
    const bucket = new gcp.storage.Bucket(`${name}-csye6225-assignments`, {
        location: "US",
        forceDestroy: true,
    });
    return bucket;
};

gcloud.createServiceAccount = (name) => {
    const serviceAccount = new gcp.serviceaccount.Account(`${name}-GcpServiceAccount`, {
        accountId: `${name}-dev-service-account`,
        displayName: "Dev Service Account",
    });
    return serviceAccount;
}

gcloud.createKey = (name, serviceAccountId) => {
    const key = new gcp.serviceaccount.Key(`${name}-GcpServiceAccountKey`, {
        serviceAccountId: serviceAccountId
    });
    return key;
}

gcloud.bindAccount = (name, serviceAccountEmail, bucketName) => {
    const binding = new gcp.storage.BucketIAMMember(`${name}-service-account-bucket-member`, {
        bucket: bucketName,
        role: 'roles/storage.objectCreator',
        member: pulumi.interpolate`serviceAccount:${serviceAccountEmail}`,
    });
}

module.exports = gcloud;