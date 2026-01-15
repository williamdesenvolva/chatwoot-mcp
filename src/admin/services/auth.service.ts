import { userRepository } from '../database/repositories/user.repository.js';
import { sessionRepository } from '../database/repositories/session.repository.js';
import { auditRepository } from '../database/repositories/audit.repository.js';
import type { LoginRequest, LoginResponse, UserPublic, Session } from '../types/index.js';

export class AuthService {
  async login(
    data: LoginRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponse> {
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      await this.logFailedLogin(data.email, ipAddress, 'User not found');
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      await this.logFailedLogin(data.email, ipAddress, 'User inactive');
      throw new Error('Account is disabled');
    }

    const isValidPassword = await userRepository.verifyPassword(user, data.password);
    if (!isValidPassword) {
      await this.logFailedLogin(data.email, ipAddress, 'Invalid password');
      throw new Error('Invalid email or password');
    }

    // Create session
    const session = await sessionRepository.create(user.id, ipAddress, userAgent);

    // Log successful login
    await auditRepository.create({
      user_id: user.id,
      action: 'auth.login',
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: { email: user.email },
    });

    return {
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
      expires_at: session.expires_at.toISOString(),
    };
  }

  async logout(sessionToken: string): Promise<boolean> {
    const session = await sessionRepository.findByToken(sessionToken);

    if (session) {
      await auditRepository.create({
        user_id: session.user_id,
        action: 'auth.logout',
      });
    }

    return sessionRepository.delete(sessionToken);
  }

  async validateSession(sessionToken: string): Promise<{ session: Session; user: UserPublic } | null> {
    const session = await sessionRepository.findByToken(sessionToken);

    if (!session) {
      return null;
    }

    const user = await userRepository.findById(session.user_id);

    if (!user || !user.is_active) {
      // Invalidate session if user no longer valid
      await sessionRepository.delete(sessionToken);
      return null;
    }

    return {
      session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    };
  }

  async extendSession(sessionToken: string): Promise<Session | null> {
    return sessionRepository.extend(sessionToken);
  }

  async logoutAllSessions(userId: string): Promise<number> {
    await auditRepository.create({
      user_id: userId,
      action: 'auth.logout_all',
    });

    return sessionRepository.deleteByUserId(userId);
  }

  private async logFailedLogin(
    email: string,
    ipAddress?: string,
    reason?: string
  ): Promise<void> {
    await auditRepository.create({
      action: 'auth.login_failed',
      ip_address: ipAddress,
      metadata: { email, reason },
    });
  }

  async cleanupExpiredSessions(): Promise<number> {
    return sessionRepository.deleteExpired();
  }
}

export const authService = new AuthService();
