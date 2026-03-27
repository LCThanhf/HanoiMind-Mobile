import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { NotificationService } from '../services/notificationService/notification.service';
import { Notification as ApiNotification, NotificationType } from '../services/notificationService/notification.type';
import { MainTab } from './BottomTabBar';

type NotificationKind = 'avatar' | 'chat' | 'trip';

interface NotificationItem {
    id: string;
    actor?: string;
    message: string;
    timeAgo: string;
    unread?: boolean;
    kind: NotificationKind;
    avatar?: string;
}

function formatTimeAgo(createdAt: string): string {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.floor(diffHours / 24)} ngày trước`;
}

function kindFromType(type: NotificationType, hasSenderAvatar: boolean): NotificationKind {
    if (type === NotificationType.NEW_MESSAGE) return 'chat';
    if (type === NotificationType.JOURNEY_UPDATE) return 'trip';
    if (type === NotificationType.PAYMENT) return 'trip';
    return hasSenderAvatar ? 'avatar' : 'trip';
}

function mapApiToItem(notif: ApiNotification): NotificationItem {
    return {
        id: notif._id,
        message: notif.message || notif.title,
        timeAgo: formatTimeAgo(notif.created_at),
        unread: !notif.is_read,
        kind: kindFromType(notif.type, !!notif.sender_avatar),
        avatar: notif.sender_avatar,
    };
}

const NotificationLeading = ({ item }: { item: NotificationItem }) => {
    if (item.kind === 'avatar' && item.avatar) {
        return (
            <Image
                source={{ uri: item.avatar }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
            />
        );
    }

    if (item.kind === 'chat') {
        return (
            <View
                style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#BFDBFE',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                    <Path
                        d="M21 12a8.5 8.5 0 0 1-12.74 7.41L3 21l1.59-5.26A8.5 8.5 0 1 1 21 12Z"
                        stroke="#2B8EF0"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <Circle cx="9" cy="12" r="1" fill="#2B8EF0" />
                    <Circle cx="12" cy="12" r="1" fill="#2B8EF0" />
                    <Circle cx="15" cy="12" r="1" fill="#2B8EF0" />
                </Svg>
            </View>
        );
    }

    return (
        <View
            style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: '#FDE7B0',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="4" width="18" height="17" rx="3" stroke="#111827" strokeWidth="2" />
                <Path d="M8 2v4M16 2v4M3 10h18" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
            </Svg>
        </View>
    );
};

interface NotificationScreenProps {
    activeTab: MainTab;
    onBack: () => void;
    onTabChange: (tab: MainTab) => void;
}

export const NotificationScreen = ({ activeTab, onBack, onTabChange }: NotificationScreenProps) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const socketConnected = useRef(false);

    useEffect(() => {
        let mounted = true;

        const fetchNotifications = async () => {
            try {
                const data = await NotificationService.getMyNotifications();
                if (mounted) {
                    const list = Array.isArray(data) ? data : [];
                    setNotifications(list.map(mapApiToItem));
                }
            } catch (err: any) {
                console.error('[Notifications] Fetch error:', err?.response?.status, err?.message);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const connectRealtime = async () => {
            if (socketConnected.current) return;
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                socketConnected.current = true;
                NotificationService.connectSocket(token, (notif: ApiNotification) => {
                    if (mounted) {
                        setNotifications((prev) => [mapApiToItem(notif), ...prev]);
                    }
                });
            }
        };

        fetchNotifications();
        connectRealtime();

        return () => {
            mounted = false;
            socketConnected.current = false;
            NotificationService.disconnectSocket();
        };
    }, []);

    const handleTap = useCallback(async (item: NotificationItem) => {
        if (!item.unread) return;
        try {
            await NotificationService.markAsRead(item.id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
            );
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, []);

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-[#F5F6FA]">
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB',
                    backgroundColor: '#F5F6FA',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    activeOpacity={0.8}
                    style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}
                >
                    <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
                        <Path d="M15 18l-6-6 6-6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>

                <Text style={{ fontSize: 24, fontWeight: '700', color: '#F472B6' }}>Thông báo</Text>
                <View style={{ width: 32 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#2B8EF0" />
                </View>
            ) : notifications.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 140 }}>
                    <Text style={{ fontSize: 15, color: '#9CA3AF' }}>Không có thông báo nào</Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingTop: 12, paddingBottom: 92 }}
                >
                    {notifications.map((item) => (
                        <View key={item.id} style={{ marginBottom: 14, paddingLeft: 0 }}>
                            {item.unread && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 37,
                                        width: 17,
                                        height: 17,
                                        borderRadius: 8.5,
                                        backgroundColor: 'white',
                                        borderWidth: 2,
                                        borderColor: '#2B8EF0',
                                        zIndex: 2,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: '#2B8EF0',
                                            alignSelf: 'center',
                                            marginTop: 2.5,
                                        }}
                                    />
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={() => handleTap(item)}
                                activeOpacity={0.85}
                                style={{
                                    marginLeft: 2,
                                    marginRight: 2,
                                    borderRadius: 18,
                                    backgroundColor: '#F3F4F6',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    paddingHorizontal: 16,
                                    paddingVertical: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    shadowOffset: { width: 0, height: 3 },
                                    elevation: 2,
                                }}
                            >
                                <NotificationLeading item={item} />

                                <View style={{ flex: 1, marginLeft: 14, marginRight: 8 }}>
                                    <Text style={{ fontSize: 15, color: '#1F2937', fontWeight: '400' }} numberOfLines={1}>
                                        {item.actor ? (
                                            <>
                                                <Text style={{ fontWeight: '700' }}>{item.actor}</Text>
                                                <Text> {item.message}</Text>
                                            </>
                                        ) : (
                                            item.message
                                        )}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>{item.timeAgo}</Text>
                                </View>

                                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                    <Path d="M9 6l6 6-6 6" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};
