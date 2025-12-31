import { Client, Environment } from '@paypal/paypal-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

const environment = process.env.NODE_ENV === 'production'
  ? Environment.Live
  : Environment.Sandbox;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: clientId,
    oAuthClientSecret: clientSecret,
  },
  environment: environment,
});

export default client;