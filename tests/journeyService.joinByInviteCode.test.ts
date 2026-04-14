import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  aiApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../services/apiClient';
import { JourneyService } from '../services/journeyService/journey.service';

describe('JourneyService.joinByInviteCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends join request with invite code', async () => {
    const joinedJourney = { _id: 'journey-1', title: 'Da Lat' };
    vi.mocked(apiClient.post).mockResolvedValue(joinedJourney as any);

    const result = await JourneyService.joinByInviteCode('ABC123');

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith('/journeys/join', {
      invite_code: 'ABC123',
    });
    expect(result).toEqual(joinedJourney);
  });

  it('trims invite code before join request', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ _id: 'journey-2' } as any);

    await JourneyService.joinByInviteCode('  JOINME  ');

    expect(apiClient.post).toHaveBeenCalledWith('/journeys/join', {
      invite_code: 'JOINME',
    });
  });

  it('rejects when invite code is blank', async () => {
    await expect(JourneyService.joinByInviteCode('   ')).rejects.toThrow('invite_code is required');
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('rejects when invite code is not a string', async () => {
    await expect(JourneyService.joinByInviteCode(123 as any)).rejects.toThrow('invite_code is required');
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('propagates API errors for invalid or expired invite code', async () => {
    const apiError = {
      response: {
        data: {
          message: 'Invite code is invalid or expired',
        },
      },
    };
    vi.mocked(apiClient.post).mockRejectedValue(apiError);

    await expect(JourneyService.joinByInviteCode('BADCODE')).rejects.toEqual(apiError);
    expect(apiClient.post).toHaveBeenCalledWith('/journeys/join', {
      invite_code: 'BADCODE',
    });
  });
});
