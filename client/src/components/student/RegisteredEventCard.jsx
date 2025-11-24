import React from 'react';

const RegisteredEventCard = ({ registration = {} }) => {
  return (
    <div className="registered-event-card">
      <h4>{registration.eventName || 'Registered Event'}</h4>
    </div>
  );
};

export default RegisteredEventCard;
