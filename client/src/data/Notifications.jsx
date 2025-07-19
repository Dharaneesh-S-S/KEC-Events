// client/src/data/Notifications.jsx
export const notifications = [
  {
    id: '1',
    title: 'Venue Booked Successfully',
    message: 'CC 1 - IT PARK has been booked for your event on Feb 15, 2025',
    type: 'venue_booked',
    timestamp: '2025-01-15T14:00:00Z',
    read: false
  },
  {
    id: '2',
    title: 'New Event Registration',
    message: "15 new participants registered for CODEUP'25",
    type: 'event_registered',
    timestamp: '2025-01-14T10:30:00Z',
    read: false
  },
  {
    id: '3',
    title: 'Registration Deadline Reminder',
    message: 'HACKATHON 2025 registration closes in 2 days',
    type: 'deadline_reminder',
    timestamp: '2025-01-13T16:45:00Z',
    read: true
  },
  {
    id: '4',
    title: 'Seminar Hall Confirmed',
    message: 'CSE Seminar Hall booking confirmed for March 1, 2025',
    type: 'venue_booked',
    timestamp: '2025-01-12T09:15:00Z',
    read: true
  }
];
