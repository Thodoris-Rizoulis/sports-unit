# Quickstart: Connections Feature

**Feature**: Add a connections feature to the sports social platform
**Date**: November 30, 2025

## Overview

The connections feature allows users to build their professional network by sending connection requests, accepting/declining requests, and managing their connections list - similar to LinkedIn.

## For Users

### Sending a Connection Request

1. **From Profile Page**: Visit any user's profile page
2. **Click "Connect"**: Look for the connection button in the profile header
3. **Confirm Request**: A modal may appear to confirm sending the request
4. **Status Update**: Button changes to "Request Sent"

### Managing Incoming Requests

1. **Access Requests**: Click the notifications/connections icon in the header
2. **View Requests**: See all pending requests in the modal/sidebar
3. **Respond**: Click "Accept" or "Decline" for each request
4. **Real-time Updates**: Changes appear immediately without page refresh

### Viewing Your Network

1. **Connections Page**: Navigate to your dashboard or profile connections section
2. **Browse Connections**: See paginated list of connected users
3. **Connection Details**: Click on any connection to view their profile
4. **Remove Connections**: Use the "Remove" option if needed

### Connection Status in Search

1. **Search Users**: Use the global search in the header
2. **Status Indicators**:
   - **"Connected"**: Already connected users
   - **"Request Sent"**: Users you've sent requests to
   - **"Request Received"**: Users who sent you requests
   - **No status**: Users you can connect with

## For Developers

### Database Setup

Run the database migration to create the connections table:

```bash
# Apply the new migration
npm run db:migrate

# (Or however migrations are run in this project)
```

### API Integration

All connection operations use standard REST endpoints under `/api/connections`:

```typescript
// Send a request
const response = await fetch("/api/connections/request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ recipientId: 123 }),
});

// Check status
const status = await fetch("/api/connections/status/123");

// Get connections
const connections = await fetch("/api/connections?limit=20&offset=0");
```

### Component Usage

Import and use the connection components:

```tsx
import { ConnectionButton } from "@/components/connections/ConnectionButton";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

// In a profile component
const { data: status } = useConnectionStatus(targetUserId);

<ConnectionButton targetUserId={targetUserId} currentStatus={status} />;
```

### Real-time Updates

The feature uses WebSocket connections with polling fallback. No additional setup required - updates happen automatically when connection status changes.

## Testing the Feature

### Manual Testing Checklist

- [ ] Send connection request to another user
- [ ] Accept a connection request
- [ ] Decline a connection request
- [ ] View connections list with pagination
- [ ] Remove an existing connection
- [ ] Check connection status appears in search results
- [ ] Verify real-time updates work
- [ ] Test on mobile devices
- [ ] Test error scenarios (self-connection, duplicate requests)

### Automated Testing

Run the test suite:

```bash
npm test -- --testPathPattern=connections
```

## Troubleshooting

### Common Issues

**Connection button not showing**: Ensure user is authenticated and not viewing their own profile.

**Requests not appearing**: Check that the user has permission to view/manage connections.

**Real-time updates not working**: Verify WebSocket connection or fallback to polling.

**Search status incorrect**: Clear cache and check database connection status.

### Support

For issues, check:

1. Browser console for JavaScript errors
2. Network tab for failed API requests
3. Database logs for query errors
4. Server logs for authentication issues

## Next Steps

After setup, users can immediately start building their network. Monitor usage metrics and user feedback to identify areas for enhancement.
