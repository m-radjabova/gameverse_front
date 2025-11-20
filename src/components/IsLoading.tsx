import React from 'react';
import { 
  Folder2, 
  GraphUp, 
  Tools, 
  FileText,
  Clock,
  ArrowRepeat
} from 'react-bootstrap-icons';

const IsLoading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-background"></div>
      
      <div className="loading-content">
        <div className="pulsating-circle">
          <div className="circle-core">
            <ArrowRepeat className="spinning-icon" />
          </div>
          <div className="pulse-ring ring-1"></div>
          <div className="pulse-ring ring-2"></div>
          <div className="pulse-ring ring-3"></div>
        </div>
        
        <div className="loading-text">
          <h3 className="loading-title">Loading Projects</h3>
          <p className="loading-subtitle">Preparing your workspace...</p>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <div className="progress-dots">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="progress-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="floating-elements">
          <div className="floating-item item-1">
            <Folder2 className="floating-icon" />
          </div>
          <div className="floating-item item-2">
            <GraphUp className="floating-icon" />
          </div>
          <div className="floating-item item-3">
            <Tools className="floating-icon" />
          </div>
          <div className="floating-item item-4">
            <FileText className="floating-icon" />
          </div>
        </div>

        <div className="loading-status">
          <Clock className="status-icon" />
          <span>Loading components...</span>
        </div>
      </div>
    </div>
  );
};

export default IsLoading;