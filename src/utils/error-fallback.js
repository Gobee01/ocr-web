import React from "react";
import errormsg from '../../src/images/errormsg.gif';

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert" className="error-container">
      <img className="error-image" src={errormsg} alt="errormsg"/>
      <div className="dashboard-card-title" style={{fontSize: "24px"}}>
        <p>Oops...</p>
      </div>
      <div className="error-results-text">
        <p>We're sorry, it seems like something unexpected has occurred. </p>
      </div>
      {/* <pre>{error.message}</pre> */}
      <div className="btn-sa-primary" style={{height: "0px"}}>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    </div>
  )
}

export default ErrorFallback