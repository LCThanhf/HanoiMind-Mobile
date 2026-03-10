export interface Activity {
    time: string;
    title: string;
    description: string;
}

export interface DayItinerary {
    day: number;
    title: string;
    activities: Activity[];
}

export interface TripData {
    title: string;
    location: string;
    budget: string;
    days: string;
    status: string;
    itinerary: DayItinerary[];
}
