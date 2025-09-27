import React from 'react';
// ...existing code...

const badgeStyles = {
  free: {
    background: '#22c55e', // green
    color: '#fff',
    borderRadius: '16px',
    padding: '2px 12px',
    fontWeight: 600,
    fontSize: '0.95rem',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  technical: {
    background: '#e0e7ff', // light blue
    color: '#2563eb', // blue text
    borderRadius: '12px',
    padding: '4px 14px',
    fontWeight: 500,
    fontSize: '0.95rem',
    marginRight: 8,
  },
  cultural: {
    background: '#f1f5f9', // light gray
    color: '#0f172a', // dark text
    borderRadius: '12px',
    padding: '4px 14px',
    fontWeight: 500,
    fontSize: '0.95rem',
    marginRight: 8,
  },
  viewDetails: {
    background: '#2563eb', // blue
    color: '#fff',
    borderRadius: '8px',
    padding: '8px 20px',
    fontWeight: 600,
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
  }
};

function EventCard({ event }) {
  // ...existing code...
  return (
    <div className="event-card" style={{ position: 'relative', borderRadius: 20, boxShadow: '0 2px 8px #e5e7eb' }}>
      {/* ...existing code... */}
      {event.isFree && <span style={badgeStyles.free}>Free</span>}
      {/* ...existing code... */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {event.type === 'Technical' && <span style={badgeStyles.technical}>Technical</span>}
        {event.type === 'Cultural' && <span style={badgeStyles.cultural}>Cultural</span>}
        <button style={badgeStyles.viewDetails}>View Details</button>
      </div>
    </div>
  );
}

export default EventCard;