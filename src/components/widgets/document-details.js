import React from 'react';

const DocumentDetails = () => {

  const handleChange = (event) => {
    // console.log(event.target.value); 
  };

  return (
    <div className="extract-popup-content">
      <div className="col-md-6">
        <div className="m-b-16">
          <label className='label'>Document Name</label>
          <input onChange={handleChange} type="text" className="form-control" name="documentName" />
        </div>
      </div>
      <div className="col-md-6">
        <div className="m-b-16">
          <label className='label'>Number of Pages</label>
          <input onChange={handleChange} type="number" className="form-control" name="numberOfPages" />
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;