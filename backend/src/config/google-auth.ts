import { OAuth2Client } from 'google-auth-library';
import { config } from './index';

export const googleClient = new OAuth2Client({
  clientId: config.google.clientId,
  clientSecret: config.google.clientSecret,
  redirectUri: config.google.redirectUri,
});

export interface GoogleUserPayload {
  sub: string; // Google ID
  id: string; // Alias for sub
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  locale?: string;
}
