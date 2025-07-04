import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/config/database';
import { config } from '@/config';
import { GoogleUserPayload } from '@/config/google-auth';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  preferredLanguage: string;
  theme: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: string;
}

class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client({
      clientId: config.google.clientId,
      clientSecret: config.google.clientSecret,
      redirectUri: config.google.redirectUri,
    });
  }

  /**
   * Verify Google ID token and get user payload
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleUserPayload> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        sub: payload.sub,
        id: payload.sub, // Alias for controller
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified || false,
        given_name: payload.given_name,
        family_name: payload.family_name,
        locale: payload.locale,
      };
    } catch (error) {
      console.error('❌ Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Create or update user in database
   */
  async createOrUpdateUser(googleUser: GoogleUserPayload): Promise<AuthUser> {
    try {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { googleId: googleUser.sub },
      });

      if (user) {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            preferredLanguage: googleUser.locale?.startsWith('ar') ? 'ar' : 'en',
            theme: 'dark',
            emailNotifications: true,
            isPaperTrading: true,
          },
        });

        // Create default portfolio for new user
        await this.createDefaultPortfolio(user.id);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture || undefined,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
      };
    } catch (error) {
      console.error('❌ Database error creating/updating user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  /**
   * Generate JWT tokens for user
   */
  generateTokens(user: AuthUser): AuthTokens {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    return {
      accessToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture || undefined,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
      };
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: {
      preferredLanguage?: string;
      theme?: string;
      emailNotifications?: boolean;
    }
  ): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...preferences,
          updatedAt: new Date(),
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture || undefined,
        preferredLanguage: user.preferredLanguage,
        theme: user.theme,
      };
    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
      return null;
    }
  }

  /**
   * Create default portfolio for new user
   */
  private async createDefaultPortfolio(userId: string): Promise<void> {
    try {
      await prisma.portfolio.create({
        data: {
          userId,
          name: 'My First Portfolio',
          description: 'Default portfolio for getting started',
          portfolioType: 'paper',
          initialCapital: 100000, // 100K EGP starting capital
          currentValue: 100000,
          cashBalance: 100000,
          isDefault: true,
        },
      });
    } catch (error) {
      console.error('❌ Error creating default portfolio:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Delete user account and all associated data
   */
  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      // Delete user (cascade will handle related data)
      await prisma.user.delete({
        where: { id: userId },
      });

      return true;
    } catch (error) {
      console.error('❌ Error deleting user account:', error);
      return false;
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<any | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(userId: string): Promise<any | null> {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      console.error('❌ Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    email: string;
    name: string;
    avatar?: string;
    provider: string;
    providerId: string;
  }): Promise<any> {
    try {
      const user = await prisma.user.create({
        data: {
          googleId: userData.providerId,
          email: userData.email,
          name: userData.name,
          picture: userData.avatar,
          preferredLanguage: 'ar',
          theme: 'dark',
          emailNotifications: true,
          isPaperTrading: true,
        },
      });

      // Create default portfolio for new user
      await this.createDefaultPortfolio(user.id);

      return user;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ Error updating last login:', error);
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updateData: {
    name?: string;
    avatar?: string;
  }): Promise<any | null> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          picture: updateData.avatar,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return null;
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
