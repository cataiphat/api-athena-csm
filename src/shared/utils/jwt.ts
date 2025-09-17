import jwt from 'jsonwebtoken';
import { config } from '@/config/config';
import { JWTPayload } from '@/shared/types';

export class JWTService {
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return (jwt as any).sign(
      payload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return (jwt as any).sign(
      payload,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
  }

  static generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(config.jwt.expiresIn),
    };
  }

  private static getTokenExpirationTime(expiresIn: string): number {
    // Convert string like '24h', '7d' to seconds
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 24 * 60 * 60; // Default to 24 hours
    }
  }
}
