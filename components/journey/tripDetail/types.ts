export interface Activity {
    id: string;
    time: string;
    title: string;
    description: string;
    status?: string;
    stopId?: string;
    placeId?: string;
    dayNumber?: number;
    endTime?: string;
    estimatedCost?: number;
    image?: string;
    address?: string;
    rating?: number;
}

export interface DayItinerary {
    day: number;
    dayId?: string;
    title: string;
    date?: string;
    activities: Activity[];
}

export interface TripMemberView {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    joinedAt?: string;
    isOwner?: boolean;
}

export interface MoodVoteOption {
    id: string;
    title: string;
    desc: string;
    votes: number;
}

export interface MoodVoteEntry {
    user_id: string;
    user_name: string;
    user_avatar?: string;
    mood: string;
    mood_title: string;
    voted_at: string;
}

export interface TripData {
    title: string;
    location: string;
    budget: string;
    days: string;
    status: string;
    itinerary: DayItinerary[];
    members: TripMemberView[];
    inviteCode?: string;
    moodVotes: MoodVoteOption[];
    moodVoteEntries?: MoodVoteEntry[];
}
