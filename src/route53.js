const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const config = new pulumi.Config();
const hostedZoneId = config.get("hostedZoneId");
const subdomain = config.get("stack");

const route53 = {};

route53.createArecord = (alb) => {
    // const aRecord = new aws.route53.Record(subdomain, {
    //     zoneId: hostedZoneId,
    //     name: `${subdomain}.saiveerendra-prathipati.me`,
    //     type: "A",
    //     ttl: 60,
    //     records: [ec2Ip]
    // });
    const aRecord = new aws.route53.Record(subdomain, {
        zoneId: hostedZoneId,
        name: `${subdomain}.saiveerendra-prathipati.me`,
        type: "A",
        aliases: [{
            name: alb.dnsName,
            zoneId: alb.zoneId,
            evaluateTargetHealth: true,
        }],
    });
    return aRecord;
};

module.exports = route53;