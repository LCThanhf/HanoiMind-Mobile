import React from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { TripMemberView } from './types';
import { Button, AvatarCircle } from '../shared';
import { JourneyInviteSharePayload } from '../../services/chatService/journeyInvite';

interface MembersTabProps {
    members: TripMemberView[];
    inviteCode?: string;
    journeyId?: string;
    journeyName?: string;
    onLeaveTrip: () => void;
    onSendInviteToChat?: (payload: JourneyInviteSharePayload) => void;
    isLeaving?: boolean;
}

export const MembersTab = ({
    members,
    inviteCode,
    journeyId,
    journeyName,
    onLeaveTrip,
    onSendInviteToChat,
    isLeaving = false,
}: MembersTabProps) => {
    const owner = members.find((member) => member.isOwner) || members[0];
    const otherMembers = members.filter((member) => !member.isOwner);

    const inviteLink = inviteCode
        ? `hanoimind.com/join/${inviteCode}`
        : 'Chưa có mã mời cho chuyến đi này';

    const handleShowInviteCode = () => {
        Alert.alert('Mã mời', inviteCode ? `Mã mời: ${inviteCode}` : 'Chuyến đi này chưa có mã mời.');
    };

    const handleSendInviteToChat = () => {
        const normalizedInviteCode = inviteCode?.trim();
        if (!normalizedInviteCode) {
            Alert.alert('Mã mời', 'Chuyến đi này chưa có mã mời.');
            return;
        }

        if (!onSendInviteToChat) {
            Alert.alert('Không thể mở chat', 'Vui lòng thử lại sau.');
            return;
        }

        onSendInviteToChat({
            inviteCode: normalizedInviteCode,
            journeyId,
            journeyName,
        });
    };

    return (
        <View className="px-5">
            {/* Subtitle */}
            <Text className="text-[13px] text-center mb-5" style={{ color: '#6B7280', fontWeight: '400' }}>
                Quản lý thành viên
            </Text>

            {/* Owner */}
            <Text className="text-[14px] text-gray-900 mb-3" style={{ fontWeight: '700' }}>
                Chủ chuyến đi
            </Text>
            {owner ? (
                <View
                    className="flex-row items-center px-4 py-3 rounded-2xl mb-5"
                    style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#F3F4F6' }}
                >
                    <View style={{ marginRight: 12 }}>
                        <AvatarCircle uri={owner.avatar} name={owner.name} size={46} backgroundColor="#C4856A" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[15px] text-gray-900" style={{ fontWeight: '700' }}>
                            {owner.name}
                        </Text>
                        <Text className="text-[12px]" style={{ color: '#9CA3AF', fontWeight: '400' }}>
                            {owner.role}
                        </Text>
                    </View>
                    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: '#FEF3E2' }}>
                        <Text className="text-[12px]" style={{ color: '#D4A574', fontWeight: '600' }}>
                            Chủ chuyến đi
                        </Text>
                    </View>
                </View>
            ) : null}

            {/* Members List */}
            <Text className="text-[14px] text-gray-900 mb-3" style={{ fontWeight: '700' }}>
                Thành viên
            </Text>
            <View
                className="rounded-2xl mb-5 overflow-hidden"
                style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#F3F4F6' }}
            >
                {otherMembers.map((member, index) => (
                    <View
                        key={member.id}
                        className="flex-row items-center px-4 py-3"
                        style={{
                            borderBottomWidth: index < otherMembers.length - 1 ? 1 : 0,
                            borderBottomColor: '#F3F4F6',
                        }}
                    >
                        <View style={{ marginRight: 12 }}>
                            <AvatarCircle uri={member.avatar} name={member.name} size={46} backgroundColor="#7B6FB5" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[15px] text-gray-900" style={{ fontWeight: '600' }}>
                                {member.name}
                            </Text>
                            <Text className="text-[12px]" style={{ color: '#9CA3AF', fontWeight: '400' }}>
                                {member.role}
                            </Text>
                        </View>
                    </View>
                ))}
                {otherMembers.length === 0 && (
                    <View className="px-4 py-4">
                        <Text style={{ fontSize: 13, color: '#6B7280' }}>Chưa có thành viên nào khác.</Text>
                    </View>
                )}
            </View>

            {/* Invite Friends */}
            <View
                className="px-4 py-4 rounded-2xl mb-5"
                style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#F3F4F6' }}
            >
                <Text className="text-[14px] text-gray-900 mb-1" style={{ fontWeight: '700' }}>
                    Mời bạn bè
                </Text>
                <Text className="text-[12px] mb-3" style={{ color: '#9CA3AF', fontWeight: '400' }}>
                    Gửi lời mời trong chat để bạn bè có thể tham gia ngay trong ứng dụng
                </Text>
                {/* Link Box */}
                <View
                    className="flex-row items-center px-3 rounded-xl mb-3"
                    style={{
                        backgroundColor: '#F8FAFC',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        height: 44,
                    }}
                >
                    <Text className="flex-1 text-[13px] text-gray-700" style={{ fontWeight: '400' }}>
                        {inviteLink}
                    </Text>
                    <Button
                        activeOpacity={0.7}
                        onPress={handleSendInviteToChat}
                    >
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                stroke="#2B8EF0"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </Svg>
                    </Button>
                </View>
                {/* Action Buttons */}
                <View className="flex-row" style={{ gap: 10 }}>
                    <Button
                        className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                        style={{ borderWidth: 1.5, borderColor: '#2B8EF0', backgroundColor: '#EBF5FF' }}
                        activeOpacity={0.7}
                        onPress={handleSendInviteToChat}
                    >
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                            <Path
                                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                stroke="#2B8EF0"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </Svg>
                        <Text style={{ color: '#2B8EF0', fontWeight: '600', fontSize: 14 }}>Gửi tới chat</Text>
                    </Button>
                    <Button
                        className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
                        style={{ borderWidth: 1.5, borderColor: '#2B8EF0', backgroundColor: '#EBF5FF' }}
                        activeOpacity={0.7}
                        onPress={handleShowInviteCode}
                    >
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                            <Rect x="9" y="9" width="13" height="13" rx="2" stroke="#2B8EF0" strokeWidth="1.5" />
                            <Path
                                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                                stroke="#2B8EF0"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </Svg>
                        <Text style={{ color: '#2B8EF0', fontWeight: '600', fontSize: 14 }}>Xem mã</Text>
                    </Button>
                </View>
            </View>

            {/* Last Updated */}
            <Text className="text-[12px] text-center mb-5" style={{ color: '#9CA3AF', fontWeight: '400' }}>
                Cập nhật lần cuối bởi{' '}
                <Text style={{ color: '#374151', fontWeight: '600' }}>{owner?.name || 'Trip owner'}</Text>
            </Text>

            {/* Leave Trip */}
            <Button
                className="items-center justify-center py-4 rounded-2xl mb-4"
                style={{ backgroundColor: '#FEE2E2' }}
                activeOpacity={0.8}
                onPress={() =>
                    Alert.alert('Rời chuyến đi', 'Bạn có chắc chắn muốn rời khỏi chuyến đi này?', [
                        { text: 'Huỷ', style: 'cancel' },
                        { text: 'Rời đi', style: 'destructive', onPress: onLeaveTrip },
                    ])
                }
                disabled={isLeaving}
            >
                {isLeaving ? (
                    <ActivityIndicator color="#EF4444" />
                ) : (
                    <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 16 }}>Rời chuyến</Text>
                )}
            </Button>
        </View>
    );
};

