# KEC Events - Admin Guide

## Admin Access

To access the admin dashboard, use the following credentials:

- **Username**: `ADMIN_KEC`
- **Password**: `ADMIN_KEC`

## Admin Dashboard Features

### 1. Overview Statistics
The admin dashboard displays key metrics:
- Total number of clubs
- Total events across all clubs
- Total members across all clubs
- Number of active clubs

### 2. Club Management

#### Creating a New Club
1. Click the "Create New Club" button
2. Fill in the required information:
   - **Club Name**: e.g., "CSE Club"
   - **Email**: e.g., "CLUB_CSE" (this will be the login ID)
   - **Password**: Set a secure password for the club
   - **Department**: Select from the dropdown
   - **Description**: Optional description of the club
3. Click "Create Club"

#### Editing a Club
1. Find the club in the table
2. Click the edit icon (pencil) next to the club
3. Modify the information as needed
4. Click "Update Club"

#### Deleting a Club
1. Find the club in the table
2. Click the delete icon (trash) next to the club
3. Confirm the deletion

#### Viewing Club Credentials
- Club credentials are hidden by default for security
- Click the eye icon next to the password to show/hide it
- This allows admins to see login credentials when needed

### 3. Search and Filter
- **Search**: Use the search bar to find clubs by name or email
- **Filter**: Use the department dropdown to filter clubs by department

### 4. Club Information Displayed
For each club, the dashboard shows:
- Club name and email
- Department affiliation
- Login credentials (username and password)
- Member count and event count
- Status (active/inactive)
- Action buttons for edit and delete

## Security Notes

- Admin credentials are hardcoded for demonstration purposes
- In production, implement proper authentication with secure password hashing
- Consider implementing role-based access control for different admin levels
- Club passwords should be securely stored and transmitted

## Technical Implementation

The admin functionality is implemented using:
- React with conditional rendering
- Local storage for session management
- Tailwind CSS for styling
- Lucide React for icons
- Protected routes for admin access

## Future Enhancements

Potential improvements for the admin dashboard:
- User management (students, faculty)
- Event approval workflow
- Analytics and reporting
- Bulk operations for clubs
- Audit logs for admin actions
- Email notifications for club creation
- Advanced filtering and sorting options
