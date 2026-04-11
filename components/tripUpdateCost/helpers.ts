import { CostType, JourneyMemberRole } from '../../services/journeyService/journey.type';

export const formatCost = (value: number): string =>
  `${value.toLocaleString('vi-VN')} đ`;

export const costTypeLabel = (type: CostType): string => {
  switch (type) {
    case CostType.SHARED:
      return 'Chia đều (Shared)';
    case CostType.PER_PERSON:
      return 'Mỗi người (Per person)';
    case CostType.CUSTOM:
      return 'Tùy chỉnh (Custom)';
    default:
      return type;
  }
};

export const roleLabel = (role?: JourneyMemberRole): string => {
  if (role === JourneyMemberRole.HOST) return 'Trưởng nhóm';
  if (role === JourneyMemberRole.VIEWER) return 'Người xem';
  return 'Thành viên';
};
