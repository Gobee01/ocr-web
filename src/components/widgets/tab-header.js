import React from 'react';

const TabHeader = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tab-header">
      <div>
        <button 
          className={`tab ${activeTab === 'keyValues'? 'active' : ''}`} 
          onClick={() => setActiveTab('keyValues')}
        >
          Key Values
        </button>
        <button 
          className={`tab ${activeTab === 'table'? 'active' : ''}`} 
          onClick={() => setActiveTab('table')}
        >
          Table
        </button>
      </div>
    </div>
  );
};

export default TabHeader;
