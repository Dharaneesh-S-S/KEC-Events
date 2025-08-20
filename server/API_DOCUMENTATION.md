# KEC Events API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### Signup
```
POST /auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "student",
  "department": "CSE"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Verify Token
```
GET /auth/verify
Authorization: Bearer <token>
```

---

## 2. User Management

### Update Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "department": "ECE",
  "password": "newpassword123"
}
```

---

## 3. Event Management

### Get All Events
```
GET /events?page=1&limit=10
```

### Get Event by ID
```
GET /events/:id
```

### Create Event
```
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tech Workshop",
  "venue": "Seminar Hall 1",
  "posterLink": "https://example.com/poster.jpg",
  "teamSize": 4,
  "eventDate": "2024-02-15T10:00:00.000Z",
  "registrationDeadline": "2024-02-10T23:59:59.000Z",
  "description": "Learn new technologies",
  "rules": ["Rule 1", "Rule 2"],
  "category": "workshop",
  "isFree": true
}
```

### Update Event
```
PUT /events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Tech Workshop",
  "description": "Updated description"
}
```

### Delete Event
```
DELETE /events/:id
Authorization: Bearer <token>
```

---

## 4. Venue Management

### Get All Venues
```
GET /venues?venueType=seminar&department=CSE&isActive=true&page=1&limit=10
```

### Get Venue by ID
```
GET /venues/:id
```

### Get Venue Statistics
```
GET /venues/stats
```

### Create Venue
```
POST /venues
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Seminar Hall 1",
  "venueType": "seminar",
  "location": "Main Building",
  "department": "CSE",
  "capacity": 100,
  "facultyInCharge": "Dr. Smith",
  "facultyContact": "9876543210",
  "features": ["Projector", "AC", "WiFi"],
  "availableLogistics": {
    "projector": true,
    "mic": true,
    "speakers": true,
    "ac": true
  },
  "description": "Main seminar hall with modern facilities"
}
```

### Update Venue
```
PUT /venues/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "capacity": 120,
  "features": ["Projector", "AC", "WiFi", "Stage"]
}
```

### Update Venue Availability
```
PUT /venues/:id/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "isActive": false,
  "maintenanceMode": true,
  "maintenanceStartDate": "2024-02-01",
  "maintenanceEndDate": "2024-02-15",
  "maintenanceReason": "Equipment upgrade"
}
```

### Delete Venue
```
DELETE /venues/:id
Authorization: Bearer <token>
```

---

## 5. Booking Management

### Get All Bookings
```
GET /bookings?venue=seminar_hall&status=pending&department=CSE&page=1&limit=10
```

### Get Booking by ID
```
GET /bookings/:id
Authorization: Bearer <token>
```

### Get Booking Statistics
```
GET /bookings/stats?venueType=seminar&department=CSE&fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer <token>
```

### Create Booking
```
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "venue": "venue_id_here",
  "venueType": "seminar",
  "fromDate": "2024-02-15",
  "toDate": "2024-02-15",
  "fromTime": "09:00",
  "toTime": "12:00",
  "facultyInCharge": "Dr. Smith",
  "department": "CSE",
  "mobileNumber": "9876543210",
  "eventName": "Tech Workshop",
  "participants": 50,
  "softwareRequirement": "None",
  "eventType": "workshop",
  "functionName": "Tech Workshop 2024",
  "functionDate": "2024-02-15",
  "chiefGuest": "Dr. Johnson",
  "totalAudience": 100,
  "logistics": "Projector needed",
  "alternatives": "Lab 101"
}
```

### Update Booking Status
```
PUT /bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved"
}
```

### Delete Booking
```
DELETE /bookings/:id
Authorization: Bearer <token>
```

---

## 6. Availability Management

### Get Venue Availability
```
GET /availability?venueId=venue_id&date=2024-02-15&status=available
Authorization: Bearer <token>
```

### Check Specific Time Slot Availability
```
POST /availability/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "venueId": "venue_id_here",
  "date": "2024-02-15",
  "startTime": "09:00",
  "endTime": "12:00"
}
```

### Create Availability Slot
```
POST /availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "venueId": "venue_id_here",
  "date": "2024-02-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "status": "available"
}
```

### Bulk Create Availability Slots
```
POST /availability/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "venueId": "venue_id_here",
  "slots": [
    {
      "date": "2024-02-15",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    {
      "date": "2024-02-15",
      "startTime": "14:00",
      "endTime": "17:00"
    }
  ]
}
```

### Update Availability Slot
```
PUT /availability/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "booked",
  "booking": "booking_id_here"
}
```

### Delete Availability Slot
```
DELETE /availability/:id
Authorization: Bearer <token>
```

### Get Availability Statistics
```
GET /availability/stats?venueId=venue_id&fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer <token>
```

---

## 7. Booking Rules Management

### Get All Rules
```
GET /rules?venueType=seminar&department=CSE&isActive=true&page=1&limit=10
Authorization: Bearer <token>
```

### Get Applicable Rules
```
GET /rules/applicable?venueType=seminar&venueId=venue_id&department=CSE&userRole=student
Authorization: Bearer <token>
```

### Get Rule by ID
```
GET /rules/:id
Authorization: Bearer <token>
```

### Create Rule
```
POST /rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "ruleName": "Seminar Hall Booking Rule",
  "ruleType": "venue_type",
  "venueType": "seminar",
  "timeRestrictions": {
    "maxAdvanceBookingDays": 30,
    "minAdvanceBookingHours": 24,
    "maxBookingDurationHours": 8,
    "allowWeekendBookings": true
  },
  "capacityRestrictions": {
    "maxParticipants": 100,
    "minParticipants": 5
  },
  "approvalWorkflow": {
    "requireFacultyApproval": true,
    "autoApproveForFaculty": true
  },
  "description": "Standard rules for seminar hall bookings"
}
```

### Update Rule
```
PUT /rules/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "timeRestrictions": {
    "maxAdvanceBookingDays": 45
  }
}
```

### Toggle Rule Status
```
PUT /rules/:id/toggle
Authorization: Bearer <token>
```

### Delete Rule
```
DELETE /rules/:id
Authorization: Bearer <token>
```

---

## 8. Notification Management

### Get All Notifications
```
GET /notifications?userId=user_id&notificationType=booking_created&page=1&limit=20
Authorization: Bearer <token>
```

### Get User Notifications
```
GET /notifications/user?unreadOnly=true&page=1&limit=20
Authorization: Bearer <token>
```

### Get Notification by ID
```
GET /notifications/:id
Authorization: Bearer <token>
```

### Get Notification Statistics
```
GET /notifications/stats?userId=user_id&fromDate=2024-01-01&toDate=2024-12-31
Authorization: Bearer <token>
```

### Create Notification
```
POST /notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "notificationType": "booking_created",
  "venue": "venue_id_here",
  "recipients": [
    {
      "user": "user_id_here",
      "role": "student",
      "notificationMethod": "in_app"
    }
  ],
  "title": "New Booking Request",
  "message": "Your booking request has been submitted",
  "priority": "normal",
  "category": "info"
}
```

### Mark Notification as Read
```
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All Notifications as Read
```
PUT /notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification
```
DELETE /notifications/:id
Authorization: Bearer <token>
```

---

## Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Testing with Postman

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```

2. **Import this collection into Postman**
3. **Set environment variables:**
   - `base_url`: `http://localhost:5000/api`
   - `token`: (will be set after login)

4. **Test flow:**
   - Signup → Login → Get token → Use token for other requests











