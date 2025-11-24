import React from 'react';

const ClubCard = ({ club = {} }) => {
  return (
    <div className="club-card">
      <h4>{club.name || 'Club Name'}</h4>
    </div>
  );
};

export default ClubCard;
