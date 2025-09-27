import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Bell, Phone, Chrome as Home, LogOut, LogIn, User, Calendar, Users, MapPin, Clock, ExternalLink, Plus, CreditCard as Edit, Trash, ArrowLeft, FileText, Building, Settings } from 'lucide-react';

// Types
type UserRole = 'guest' | 'student' | 'club' | 'admin';
type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Workshop';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  deadline: string;
  teamSize: string;
  category: EventCategory;
  venue: string;
  image: string;
  isFree: boolean;
  clubName: string;
  clubLogo: string;
  formUrl: string;
  rules: string[];
}

interface Club {
  id: string;
  name: string;
  email: string;
  department: string;
  description: string;
  createdDate: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
}

// Sample Data
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'CODEUP\'25',
    description: 'Annual coding competition featuring algorithmic challenges, data structures, and problem-solving contests.',
    date: '2/15/2025',
    deadline: '2/10/2025',
    teamSize: '1-3 members',
    category: 'Technical',
    venue: 'CSE Block - Lab 1',
    image: 'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg',
    isFree: true,
    clubName: 'CSE KEC',
    clubLogo: '🏛️',
    formUrl: 'https://forms.google.com/sample-registration',
    rules: [
      'Teams of 1-3 members allowed',
      'Programming languages: C++, Java, Python',
      'Duration: 3 hours',
      'Laptops will be provided',
      'Internet access restricted to documentation only'
    ]
  },
  {
    id: '2',
    title: 'ROBO WARS 2025',
    description: 'Build and battle with your robots in this exciting competition.',
    date: '2/20/2025',
    deadline: '2/15/2025',
    teamSize: '2-4 members',
    category: 'Technical',
    venue: 'Mechanical Workshop',
    image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
    isFree: false,
    clubName: 'Robotics Club',
    clubLogo: '🤖',
    formUrl: 'https://forms.google.com/robo-wars-registration',
    rules: [
      'Teams of 2-4 members allowed',
      'Robot weight limit: 5kg',
      'Duration: Full day event',
      'Safety gear mandatory'
    ]
  },
  {
    id: '3',
    title: 'CULTURAL FEST 2025',
    description: 'Celebrate diversity through music, dance, and cultural performances.',
    date: '3/1/2025',
    deadline: '2/25/2025',
    teamSize: '1-8 members',
    category: 'Cultural',
    venue: 'Main Auditorium',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    isFree: true,
    clubName: 'Cultural Committee',
    clubLogo: '🎭',
    formUrl: 'https://forms.google.com/cultural-fest-registration',
    rules: [
      'Individual or group participation allowed',
      'Multiple categories available',
      'Time limit: 10 minutes per performance',
      'Original compositions preferred'
    ]
  },
  {
    id: '4',
    title: 'HACKATHON 2025',
    description: 'Code, innovate, and create solutions for real-world problems.',
    date: '2/28/2025',
    deadline: '2/20/2025',
    teamSize: '2-4 members',
    category: 'Technical',
    venue: 'CSE Block - Lab 3',
    image: 'https://images.pexels.com/photos/1181472/pexels-photo-1181472.jpeg',
    isFree: true,
    clubName: 'Innovation Club',
    clubLogo: '💡',
    formUrl: 'https://forms.google.com/hackathon-registration',
    rules: [
      'Teams of 2-4 members required',
      'Duration: 24 hours',
      'Open source solutions preferred',
      'Mentorship available'
    ]
  }
];

const sampleClubs: Club[] = [
  { id: '1', name: 'CSE_KEC', email: 'cse.kec@gmail.com', department: 'CSE', description: '-', createdDate: '8/13/2025' },
  { id: '2', name: 'CSD_KEC', email: 'csd.kec@gmail.com', department: 'CSD', description: '-', createdDate: '8/14/2025' },
  { id: '3', name: 'IT_KEC', email: 'it.kec@gmail.com', department: 'IT', description: 'IT Official', createdDate: '8/18/2025' },
  { id: '4', name: 'CCC', email: 'ccc@gmail.com', department: 'CSE', description: '-', createdDate: '8/25/2025' },
  { id: '5', name: 'CSEA', email: 'csea@gmail.com', department: 'CSE', description: '-', createdDate: '8/25/2025' }
];

const sampleStaff: Staff[] = [
  { id: '1', name: 'Dr. John Doe', email: 'john.doe@kec.edu', position: 'Professor', department: 'Computer Science' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@kec.edu', position: 'Assistant Professor', department: 'Information Technology' },
];

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [events] = useState<Event[]>(sampleEvents);
  const [clubs, setClubs] = useState<Club[]>(sampleClubs);
  const [staff, setStaff] = useState<Staff[]>(sampleStaff);
  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [newClub, setNewClub] = useState({ name: '', email: '', department: '', description: '' });
  const [newStaff, setNewStaff] = useState({ name: '', email: '', position: '', department: '' });
  const [newEvent, setNewEvent] = useState({
    title: '',
    attendees: '',
    date: '',
    deadline: '',
    teamSize: '',
    category: 'Technical' as EventCategory,
    description: '',
    rules: '',
    formUrl: '',
    venue: '',
    isFree: true
  });

  const [pageHistory, setPageHistory] = useState<string[]>(['home']);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setPageHistory(prevHistory => [...prevHistory, page]);
  };

  const goBack = () => {
    setPageHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, prevHistory.length - 1);
      if (newHistory.length > 0) {
        setCurrentPage(newHistory[newHistory.length - 1]);
        return newHistory;
      }
      setCurrentPage('home'); // Fallback to home if history is empty
      return ['home'];
    });
  };

  // Primary Navigation Component
  const PrimaryNavbar = () => {
    const formatPageName = (name: string) => {
      return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
      <nav className="bg-background border-b border-border px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {pageHistory.length > 1 && (
              <Button variant="ghost" size="icon" onClick={goBack} className="text-muted-foreground hover:bg-muted hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="w-8 h-8 bg-brand-blue text-white rounded flex items-center justify-center font-bold">
                KE
              </div>
              <span className="text-xl font-semibold text-foreground">KEC Events</span>
            </div>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <span className="text-lg font-semibold text-foreground capitalize">{formatPageName(currentPage)}</span>
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <Button onClick={() => navigateTo('login')} className="bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => navigateTo('home')}>
                  <Home className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => navigateTo('profile')}>
                  <User className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-muted text-foreground">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setUser(null)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  };

  // Event Card Component
  const EventCard = ({ event }: { event: Event }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        {event.isFree && (
          <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            Free
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
          <div className="text-2xl">{event.clubLogo}</div>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Team Size: {event.teamSize}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Deadline: {event.deadline}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary">{event.category}</Badge>
          <Button 
            onClick={() => {
              setSelectedEvent(event);
              navigateTo('event-details');
            }}
            className={`bg-primary hover:bg-primary/90 text-primary-foreground`}
          >
            {user?.role === 'student' ? 'Register Now' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Home/Landing Page
  const HomePage = () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to KEC Fests</h1>
          <p className="text-xl text-muted-foreground">
            Discover and participate in exciting events at Kongu Engineering College
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events
            .filter(event => 
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
        </div>
      </div>
    </div>
  );

  // Login Page
  const LoginPage = () => (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-gradient-to-br from-brand-blue via-brand-purple to-brand-dark-blue flex items-center justify-center p-8">
        <div className="text-center text-primary-foreground max-w-md">
          <h1 className="text-4xl font-bold mb-6">Welcome to KEC Fests</h1>
          <p className="text-xl mb-8">
            Discover amazing events and connect with your college community
          </p>
          <Button 
            variant="outline" 
            className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-brand-blue"
          >
            Don't have an account? →
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <p className="text-muted-foreground">Access your account to manage events</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Login ID</Label>
              <Input
                id="email"
                type="email"
                placeholder="student3@kongu.edu"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember"
                  checked={loginData.rememberMe}
                  onCheckedChange={(checked) => setLoginData(prev => ({ ...prev, rememberMe: checked as boolean }))}
                />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <Button variant="link" className="text-sm">Forgot password?</Button>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => {
                // Simple role detection based on email
                let role: UserRole = 'student';
                if (loginData.email.includes('admin')) role = 'admin';
                else if (loginData.email.includes('club') || loginData.email.includes('kec')) role = 'club';
                
                setUser({
                  id: '1',
                  name: role === 'admin' ? 'Admin User' : role === 'club' ? 'CSE KEC' : 'Student',
                  email: loginData.email,
                  role: role
                });
                navigateTo('home');
              }}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Event Details Page
  const EventDetailsPage = () => {
    if (!selectedEvent) return <div>Event not found</div>;

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Events</CardTitle>
                  <p className="text-sm text-muted-foreground">Select an event to view details</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedEvent.id === event.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card hover:bg-accent border-border'
                      }`}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm opacity-90">{event.date}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {event.category}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {/* Event Details Card */}
              <Card>
                <div className="relative">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  {selectedEvent.isFree && (
                    <Badge className="absolute top-4 right-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Free
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    {selectedEvent.title}
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    {selectedEvent.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Event Date</p>
                          <p className="text-muted-foreground">{selectedEvent.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Team Size</p>
                          <p className="text-muted-foreground">{selectedEvent.teamSize}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Venue</p>
                          <p className="text-muted-foreground">{selectedEvent.venue}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Registration Deadline</p>
                          <p className="text-muted-foreground">{selectedEvent.deadline}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Rules & Guidelines</h3>
                    <ul className="space-y-2">
                      {selectedEvent.rules.map((rule, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {user?.role === 'student' && (
                    <Button
                      onClick={() => setShowRegistrationForm(prev => !prev)} // Toggle form visibility
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {showRegistrationForm ? 'Hide Registration Form' : 'Register Now'}
                    </Button>
                  )}

                  {(user?.role === 'club' || user?.role === 'admin') && (
                    <div className="flex space-x-3">
                      <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Event
                      </Button>
                      <Button variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Event
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration Form Card (conditionally rendered) */}
              {showRegistrationForm && user?.role === 'student' && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Registration Form</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-6 rounded-lg text-center">
                      <p className="text-muted-foreground mb-4">
                        The registration form will be loaded here as an iframe.
                      </p>
                      <div className="border-2 border-dashed border-border rounded-lg p-8">
                        <iframe
                          src={selectedEvent.formUrl}
                          className="w-full h-96 border-0"
                          title="Registration Form"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Create Event Page
  const CreateEventPage = () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={goBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Event</CardTitle>
            <p className="text-muted-foreground">Fill out the form below to create a new event for your club.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendees">Expected Attendees</Label>
                    <Input
                      id="attendees"
                      placeholder="Number of expected attendees"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, attendees: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Event Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Registration Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newEvent.deadline}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      placeholder="e.g., Individual, 2-4 members"
                      value={newEvent.teamSize}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, teamSize: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value: EventCategory) => setNewEvent(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event in detail..."
                    className="min-h-24"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="rules">Rules & Guidelines *</Label>
                  <Textarea
                    id="rules"
                    placeholder="List the rules and guidelines for participants..."
                    className="min-h-24"
                    value={newEvent.rules}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, rules: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="formUrl">Form Link</Label>
                    <Input
                      id="formUrl"
                      placeholder="https://example.com/registration-form"
                      value={newEvent.formUrl}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, formUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="venue">Booked Venue</Label>
                    <Input
                      id="venue"
                      placeholder="e.g., Main Auditorium"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, venue: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="poster">Poster Image *</Label>
                  <Input
                    id="poster"
                    type="file"
                    accept="image/*"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free"
                    checked={newEvent.isFree}
                    onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, isFree: checked as boolean }))}
                  />
                  <Label htmlFor="free">This is a free event</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={goBack}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Manage Events Page
  const ManageEventsPage = () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Events</h1>
          <p className="text-muted-foreground">Edit or delete your club events</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="relative">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-40 object-cover"
                />
                {event.isFree && (
                  <Badge className="absolute top-2 right-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Free
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-3 h-3" />
                    <span>{event.teamSize}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{event.category}</Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  // Admin Dashboard Page
  const AdminDashboardPage = () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage clubs and venues across departments</p>
        </div>

        <Tabs defaultValue="clubs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="clubs">Club Details</TabsTrigger>
            <TabsTrigger value="venues">Venue Details</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
          </TabsList>

          <TabsContent value="clubs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Club</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="clubName">Name *</Label>
                    <Input
                      id="clubName"
                      placeholder="Enter club's name"
                      value={newClub.name}
                      onChange={(e) => setNewClub(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clubEmail">Email *</Label>
                    <Input
                      id="clubEmail"
                      placeholder="Enter club's email"
                      value={newClub.email}
                      onChange={(e) => setNewClub(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newClub.department}
                    onValueChange={(value) => setNewClub(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="MECH">MECH</SelectItem>
                      <SelectItem value="CSD">CSD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <Label htmlFor="clubDescription">Description</Label>
                  <Textarea
                    id="clubDescription"
                    placeholder="Enter description (optional)"
                    value={newClub.description}
                    onChange={(e) => setNewClub(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    if (newClub.name && newClub.email) {
                      const club: Club = {
                        id: Date.now().toString(),
                        ...newClub,
                        createdDate: new Date().toLocaleDateString()
                      };
                      setClubs(prev => [...prev, club]);
                      setNewClub({ name: '', email: '', department: '', description: '' });
                    }
                  }}
                >
                  Create Club
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Clubs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input placeholder="Search clubs..." className="max-w-md" />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NAME</TableHead>
                        <TableHead>EMAIL</TableHead>
                        <TableHead>DEPARTMENT</TableHead>
                        <TableHead>DESCRIPTION</TableHead>
                        <TableHead>CREATED DATE</TableHead>
                        <TableHead>ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clubs.map((club) => (
                        <TableRow key={club.id}>
                          <TableCell className="font-medium">{club.name}</TableCell>
                          <TableCell>{club.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-border text-foreground">{club.department}</Badge>
                          </TableCell>
                          <TableCell>{club.description || '-'}</TableCell>
                          <TableCell>{club.createdDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted">Edit</Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setClubs(prev => prev.filter(c => c.id !== club.id))}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Venue Management</h3>
                <p className="text-muted-foreground">
                  Venue management features will be implemented here. This includes booking, 
                  availability checking, and venue details management.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Staff Member</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="staffName">Name *</Label>
                    <Input
                      id="staffName"
                      placeholder="Enter staff name"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="staffEmail">Email *</Label>
                    <Input
                      id="staffEmail"
                      placeholder="Enter staff email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={newStaff.position}
                      onValueChange={(value) => setNewStaff(prev => ({ ...prev, position: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="staffDepartment">Department</Label>
                    <Select
                      value={newStaff.department}
                      onValueChange={(value) => setNewStaff(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Electronics and Communication">Electronics and Communication</SelectItem>
                        <SelectItem value="Mechanical">Mechanical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    if (newStaff.name && newStaff.email) {
                      const staffMember: Staff = {
                        id: Date.now().toString(),
                        ...newStaff
                      };
                      setStaff(prev => [...prev, staffMember]);
                      setNewStaff({ name: '', email: '', position: '', department: '' });
                    }
                  }}
                >
                  Add Staff
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NAME</TableHead>
                        <TableHead>EMAIL</TableHead>
                        <TableHead>POSITION</TableHead>
                        <TableHead>DEPARTMENT</TableHead>
                        <TableHead>ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.position}</TableCell>
                          <TableCell>{member.department}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-muted">Edit</Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setStaff(prev => prev.filter(s => s.id !== member.id))}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // Page Rendering Logic
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage />;
      case 'event-details':
        return <EventDetailsPage />;
      case 'create-event':
        return <CreateEventPage />;
      case 'manage-events':
        return <ManageEventsPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PrimaryNavbar />
      {renderPage()}
    </div>
  );
}

export default App;