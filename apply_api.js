const fs = require('fs');
let content = fs.readFileSync('components/HomeScreen.tsx', 'utf8');

content = content.replace(/const myTrips = \[[\s\S]*?\];/, // API Imports
import { UsersService } from '../services/userService/user.service';
import { PlacesService } from '../services/placeService/place.service';
import { JourneyService } from '../services/journeyService/journey.service';
import { PlaceCategory } from '../services/placeService/place.type';
);

content = content.replace(/const places = \[[\s\S]*?\];/, `);

content = content.replace(/const dropdownTranslateY = useRef\(new Animated\.Value\(-8\)\)\.current;/g, const dropdownTranslateY = useRef(new Animated.Value(-8)).current;

    const [user, setUser] = useState<any>(null);
    const [myTrips, setMyTrips] = useState<any[]>([]);
    const [places, setPlaces] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [usrRes, journeyRes, placesRes] = await Promise.allSettled([
                    UsersService.getMe(),
                    JourneyService.findMy(),
                    PlacesService.findAll({ limit: 10 })
                ]);
                
                if (usrRes.status === 'fulfilled') setUser(usrRes.value);
                
                if (journeyRes.status === 'fulfilled') {
                    const mapped = journeyRes.value.map((j: any) => {
                        const start = new Date(j.start_date);
                        const end = new Date(j.end_date);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                        return {
                            id: j._id,
                            title: j.name,
                            location: 'Địa điểm',
                            status: j.status,
                            days: diffDays + ' ngày',
                            tag: j.tags?.[0] || 'Explore',
                            type: j.members?.length > 1 ? 'Group' : 'Solo',
                            image: j.avatar || 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80',
                        };
                    });
                    setMyTrips(mapped);
                }
                
                if (placesRes.status === 'fulfilled') {
                    const mappedP = placesRes.value.data.map((p: any) => ({
                        id: p._id,
                        name: p.name,
                        category: p.category, 
                        rating: p.rating || 0,
                        distance: p.distance ? p.distance + ' km' : '1 km',
                        reviews: p.reviewCount ? p.reviewCount.toString() : '0',
                        image: p.images?.[0] || 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80'
                    }));
                    setPlaces(mappedP);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchPlacesFilter = async () => {
            let catParam: PlaceCategory | undefined = undefined;
            if (activeFilter === 'Nhà hàng') catParam = PlaceCategory.RESTAURANT;
            else if (activeFilter === 'Khách sạn') catParam = PlaceCategory.HOTEL;
            else if (activeFilter === 'Thắng cảnh') catParam = PlaceCategory.SIGHTSEEING;
            else if (activeFilter === 'Bar') catParam = PlaceCategory.BAR_PUB;
            
            try {
                const res = await PlacesService.findAll({ limit: 10, category: catParam });
                const mappedP = res.data.map((p: any) => ({
                    id: p._id,
                    name: p.name,
                    category: p.category, 
                    rating: p.rating || 0,
                    distance: p.distance ? p.distance + ' km' : '1 km',
                    reviews: p.reviewCount ? p.reviewCount.toString() : '0',
                    image: p.images?.[0] || 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=400&q=80'
                }));
                setPlaces(mappedP);
            } catch (e) {
                console.log(e);
            }
        };
        if(activeFilter !== 'All' || places.length > 0) {
           fetchPlacesFilter();
        }
    }, [activeFilter]);
);

content = content.replace(/Chào mừng, username!/g, "Chào mừng, {user?.fullName || 'Khách'}!");
content = content.replace(/{ uri: 'https:\/\/images.unsplash.com\/photo-1494790108377-be9c29b29330\?auto=format&fit=crop&w=300&q=80' }/g, "{ uri: user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }");

content = content.replace(/places\.filter\(p => activeFilter === 'All' \|\| p\.category === activeFilter\)\.map/, 'places.map');

if (!content.includes('useEffect')) {
    content = content.replace(/import React, { useState, useRef } from 'react';/, "import React, { useState, useRef, useEffect } from 'react';");
}

fs.writeFileSync('components/HomeScreen.tsx', content);
console.log('Update Complete.');
