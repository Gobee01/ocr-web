import React, { useState, useEffect } from 'react';
import {useParams} from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import PDFViewer from '../widgets/pdf-viewer';
import TabHeader from '../widgets/tab-header';
import ContentSwitcher from '../widgets/content-switcher';
import DocumentDetails from '../widgets/document-details';
import { toggleLoader } from "../../actions/setting";
import { extractFilePath } from "../../utils/utils";

const ExtractionPage = () => {
  const {documentId} = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('keyValues');
  const [pdfUrl, setPdfUrl] = useState("");
  const [docData, setDocData] = useState();

  const fetchDocument = async () => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/document/${documentId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setPdfUrl(extractFilePath(data.content.pdfPath))
        setDocData(data.content)
      } else {
        toast.error("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching document data:", error);
      toast.error("Error fetching document data.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  useEffect(() => {
    fetchDocument(); 
  }, [documentId]);

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