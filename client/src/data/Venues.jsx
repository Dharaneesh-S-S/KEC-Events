// client/src/data/Venues.jsx
export const departments = [
  { id: '1', name: 'IT PARK', code: 'IT' },
  { id: '2', name: 'FOOD TECH', code: 'FT' },
  { id: '3', name: 'ECE', code: 'ECE' },
  { id: '4', name: 'MCA', code: 'MCA' },
  { id: '5', name: 'EEE', code: 'EEE' },
  { id: '6', name: 'MTS', code: 'MTS' },
  { id: '7', name: 'MECH', code: 'MECH' },
  { id: '8', name: 'AUTOMOBILE', code: 'AUTO' },
  { id: '9', name: 'ADMIN BLOCK', code: 'ADMIN' }
];

export const venues = [
  {
    id: 'cc1',
    name: 'CC 1',
    type: 'cc',
    department: 'IT PARK',
    facultyInCharge: 'Dr. Rajesh Kumar',
    facultyContact: '+91 9876543210',
    labAssistant: 'Mr. Suresh',
    labAssistantContact: '+91 9876543211',
    capacity: 60,
    logistics: ['Projector', 'Mic', 'Whiteboard', 'AC'],
    image: 'https://images.pexels.com/photos/159844/computer-room-computers-school-159844.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'cc2',
    name: 'CC 2',
    type: 'cc',
    department: 'IT PARK',
    facultyInCharge: 'Dr. Priya Sharma',
    facultyContact: '+91 9876543212',
    labAssistant: 'Ms. Lakshmi',
    labAssistantContact: '+91 9876543213',
    capacity: 50,
    logistics: ['Projector', 'Speakers', 'Whiteboard'],
    image: 'https://images.pexels.com/photos/159844/computer-room-computers-school-159844.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'cc3',
    name: 'CC 1',
    type: 'cc',
    department: 'ECE',
    facultyInCharge: 'Dr. Anand Krishnan',
    facultyContact: '+91 9876543214',
    labAssistant: 'Mr. Ravi',
    labAssistantContact: '+91 9876543215',
    capacity: 45,
    logistics: ['Projector', 'Mic', 'AC'],
    image: 'https://images.pexels.com/photos/159844/computer-room-computers-school-159844.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'cc4',
    name: 'CC 2',
    type: 'cc',
    department: 'ECE',
    facultyInCharge: 'Dr. Meena Patel',
    facultyContact: '+91 9876543216',
    labAssistant: 'Ms. Divya',
    labAssistantContact: '+91 9876543217',
    capacity: 55,
    logistics: ['Projector', 'Speakers', 'Whiteboard', 'AC'],
    image: 'https://images.pexels.com/photos/159844/computer-room-computers-school-159844.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'sem1',
    name: 'Seminar Hall',
    type: 'seminar',
    department: 'CSE',
    facultyInCharge: 'Dr. Venkat Raman',
    facultyContact: '+91 9876543218',
    labAssistant: 'Mr. Kumar',
    labAssistantContact: '+91 9876543219',
    capacity: 150,
    logistics: ['Stage', 'Projector', 'Sound System', 'AC', 'Stage Lighting'],
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'sem2',
    name: 'Seminar Hall',
    type: 'seminar',
    department: 'ECE',
    facultyInCharge: 'Dr. Lakshmi Narayan',
    facultyContact: '+91 9876543220',
    labAssistant: 'Ms. Priya',
    labAssistantContact: '+91 9876543221',
    capacity: 120,
    logistics: ['Stage', 'Projector', 'Sound System', 'AC'],
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'sem3',
    name: 'Seminar Hall',
    type: 'seminar',
    department: 'MECH',
    facultyInCharge: 'Dr. Arun Kumar',
    facultyContact: '+91 9876543222',
    labAssistant: 'Mr. Ganesh',
    labAssistantContact: '+91 9876543223',
    capacity: 100,
    logistics: ['Stage', 'Projector', 'Sound System'],
    image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];
