# iac-pulumi

## Steps to Create a New Pulumi Project

1. Log in to Pulumi (local login):
       pulumi login --local

2. Create an empty directory for your project.

3. Set your AWS profile (if not already set):
        export AWS_PROFILE=dev

4. Create a new Pulumi project:
        pulumi new

5. Select the AWS JavaScript template.

6. Provide the following details:
   - Project Name: iac-pulumi
   - Stack Name: dev
   - Default Region: us-east-1
   - Passphrase: [YourPassphrase]

## Steps to Create a Demo Stack

1. Initialize a new Pulumi stack for the demo:
        pulumi stack init demo

## Steps to Create Services in AWS Demo Profile

1. Switch your AWS profile to 'demo':
        export AWS_PROFILE=demo

2. Select the 'demo' stack in Pulumi:
        pulumi stack select demo

3. Deploy the stack to create services:
        pulumi up

4. To destroy the stack:
        pulumi destroy