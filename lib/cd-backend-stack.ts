import * as cdk from '@aws-cdk/core'
import * as appsync from '@aws-cdk/aws-appsync'
import * as lambda from '@aws-cdk/aws-lambda'
import * as rds from '@aws-cdk/aws-rds'
import * as ec2 from '@aws-cdk/aws-ec2'

export class CdkBackendStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)
        
        const api = new appsync.GraphqlApi(this, 'Api', {
            name: 'appsync-art-backend',
            schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: cdk.Expiration.after(cdk.Duration.days(365))
                    }
                }
            }
        })
        
        const vpc = new ec2.Vpc(this, 'myVPC')
        
        const cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
          engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
          parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
          defaultDatabaseName: 'myDB',
          vpc,
          scaling: { autoPause: cdk.Duration.seconds(0)}
        })
        
        const blobFn = new lambda.Function(this, 'myFunction', {
          runtime: lambda.Runtime.NODEJS_10_X,
          code: new lambda.AssetCode('lambda-fns'),
          handler: 'index.handler',
          memorySize: 1024,
          environment: {
            CLUSTER_ARN: cluster.clusterArn,
            SECRET_ARN: cluster.secret?.secretArn || '',
            DB_NAME: 'myDB',
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
          }
        })
        
        cluster.grantDataApiAccess(blobFn);
        
        const lambdaDSource = api.addLambdaDataSource('lambdaDataSource', blobFn)
        
        lambdaDSource.createResolver({
          typeName: 'Query',
          fieldName: 'artList'
        })
        
        lambdaDSource.createResolver({
          typeName: 'Mutation',
          fieldName: 'createArt'
        })
        
        new cdk.CfnOutput(this, 'AppSyncAPIURL', {
          value: api.graphqlUrl
        })
        
        new cdk.CfnOutput(this, 'AppSyncAPIKey', {
          value: api.apiKey || ''
        })
        
        new cdk.CfnOutput(this, 'ProjectRegion', {
          value: this.region
        })
        
    }
}