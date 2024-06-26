import React from 'react';
import FeatherIcon from "feather-icons-react";

const Preview = (props) => {
  return (
    <div className="sa-popup-bg ">
        <div className="sa-popup">
            <div className="pdf-modal-box-style">
                <div className="pdf-popup-header">
                    <span className={'sa-model-heading'}>{"PDF Preview"}</span>
                    <div className="sa-popup-close-icon" onClick={props.onClose}>
                        <FeatherIcon className={"sa-modal-close-icon"} icon={"x"}/>
                    </div>
                </div>
                <iframe title='1' src={props.pdfUrl} width="95%" height="630px" style={{border: 'none', marginLeft: '25px', marginRight: '20px'}}></iframe>
            </div>
        </div>
    </div>
  );
};

export default Preview;
