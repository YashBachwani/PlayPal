import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Users, Calendar, Clock, Plus, Trophy, ChevronRight, UserPlus, Check, X, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChat from "@/components/AIChat";
import { players } from "@/data/players";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEvent, Event } from "@/contexts/EventContext";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LocationPicker from "@/components/LocationPicker";

const Players = () => {
  const { selectedCity } = useLocation();
  const { user } = useAuth();
  const { events, createEvent, joinEvent, getMyEvents, leaveEvent, acceptRequest, rejectRequest, cancelRequest } = useEvent();
  const [activeTab, setActiveTab] = useState("events"); // events, players, my-events

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  // Create Event State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    sport: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    coordinates: undefined as { lat: number, lng: number } | undefined,
    requiredPlayers: 1,
    description: "",
    skillLevel: "Intermediate" as Event["skillLevel"]
  });

  const onLocationSelect = (lat: number, lng: number, address: string) => {
    setNewEvent({ ...newEvent, location: address, coordinates: { lat, lng } });
  };

  const sports = ["Cricket", "Football", "Badminton", "Tennis", "Pickleball"];
  const skillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  const handleCreateEvent = () => {
    if (!newEvent.sport || !newEvent.date || !newEvent.startTime || !newEvent.endTime || !newEvent.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    createEvent({
      ...newEvent,
      requiredPlayers: Number(newEvent.requiredPlayers)
    });

    setIsCreateOpen(false);
    toast.success("Event created successfully! 🎉");
    setActiveTab("my-events");
  };

  const handleJoinRequest = (eventId: string) => {
    if (!user) {
      toast.error("Please login to join events");
      return;
    }
    joinEvent(eventId); // This now sends a request
    toast.success("Request sent! Waiting for host approval. ⏳");
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchQuery ||
      event.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || event.sport === selectedSport;
    return matchesSearch && matchesSport && event.status === "Open";
  });

  const filteredPlayers = players.filter(player => {
    const matchesCity = player.city.toLowerCase() === selectedCity.name.toLowerCase();
    const matchesSearch = !searchQuery ||
      player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = !selectedSport || player.sports.includes(selectedSport);
    return matchesCity && matchesSearch && matchesSport;
  });

  const myEvents = getMyEvents();

  const getPendingCount = () => {
    // Calculate how many requests are pending for events hosted by user
    return myEvents.hosted.reduce((acc, curr) => acc + curr.pendingRequests.length, 0);
  };

  const getMyPendingRequestsCount = () => {
    // Calculate how many events the user has requested to join but is pending
    return events.filter(e => e.pendingRequests.includes(user?.id || "")).length;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community & Events</h1>
              <p className="text-muted-foreground">Find games, connect with players, and build your reputation.</p>
            </div>
            {user && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" /> Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Sport</Label>
                        <Select onValueChange={(v) => setNewEvent({ ...newEvent, sport: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sport" />
                          </SelectTrigger>
                          <SelectContent>
                            {sports.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Skill Level</Label>
                        <Select onValueChange={(v) => setNewEvent({ ...newEvent, skillLevel: v as Event["skillLevel"] })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {skillLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input type="time" onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input type="time" onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Location / Venue</Label>
                      <LocationPicker onLocationSelect={onLocationSelect} />
                      {newEvent.location && <p className="text-xs text-muted-foreground mt-1">Selected: {newEvent.location}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Players Needed</Label>
                      <Input type="number" min="1" placeholder="1" onChange={(e) => setNewEvent({ ...newEvent, requiredPlayers: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input placeholder="e.g. Looking for intermediate players for doubles" onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                    </div>
                    <Button className="w-full" onClick={handleCreateEvent}>Create Event</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 p-1 bg-secondary/30 rounded-full">
              {[
                { id: "events", label: "Find Events", icon: Search },
                { id: "players", label: "Find Players", icon: Users },
                { id: "my-events", label: "My Events", icon: Calendar }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm transition-all ${activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-background/50 text-muted-foreground"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "my-events" && user && getPendingCount() > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{getPendingCount()}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filters (Shared for Find tabs) */}
          {activeTab !== "my-events" && (
            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md mx-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "events" ? "Search by sport or location..." : "Search players..."}
                    className="pl-9 bg-card"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {sports.map(sport => (
                  <button
                    key={sport}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedSport === sport ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/50 text-muted-foreground"
                      }`}
                    onClick={() => setSelectedSport(selectedSport === sport ? null : sport)}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="min-h-[400px]">
            {activeTab === "events" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const isJoined = event.joinedPlayers.includes(user?.id || "");
                  const isPending = event.pendingRequests.includes(user?.id || "");
                  const isCreator = user?.id === event.creatorId;

                  return (
                    <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{event.sport}</h3>
                          <p className="text-xs text-muted-foreground">Hosted by {event.creatorName}</p>
                        </div>
                        <span className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                          {event.skillLevel}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-primary/70" />
                          <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-primary/70" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-primary/70 mt-1" />
                          <div className="flex flex-col">
                            <span className="line-clamp-2">{event.location}</span>
                            {event.coordinates && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                View on Map
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-primary/70" />
                          <span>{event.joinedPlayers.length} / {event.requiredPlayers + 1} Players</span>
                        </div>
                      </div>

                      <Button
                        className={`w-full transition-colors group-hover:shadow-lg ${isPending ? "bg-orange-100 text-orange-600 hover:bg-orange-200" :
                          isJoined ? "bg-green-100 text-green-600 hover:bg-green-200" : ""
                          }`}
                        onClick={() => isPending ? cancelRequest(event.id) : handleJoinRequest(event.id)}
                        disabled={isCreator || isJoined}
                      >
                        {isCreator ? "You are hosting" :
                          isJoined ? "Joined" :
                            isPending ? "Pending Approval (Cancel)" : "Request to Join"}
                      </Button>
                    </motion.div>
                  );
                })}

                {filteredEvents.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground bg-card/50 rounded-2xl border-dashed border-2">
                    <Trophy className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">No active events found</p>
                    <p className="text-sm">Be the first to create one!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "players" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                  <motion.div key={player.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border rounded-xl p-6 group hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <img src={player.avatar} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-border group-hover:border-primary transition-colors" />
                      <div>
                        <h3 className="font-bold text-lg">{player.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                          <Star className="w-4 h-4 fill-current" /> {player.rating} <span className="text-muted-foreground ml-1">({player.matchesPlayed} matches)</span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {player.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {player.sports.map(s => (
                        <span key={s} className="text-xs font-medium bg-secondary px-2 py-1 rounded">{s}</span>
                      ))}
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">{player.skillLevel}</span>
                    </div>

                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">Connect</Button>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === "my-events" && (
              <div className="space-y-8">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors">
                    <span className="text-4xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">{myEvents.hosted.length}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Hosting</span>
                  </div>
                  <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors">
                    <span className="text-4xl font-bold text-orange-500 mb-1 group-hover:scale-110 transition-transform">{getPendingCount() + getMyPendingRequestsCount()}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Pending Requests</span>
                  </div>
                  <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors">
                    <span className="text-4xl font-bold text-blue-500 mb-1 group-hover:scale-110 transition-transform">{myEvents.joined.length}</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Joining</span>
                  </div>
                  <div className="bg-card border rounded-xl p-6 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors">
                    <span className="text-4xl font-bold text-slate-500 mb-1 group-hover:scale-110 transition-transform">1</span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Past</span>
                  </div>
                </div>

                <Tabs defaultValue="hosting" className="w-full">
                  <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto gap-6">
                    <TabsTrigger value="hosting" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-muted-foreground data-[state=active]:text-foreground">
                      Events I Created <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{myEvents.hosted.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="joined" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-muted-foreground data-[state=active]:text-foreground">
                      Events I Joined <span className="ml-2 bg-blue-500/10 text-blue-600 text-xs px-2 py-0.5 rounded-full">{myEvents.joined.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 text-muted-foreground data-[state=active]:text-foreground">
                      My Pending Requests <span className="ml-2 bg-orange-500/10 text-orange-600 text-xs px-2 py-0.5 rounded-full">{getMyPendingRequestsCount()}</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="hosting" className="mt-6 space-y-4">
                    {myEvents.hosted.map(event => (
                      <div key={event.id} className="bg-card border rounded-xl p-4 gap-6 group hover:border-primary/30 transition-all">
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h4 className="font-bold text-lg">{event.sport} <span className="text-sm font-normal text-muted-foreground">({event.joinedPlayers.length}/{event.requiredPlayers + 1})</span></h4>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.startTime} - {event.endTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold bg-secondary px-3 py-1 rounded-full">{event.status}</span>
                          </div>
                        </div>

                        {/* Pending Requests Section */}
                        {event.pendingRequests.length > 0 && (
                          <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 mt-4">
                            <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Users className="w-3 h-3" /> {event.pendingRequests.length} Pending Requests
                            </h5>
                            <div className="space-y-2">
                              {event.pendingRequests.map(userId => (
                                <div key={userId} className="flex items-center justify-between bg-white/50 p-2 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                                      U
                                    </div>
                                    <span className="text-sm font-medium">User {userId}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => rejectRequest(event.id, userId)}>
                                      <X className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600" onClick={() => acceptRequest(event.id, userId)}>
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {myEvents.hosted.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <p>You haven't created any events yet.</p>
                        <Button variant="link" onClick={() => setIsCreateOpen(true)} className="text-primary">Create one now</Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="joined" className="mt-6 space-y-4">
                    {myEvents.joined.map(event => (
                      <div key={event.id} className="bg-card border rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 group hover:border-blue-500/30 transition-all">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                          <UserPlus className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="font-bold text-lg">{event.sport}</h4>
                          <p className="text-xs text-muted-foreground mb-1">Hosted by {event.creatorName}</p>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.startTime} - {event.endTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">Joined</span>
                          <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => leaveEvent(event.id)}>
                            Leave
                          </Button>
                        </div>
                      </div>
                    ))}
                    {myEvents.joined.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <p>You haven't joined any events yet.</p>
                        <Button variant="link" onClick={() => setActiveTab("events")} className="text-primary">Find events</Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-6 space-y-4">
                    {events.filter(e => e.pendingRequests.includes(user?.id || "")).map(event => (
                      <div key={event.id} className="bg-card border rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 group hover:border-orange-500/30 transition-all">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-600">
                          <Hourglass className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="font-bold text-lg">{event.sport}</h4>
                          <p className="text-xs text-muted-foreground mb-1">Hosted by {event.creatorName}</p>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.startTime} - {event.endTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">Request Sent</span>
                          <Button variant="outline" className="text-muted-foreground hover:bg-secondary" onClick={() => cancelRequest(event.id)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                    {events.filter(e => e.pendingRequests.includes(user?.id || "")).length === 0 && (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <p>You have no pending join requests.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <AIChat />
    </div>
  );
};
export default Players;
