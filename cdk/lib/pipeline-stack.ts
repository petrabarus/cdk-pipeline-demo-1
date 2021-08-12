import * as cdk from '@aws-cdk/core';
import * as cp from '@aws-cdk/aws-codepipeline';
import * as cpa from '@aws-cdk/aws-codepipeline-actions';
import * as pipelines from '@aws-cdk/pipelines';
import { MyAppStack } from './myapp-stack';

class MyAppStage extends cdk.Stage {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        const service = new MyAppStack(this, 'MyApp', {
          tags: {
            Application: 'MyApp',
            Environment: id
          }
        });

    }
}

export class PipelineStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        
        
        const sourceArtifact = new cp.Artifact();
        const cloudAssemblyArtifact = new cp.Artifact();
        
        const sourceAction = new cpa.GitHubSourceAction({
            actionName: 'GitHub',
            output: sourceArtifact,
            oauthToken: cdk.SecretValue.secretsManager('GitHubAccess'),
            owner: 'petrabarus',
            repo: 'cdk-pipeline-demo-1',
            branch: 'main', 
        });
        
        
        const synthAction = pipelines.SimpleSynthAction.standardNpmSynth({
            sourceArtifact,
            cloudAssemblyArtifact,
            subdirectory: 'cdk',
            buildCommand: 'npm run build && npm test',
        });
        
        
        const pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
            cloudAssemblyArtifact,
            sourceAction,
            synthAction
        });
        
        const preProdApp = new MyAppStage(this, 'Pre-Prod');
        const preProdStage = pipeline.addApplicationStage(preProdApp);
        
        
        preProdStage.addActions(new pipelines.ShellScriptAction({
            actionName: 'UnitTest',
            runOrder: preProdStage.nextSequentialRunOrder(),
            additionalArtifacts: [
                sourceArtifact
            ],
            commands: [
                'cd lambda',
                'npm install',
                'npm run build',
                'npm run test'
            ],
        }));

        
        const prodApp = new MyAppStage(this, 'Prod');
        const prodStage = pipeline.addApplicationStage(prodApp);
    }
}