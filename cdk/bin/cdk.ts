#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyAppStack } from '../lib/myapp-stack';

const app = new cdk.App();
new MyAppStack(app, 'CdkStack');
