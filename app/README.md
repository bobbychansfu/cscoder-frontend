 # Home Page

## Description
The main landing page that handles user authentication and navigation.

## Components
- **MainPage**: Main component that renders the landing page
- **Authentication handler**: Processes CAS login tickets from SFU authentication *(check CAS documentation for deeper understanding)*
- **Navigation buttons**: Login and guest *(not working)* access options

## Key Features
- **SFU CAS Integration**: Handles authentication tickets and redirects users after login
- **Local Storage Management**: Retrieves and displays user data from localStorage *(cookie)*

## User Flow
1. User lands on the page
2. If CAS ticket is present, processes authentication
3. Shows login button for SFU authentication
4. Redirects authenticated users to `contests` page

## Suggested features
- Make the page less static
- Add examples of problems and some statistics