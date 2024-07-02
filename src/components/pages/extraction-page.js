import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import FeatherIcon from "feather-icons-react";
import PDFViewer from '../widgets/pdf-viewer';
import TabHeader from '../widgets/tab-header';
import ContentSwitcher from '../widgets/content-switcher';
import { toggleLoader } from "../../actions/setting";
import { extractFilePath } from "../../utils/utils";

const ExtractionPage = () => {
  const { documentId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('keyValues');
  const [pdfUrl, setPdfUrl] = useState("");
  const [docData, setDocData] = useState();
  const [extractionData, setExtractionData] = useState();
  const [tableExtraction, setTableExtraction] = useState({});
  const [keyValues, setKeyValues] = useState({});
  const [extractionId, setExtractionId] = useState("");
  const [selectedPage, setSelectedPage] = useState(1);
  const [numPages, setNumPages] = useState(1);

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

  const fetchExtraction = async () => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/extraction/${docData.documentId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setExtractionData(data.content);
        setTableExtraction(data.content.tableExtraction || {});
        setKeyValues(data.content.keyValues || {});
        calculateNumPages(data.content.tableExtraction, data.content.keyValues);
        setExtractionId(data.content.id)
      } else {
        toast.error("Failed to fetch extraction data.");
      }
    } catch (error) {
      console.error("Error fetching extraction data:", error);
      toast.error("Error fetching extraction data.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  useEffect(() => {
    if (!docData) {
      return
    }

    fetchExtraction();
  }, [docData]);

  const calculateNumPages = (tableExtraction, keyValues) => {
    const tablePages = Object.keys(tableExtraction).map(page => parseInt(page.replace('page_', '')));
    const keyPages = Object.keys(keyValues).map(page => parseInt(page.replace('page_', '')));
    const allPages = [...tablePages, ...keyPages];
    const maxPage = Math.max(...allPages, 1); // Default to 1 if no pages found
    setNumPages(maxPage);
    if (selectedPage > maxPage) {
      setSelectedPage(maxPage);
    }
  };

  const handlePageChange = (event) => {
    setSelectedPage(parseInt(event.target.value));
  };

  const handleDocumentNameChange = (event) => {
    const newName = event.target.value;
    setExtractionData(prevData => ({ ...prevData, documentName: newName }));
  };

  useEffect(() => {
    if (!keyValues && !tableExtraction) {
      return
    }

    // Update extractionData whenever keyValues or tableExtraction change
    setExtractionData(prevData => ({
      ...prevData,
      keyValues,
      tableExtraction,
    }));
  }, [keyValues, tableExtraction]);

  const handleSave = async () => {
    dispatch(toggleLoader(true));
    delete extractionData.id
    
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/extraction/${extractionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(extractionData)
      });

      if (response.ok) {
        toast.success("Data saved successfully.");
      } else {
        toast.error("Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving extraction data:", error);
      toast.error("Error saving extraction data.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  return (
    <div>
      <button
        onClick={() => history.push("/")}
        className="sa-table-btn-secondary back-button"
      >
        <FeatherIcon icon={"arrow-left"} className={"upload-icon"} />
        <span className="delete-text">{"Back"}</span>
      </button>
      <button
        onClick={handleSave}
        className="sa-table-btn-secondary sa-table-float-right save-button"
      >
        <span className="delete-text">{"Save"}</span>
      </button>
      <div style={{ display: 'flex', height: '86vh', marginTop: '10px' }}>
        <PDFViewer pdfUrl={pdfUrl} />
        <div style={{ flexGrow: 1, width: '800px', marginRight: '10px' }}>
          <div className="extract-popup-content">
            <div className="col-md-6">
              <div className="m-b-16">
                <label className='label'>Document Name</label>
                <input 
                  onChange={handleDocumentNameChange} 
                  type="text" 
                  className="form-control" 
                  name="documentName" 
                  value={extractionData?.documentName || ''} 
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="m-b-16">
                <label className='label'>Number of Pages</label>
                <input 
                  disabled 
                  type="number" 
                  className="form-control" 
                  name="numberOfPages" 
                  value={numPages} 
                />
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '10px', display: 'flex' }}>
            <label className='dropdown-label'>Page Number </label>
            <select className='per-page-dropdown' value={selectedPage} onChange={handlePageChange}>
              {[...Array(numPages).keys()].map(pageNum => (
                <option key={pageNum + 1} value={pageNum + 1}>{pageNum + 1}</option>
              ))}
            </select>
          </div>
          <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
          <ContentSwitcher 
            activeTab={activeTab}
            tableExtraction={tableExtraction}
            setTableExtraction={setTableExtraction}
            keyValues={keyValues}
            setKeyValues={setKeyValues}
            selectedPage={selectedPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ExtractionPage;
