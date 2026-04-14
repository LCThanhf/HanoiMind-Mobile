export const JOURNEY_INVITE_KIND = 'JOURNEY_INVITE' as const;

export interface JourneyInviteSharePayload {
  inviteCode: string;
  journeyId?: string;
  journeyName?: string;
}

export interface JourneyInviteMetadata {
  kind: typeof JOURNEY_INVITE_KIND;
  invite_code: string;
  journey_id?: string;
  journey_name?: string;
}

interface JourneyInviteMessageShape {
  metadata?: unknown;
}

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const parseMetadataObject = (metadata: unknown): Record<string, unknown> | null => {
  if (metadata && typeof metadata === 'object') return metadata as Record<string, unknown>;
  if (typeof metadata !== 'string') return null;

  try {
    const parsed = JSON.parse(metadata);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
};

export const buildJourneyInviteMessage = (
  payload: JourneyInviteSharePayload
): { content: string; metadata: JourneyInviteMetadata } => {
  const inviteCode = payload.inviteCode.trim();
  if (!inviteCode) {
    throw new Error('inviteCode is required');
  }

  const journeyName = payload.journeyName?.trim();
  const content = journeyName
    ? `Tham gia chuyến đi này "${journeyName}" với mã: ${inviteCode}`
    : `Tham gia chuyến đi của tôi với mã: ${inviteCode}`;

  return {
    content,
    metadata: {
      kind: JOURNEY_INVITE_KIND,
      invite_code: inviteCode,
      journey_id: normalizeOptionalString(payload.journeyId),
      journey_name: normalizeOptionalString(journeyName),
    },
  };
};

export const parseJourneyInviteMetadata = (metadata: unknown): JourneyInviteMetadata | null => {
  const parsedObject = parseMetadataObject(metadata);
  if (!parsedObject) return null;

  const kind = normalizeOptionalString(parsedObject.kind);
  if (kind && kind !== JOURNEY_INVITE_KIND) return null;

  const inviteCode = normalizeOptionalString(parsedObject.invite_code ?? parsedObject.inviteCode);
  if (!inviteCode) return null;

  const journeyId = normalizeOptionalString(parsedObject.journey_id ?? parsedObject.journeyId);
  const journeyName = normalizeOptionalString(parsedObject.journey_name ?? parsedObject.journeyName);

  return {
    kind: JOURNEY_INVITE_KIND,
    invite_code: inviteCode,
    journey_id: journeyId,
    journey_name: journeyName,
  };
};

export const getJourneyInviteMetadataFromMessage = (
  message: JourneyInviteMessageShape
): JourneyInviteMetadata | null => parseJourneyInviteMetadata(message?.metadata);
