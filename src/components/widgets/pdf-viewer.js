// PDFViewer.js
import React from 'react';

const PDFViewer = ({ pdfUrl }) => {
  return (
    <iframe title='1' src={pdfUrl} width="50%" height="720px" style={{border: 'none', marginLeft: '20px', marginRight: '30px'}}></iframe>
  );
};

export default PDFViewer;
