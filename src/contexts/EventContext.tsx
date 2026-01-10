import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Event {
    id: string;
    creatorId: string;
    creatorName: string;
    sport: string;
    date: string;
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    location: string;
    coordinates?: { lat: number; lng: number };
    requiredPlayers: number;
    joinedPlayers: string[]; // User IDs
    pendingRequests: string[]; // User IDs asking to join
    description: string;
    status: "Open" | "Full" | "Completed";
    skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

interface EventContextType {
    events: Event[];
    createEvent: (eventData: Omit<Event, "id" | "creatorId" | "creatorName" | "joinedPlayers" | "pendingRequests" | "status">) => void;
    joinEvent: (eventId: string) => void; // Keeps name but logic changes to request
    cancelRequest: (eventId: string) => void;
    acceptRequest: (eventId: string, userId: string) => void;
    rejectRequest: (eventId: string, userId: string) => void;
    leaveEvent: (eventId: string) => void;
    getMyEvents: () => { hosted: Event[], joined: Event[] };
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        // Load events from localStorage
        const storedEvents = localStorage.getItem("playpal_events");
        if (storedEvents) {
            try {
                const parsedEvents = JSON.parse(storedEvents);
                // Sanitize/Migrate data
                const sanitizedEvents = parsedEvents.map((evt: any) => ({
                    ...evt,
                    pendingRequests: evt.pendingRequests || [],
                    skillLevel: evt.skillLevel || "Intermediate",
                    startTime: evt.startTime || "00:00",
                    endTime: evt.endTime || "00:00",
                    coordinates: evt.coordinates || undefined
                }));
                setEvents(sanitizedEvents);
            } catch (e) {
                localStorage.removeItem("playpal_events");
            }
        } else {
            // Mock initial events
            setEvents([
                {
                    id: "evt_1",
                    creatorId: "user_mock_1",
                    creatorName: "Rahul Sharma",
                    sport: "Cricket",
                    date: new Date().toISOString().split('T')[0],
                    startTime: "18:00",
                    endTime: "20:00",
                    location: "Elite Cricket Arena",
                    requiredPlayers: 3,
                    joinedPlayers: ["user_mock_2"],
                    pendingRequests: [],
                    description: "Need a few players for a casual match.",
                    status: "Open" as const,
                    skillLevel: "Intermediate"
                },
                {
                    id: "evt_2",
                    creatorId: "user_mock_3",
                    creatorName: "Priya Patel",
                    sport: "Badminton",
                    date: new Date().toISOString().split('T')[0],
                    startTime: "07:00",
                    endTime: "08:00",
                    location: "Shuttle Masters",
                    requiredPlayers: 1,
                    joinedPlayers: [],
                    pendingRequests: ["user_mock_4"], // Mock pending request
                    description: "Looking for a doubles partner.",
                    status: "Open" as const,
                    skillLevel: "Advanced"
                } as Event
            ] as Event[]);
        }
    }, []);

    const saveEvents = (newEvents: Event[]) => {
        setEvents(newEvents);
        localStorage.setItem("playpal_events", JSON.stringify(newEvents));
    };

    const createEvent = (eventData: Omit<Event, "id" | "creatorId" | "creatorName" | "joinedPlayers" | "pendingRequests" | "status">) => {
        if (!user) return;

        const newEvent: Event = {
            ...eventData,
            id: `evt_${Date.now()}`,
            creatorId: user.id,
            creatorName: user.name,
            joinedPlayers: [user.id],
            pendingRequests: [],
            status: "Open"
        };

        saveEvents([...events, newEvent]);
    };

    const joinEvent = (eventId: string) => {
        if (!user) return;

        const updatedEvents = events.map(evt => {
            if (evt.id === eventId) {
                if (evt.joinedPlayers.includes(user.id) || evt.pendingRequests.includes(user.id)) return evt;

                return {
                    ...evt,
                    pendingRequests: [...evt.pendingRequests, user.id]
                };
            }
            return evt;
        });
        saveEvents(updatedEvents);
    };

    const cancelRequest = (eventId: string) => {
        if (!user) return;
        const updatedEvents = events.map(evt => {
            if (evt.id === eventId) {
                return {
                    ...evt,
                    pendingRequests: evt.pendingRequests.filter(id => id !== user.id)
                };
            }
            return evt;
        });
        saveEvents(updatedEvents);
    };

    const acceptRequest = (eventId: string, userId: string) => {
        const updatedEvents = events.map(evt => {
            if (evt.id === eventId) {
                if (!evt.pendingRequests.includes(userId)) return evt;

                const updatedJoined = [...evt.joinedPlayers, userId];
                const updatedStatus = updatedJoined.length - 1 >= evt.requiredPlayers ? "Full" : "Open";

                return {
                    ...evt,
                    joinedPlayers: updatedJoined,
                    pendingRequests: evt.pendingRequests.filter(id => id !== userId),
                    status: updatedStatus as "Open" | "Full" | "Completed"
                };
            }
            return evt;
        });
        saveEvents(updatedEvents);
    };

    const rejectRequest = (eventId: string, userId: string) => {
        const updatedEvents = events.map(evt => {
            if (evt.id === eventId) {
                return {
                    ...evt,
                    pendingRequests: evt.pendingRequests.filter(id => id !== userId)
                };
            }
            return evt;
        });
        saveEvents(updatedEvents);
    };

    const leaveEvent = (eventId: string) => {
        if (!user) return;

        const updatedEvents = events.map(evt => {
            if (evt.id === eventId) {
                return {
                    ...evt,
                    joinedPlayers: evt.joinedPlayers.filter(id => id !== user.id),
                    status: "Open" as const
                };
            }
            return evt;
        });
        saveEvents(updatedEvents);
    };

    const getMyEvents = () => {
        if (!user) return { hosted: [], joined: [] };
        return {
            hosted: events.filter(e => e.creatorId === user.id),
            joined: events.filter(e => e.joinedPlayers.includes(user.id) && e.creatorId !== user.id)
        };
    };

    return (
        <EventContext.Provider value={{ events, createEvent, joinEvent, cancelRequest, acceptRequest, rejectRequest, leaveEvent, getMyEvents }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error("useEvent must be used within an EventProvider");
    }
    return context;
};
