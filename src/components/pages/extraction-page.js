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
        setPdfUrl(`http://134.209.231.0/${extractFilePath(data.content.pdfPath)}`)
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
    const getPageNumbers = obj => Object.keys(obj).map(page => parseInt(page.replace('page_', ''), 10));
    const tablePages = tableExtraction && Object.keys(tableExtraction).length > 0 ? getPageNumbers(tableExtraction) : [];
    const keyPages = keyValues && Object.keys(keyValues).length > 0 ? getPageNumbers(keyValues) : [];
    
    const allPages = [...tablePages, ...keyPages];
    const maxPage = allPages.length > 0 ? Math.max(...allPages) : 1; // Default to 1 if no pages found
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

  const handleExport = (event) => {
    const format = event.target.value;
    // Implement export logic based on format (csv/json)
    // You can use libraries like FileSaver.js to save files
    switch (format) {
      case 'csv_key_values':
        exportAsCSV(keyValues, 'key_values.csv');
        break;
      case 'json_key_values':
        exportAsJSON(keyValues, 'key_values.json');
        break;
      case 'csv_table':
        exportAsCSV(tableExtraction, 'table_data.csv');
        break;
      case 'json_table':
        exportAsJSON(tableExtraction, 'table_data.json');
        break;
      default:
        break;
    }
  };

  const exportAsCSV = (data, fileName) => {
    // Sample implementation using Blob and FileSaver.js for CSV export
    const csvData = (fileName === 'key_values.csv') ? convertKeysToCSV(data) : convertTableToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
  };

  const exportAsJSON = (data, fileName) => {
    // Sample implementation using Blob and FileSaver.js for JSON export
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    saveAs(blob, fileName);
  };

  const convertTableToCSV = (data) => {
    let csv = '';

    // Iterate over each page in the data
    Object.keys(data).forEach(page => {
      const pageName = `Page ${page.replace('page_', '')}`;
      const tables = data[page];

      // Iterate over each table in the page
      Object.keys(tables).forEach(tableName => {
        const tableData = tables[tableName];

        // Add table name as row in CSV
        csv += `${pageName}\n${tableName}\n`;

        // Determine columns from first object's keys
        const columns = Object.keys(tableData[0]);

        // Create header row with column names
        csv += `${columns.join(',')}\n`;

        // Iterate over each object in the table data
        tableData.forEach(row => {
          // Create array of values based on columns order
          const values = columns.map(column => {
            let value = row[column];
            if (typeof value === 'string' && value.includes(',')) {
              value = `"${value}"`; // Quote values containing commas
            }
            return value;
          });

          // Join values into CSV row
          csv += `${values.join(',')}\n`;
        });

        // Add a blank line after each table
        csv += '\n';
      });

      // Add a blank line after each page
      csv += '\n';
    });

    return csv;
  };

  const convertKeysToCSV = (data) => {
    let csv = '';

    // Iterate over each page in the data
    Object.keys(data).forEach(page => {
      csv += `Page ${page.replace('page_', '')}\n`;
  
      // Iterate over each array of key-value pairs in the page
      data[page].forEach(pair => {
        const quotedPair = pair.map(value => {
          if (typeof value === 'string' && value.includes(',')) {
            // Quote the value if it contains commas
            return `"${value}"`;
          }
          return value;
        });
        csv += `${quotedPair.join(',')}\n`;
      });
  
      // Add a blank line after each page
      csv += '\n';
    });
  
    return csv;
  };

  const saveAs = (blob, fileName) => {
    // Using FileSaver.js to save blob as file
    const { saveAs } = require('file-saver');
    saveAs(blob, fileName);
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
            <div style={{ marginLeft: '10px' }}>
              <div className="dropdown">
                <select className='per-page-dropdown export-dropdown' onChange={handleExport}>
                  <option value={""}>Export</option>
                  <option value="csv_key_values">Export Key Values as CSV</option>
                  <option value="json_key_values">Export Key Values as JSON</option>
                  <option value="csv_table">Export Table as CSV</option>
                  <option value="json_table">Export Table as JSON</option>
                </select>
              </div>
            </div>
          </div>
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
