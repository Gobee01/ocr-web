import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import FeatherIcon from "feather-icons-react";
import PDFViewer from '../widgets/pdf-viewer';
import TabHeader from '../widgets/tab-header';
import ContentSwitcher from '../widgets/content-switcher';
import DocumentDetails from '../widgets/document-details';
import { toggleLoader } from "../../actions/setting";
import { extractFilePath } from "../../utils/utils";

const ExtractionPage = () => {
  const { documentId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('keyValues');
  const [pdfUrl, setPdfUrl] = useState("");
  const [docData, setDocData] = useState();
  const [selectedPage, setSelectedPage] = useState(1); // State for page selection

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

  const handlePageChange = (event) => {
    setSelectedPage(event.target.value);
  };

  return (
    <div>
    <button
      onClick={() => history.push("/")}
      className="sa-table-btn-secondary back-button"
    >
      <FeatherIcon
        icon={"arrow-left"} className={"upload-icon"} />
      <span className="delete-text">{"Back"}</span>
    </button>
    <button
      onClick={() => {}}
      className="sa-table-btn-secondary sa-table-float-right save-button"
    >
      <span className="delete-text">{"Save"}</span>
    </button>
    <div style={{ display: 'flex', height: '90vh', marginTop: '10px' }}>
      <PDFViewer pdfUrl={pdfUrl} />
      <div style={{ flexGrow: 1, width: '800px', marginRight: '10px' }}>
        <DocumentDetails />
        <div style={{ marginBottom: '10px', display: 'flex' }}>
          <label className='dropdown-label'>Page Number </label>
          <select className='per-page-dropdown' value={selectedPage} onChange={handlePageChange}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <ContentSwitcher activeTab={activeTab} />
      </div>
    </div>
    </div>
  );
};

export default ExtractionPage;
