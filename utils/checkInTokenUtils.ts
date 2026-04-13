/**
 * Check-in token utilities for QR code generation and verification
 * Creates secure time-limited tokens for check-in authentication
 */

import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
export interface CheckInToken {
  journeyId: string;
  dayId: string;
  stopId: string;
  userId: string;
  timestamp: number;
  hash: string;
  token: string;
}

/**
 * Generates a check-in token that encodes journey, day, stop, and timestamp
 * Token format: base64(journeyId:dayId:stopId:userId:timestamp:hash)
 * @param journeyId Journey ID
 * @param dayId Day ID
 * @param stopId Stop ID
 * @param userId User ID (Host)
 * @param validitySeconds How long the token is valid (default: 5 minutes = 300 seconds)
 */
export async function generateCheckInToken(
  journeyId: string,
  dayId: string,
  stopId: string,
  userId: string,
  validitySeconds: number = 300
): Promise<CheckInToken> {
  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  // Create payload
  const payload = `${journeyId}:${dayId}:${stopId}:${userId}:${timestamp}:${validitySeconds}`;

  // Generate hash for signature verification
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    payload + 'HOIMING_CHECKIN_SECRET' // Secret for hashing
  );

  // Create final token (base64 encoded)
  const token = Buffer.from(payload + ':' + hash.substring(0, 16)).toString('base64');

  return {
    journeyId,
    dayId,
    stopId,
    userId,
    timestamp,
    hash: hash.substring(0, 16),
    token,
  };
}

/**
 * Decodes and validates a check-in token
 * @param token The token to verify
 * @returns Decoded token data if valid, null if invalid or expired
 */
export async function verifyCheckInToken(token: string): Promise<CheckInToken | null> {
  try {
    // Decode base64
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');

    if (parts.length < 7) return null;

    const [journeyId, dayId, stopId, userId, timestamp, validitySeconds, hash] = parts;
    const tokenTimestamp = parseInt(timestamp, 10);
    const validity = parseInt(validitySeconds, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (currentTimestamp - tokenTimestamp > validity) {
      console.log('[verifyCheckInToken] Token expired');
      return null;
    }

    // Verify hash
    const payload = `${journeyId}:${dayId}:${stopId}:${userId}:${timestamp}:${validitySeconds}`;
    const expectedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      payload + 'HOIMING_CHECKIN_SECRET'
    );

    if (hash !== expectedHash.substring(0, 16)) {
      console.log('[verifyCheckInToken] Hash mismatch');
      return null;
    }

    return {
      journeyId,
      dayId,
      stopId,
      userId,
      timestamp: tokenTimestamp,
      hash,
      token,
    };
  } catch (error) {
    console.error('[verifyCheckInToken] Error:', error);
    return null;
  }
}

/**
 * Gets remaining validity time of a token in seconds
 */
export function getTokenRemainingTime(tokenTimestamp: number, validitySeconds: number): number {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const remaining = validitySeconds - (currentTimestamp - tokenTimestamp);
  return Math.max(0, remaining);
}

/**
 * Formats remaining time for display (e.g., "4m 30s")
 */
export function formatRemainingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
