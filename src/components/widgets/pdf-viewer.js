// PDFViewer.js
import React from 'react';

const PDFViewer = ({ pdfUrl }) => {
  return (
    <iframe title='1' src={pdfUrl} width="50%" height="95%" style={{border: 'none', marginLeft: '20px', marginRight: '25px'}}></iframe>
  );
};

export default PDFViewer;
