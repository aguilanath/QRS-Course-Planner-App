"use client"
import React from 'react';
import MediaCarousel from './MediaCarousel';

const AppPopup = ({ onBack, onContinue, data }) => {

  const truncatedDescription = data.description.length > 950 ? data.description.substring(0, 950) + "..." : data.description;

  return (
    <div className="popup-content">
      {Object.keys(data).length > 0 ? (
        <div>
          <div className="popup-header">
            <button className="popup-button pleft" onClick={onBack}>Close</button>
            <h2 className="popup-title">{data["title"]}</h2>
            <button className="popup-button pright" onClick={onContinue}>Continue To App</button>
          </div>
          <MediaCarousel media={data["media"]} />
          {truncatedDescription}
        </div>
      ) : (
        <p className="loading-container">Loading...</p>
      )}
    </div>
  );
};

export default AppPopup;