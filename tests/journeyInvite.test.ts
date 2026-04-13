import { describe, expect, it } from 'vitest';
import {
  buildJourneyInviteMessage,
  getJourneyInviteMetadataFromMessage,
  JOURNEY_INVITE_KIND,
  parseJourneyInviteMetadata,
} from '../services/chatService/journeyInvite';

describe('journeyInvite helpers', () => {
  it('builds invite chat message with normalized metadata', () => {
    const result = buildJourneyInviteMessage({
      inviteCode: '  ABC123  ',
      journeyId: '  journey-01  ',
      journeyName: '  Da Nang Trip  ',
    });

    expect(result.content).toContain('ABC123');
    expect(result.metadata).toEqual({
      kind: JOURNEY_INVITE_KIND,
      invite_code: 'ABC123',
      journey_id: 'journey-01',
      journey_name: 'Da Nang Trip',
    });
  });

  it('builds fallback message when journey name is missing', () => {
    const result = buildJourneyInviteMessage({
      inviteCode: 'INV001',
      journeyId: 'journey-02',
    });

    expect(result.content).toContain('INV001');
    expect(result.metadata).toEqual({
      kind: JOURNEY_INVITE_KIND,
      invite_code: 'INV001',
      journey_id: 'journey-02',
      journey_name: undefined,
    });
  });

  it('normalizes blank optional fields to undefined', () => {
    const result = buildJourneyInviteMessage({
      inviteCode: 'TEST99',
      journeyId: '   ',
      journeyName: '   ',
    });

    expect(result.content).toContain('TEST99');
    expect(result.metadata).toEqual({
      kind: JOURNEY_INVITE_KIND,
      invite_code: 'TEST99',
      journey_id: undefined,
      journey_name: undefined,
    });
  });

  it('throws when invite code is empty', () => {
    expect(() => buildJourneyInviteMessage({ inviteCode: '   ' })).toThrow('inviteCode is required');
  });

  it('parses metadata from object or JSON string', () => {
    const objectResult = parseJourneyInviteMetadata({
      kind: JOURNEY_INVITE_KIND,
      invite_code: 'ZXCV12',
      journey_id: 'j-9',
      journey_name: 'Ha Noi',
    });

    const jsonResult = parseJourneyInviteMetadata(
      JSON.stringify({
        kind: JOURNEY_INVITE_KIND,
        inviteCode: 'QWER98',
        journeyId: 'j-10',
        journeyName: 'Sai Gon',
      })
    );

    expect(objectResult?.invite_code).toBe('ZXCV12');
    expect(jsonResult).toEqual({
      kind: JOURNEY_INVITE_KIND,
      invite_code: 'QWER98',
      journey_id: 'j-10',
      journey_name: 'Sai Gon',
    });
  });

  it('parses and trims camelCase metadata fields', () => {
    const result = parseJourneyInviteMetadata({
      kind: JOURNEY_INVITE_KIND,
      inviteCode: '  MYCODE  ',
      journeyId: '  trip-1  ',
      journeyName: '  Ha Giang Loop  ',
    });

    expect(result).toEqual({
      kind: JOURNEY_INVITE_KIND,
      invite_code: 'MYCODE',
      journey_id: 'trip-1',
      journey_name: 'Ha Giang Loop',
    });
  });

  it('returns null for invalid kinds and malformed metadata', () => {
    const wrongKind = parseJourneyInviteMetadata({
      kind: 'POLL',
      invite_code: 'NOT_VALID',
    });
    const malformedJson = parseJourneyInviteMetadata('{"kind":"JOURNEY_INVITE"');
    const missingInviteCode = parseJourneyInviteMetadata({
      kind: JOURNEY_INVITE_KIND,
      journey_id: 'trip-x',
    });

    expect(wrongKind).toBeNull();
    expect(malformedJson).toBeNull();
    expect(missingInviteCode).toBeNull();
  });

  it('extracts invite metadata from chat message shape', () => {
    const metadata = getJourneyInviteMetadataFromMessage({
      metadata: {
        kind: JOURNEY_INVITE_KIND,
        invite_code: 'JOINME',
      },
    });

    const invalidMetadata = getJourneyInviteMetadataFromMessage({
      metadata: { kind: 'POLL', invite_code: 'NOPE' },
    });

    expect(metadata?.invite_code).toBe('JOINME');
    expect(invalidMetadata).toBeNull();
  });

  it('returns null when message metadata is missing', () => {
    const metadata = getJourneyInviteMetadataFromMessage({});

    expect(metadata).toBeNull();
  });
});
