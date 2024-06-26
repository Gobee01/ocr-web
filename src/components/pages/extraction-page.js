import React, { useState } from 'react';
import PDFViewer from '../widgets/pdf-viewer';
import TabHeader from '../widgets/tab-header';
import ContentSwitcher from '../widgets/content-switcher';
import DocumentDetails from '../widgets/document-details';

const ExtractionPage = () => {
  const [activeTab, setActiveTab] = useState('keyValues');
  const pdfUrl = "/uploaded-files/FORM-MAQ-012.pdf"; // Replace with your PDF URL

  return (
    <div style={{display: 'flex', height: '90vh', marginTop: '20px'}}>
      <PDFViewer pdfUrl={pdfUrl} />
      <div style={{flexGrow: 1, width: '800px', marginRight: '10px'}}>
        <DocumentDetails />
        <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <ContentSwitcher activeTab={activeTab} />
      </div>
    </div>
  );
};

export default ExtractionPage;