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
  const [tableExtraction, setTableExtraction] = useState({});
  const [keyValues, setKeyValues] = useState({});
  const [tableExtractionData, setTableExtractionData] = useState({});
  const [keyValueData, setKeyValueData] = useState({});
  const [extractionId, setExtractionId] = useState("");
  const [keyValueId, setKeyValueId] = useState("");
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
        setPdfUrl(`http://143.198.186.210:81/${extractFilePath(data.content.pdfPath)}`)
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

  const fetchTableExtraction = async () => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/extraction/${docData.documentId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setTableExtractionData(data.content || {})
        setTableExtraction(data.content.updatedExtraction || {});
        setExtractionId(data.content.id);
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

  const fetchKeyValues = async () => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/keyValue/${docData.documentId}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setKeyValueData(data.content || {});
        setKeyValues(data.content.updatedKeyValueExtraction || {});
        setKeyValueId(data.content.id)
      } else {
        toast.error("Failed to fetch key values data.");
      }
    } catch (error) {
      console.error("Error fetching key values data:", error);
      toast.error("Error fetching key values data.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  useEffect(() => {
    if (docData) {
      fetchTableExtraction();
      fetchKeyValues();
    }
  }, [docData]);

  const calculateNumPages = (tableExtraction, keyValues) => {
    const getPageNumbers = obj => Object.keys(obj).map(page => parseInt(page.replace('page_', ''), 10));
    const tablePages = tableExtraction && Object.keys(tableExtraction).length > 0 ? getPageNumbers(tableExtraction) : [];
    const keyPages = keyValues && Object.keys(keyValues).length > 0 ? getPageNumbers(keyValues) : [];
    
    const allPages = [...tablePages, ...keyPages];
    const maxPage = allPages.length > 0 ? Math.max(...allPages) : 1;
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
    setKeyValueData(prevData => ({ ...prevData, documentName: newName }));
  };

  useEffect(() => {
    if (!keyValues && !tableExtraction) {
      return;
    }

    calculateNumPages(tableExtraction, keyValues)
  }, [keyValues, tableExtraction]);

  const handleSave = async () => {
    dispatch(toggleLoader(true));
    try {
      await saveKeyValues();
      await saveTableExtraction();
      toast.success("Data saved successfully.");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error saving data.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  const saveKeyValues = async () => {
    setKeyValueData(prevData => ({ ...prevData, updatedKeyValueExtraction: keyValues }));
    delete keyValues.id;

    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/keyValue/${keyValueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(keyValueData)
      });

      if (!response.ok) {
        toast.error("Failed to save key values.");
      }
    } catch (error) {
      console.error("Error saving key values:", error);
      throw error;
    }
  };

  const saveTableExtraction = async () => {
    setTableExtractionData(prevData => ({ ...prevData, updatedExtraction: tableExtraction }));
    delete tableExtraction.id;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/extraction/${extractionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tableExtractionData)
      });

      if (!response.ok) {
        toast.error("Failed to save table extraction.");
      }
    } catch (error) {
      console.error("Error saving table extraction:", error);
      throw error;
    }
  };

  const handleExport = (event) => {
    const format = event.target.value;
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
    const csvData = (fileName === 'key_values.csv') ? convertKeysToCSV(data) : convertTableToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, fileName);
  };

  const exportAsJSON = (data, fileName) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    saveAs(blob, fileName);
  };

  const convertTableToCSV = (data) => {
    let csv = '';

    Object.keys(data).forEach(page => {
      const pageName = `Page ${page.replace('page_', '')}`;
      const tables = data[page];

      Object.keys(tables).forEach(tableName => {
        const tableData = tables[tableName];
        csv += `${pageName}\n${tableName}\n`;

        const columns = Object.keys(tableData[0]);
        csv += `${columns.join(',')}\n`;

        tableData.forEach(row => {
          const values = columns.map(column => {
            let value = row[column];
            if (typeof value === 'string' && value.includes(',')) {
              value = `"${value}"`;
            }
            return value;
          });
          csv += `${values.join(',')}\n`;
        });

        csv += '\n';
      });

      csv += '\n';
    });

    return csv;
  };

  const convertKeysToCSV = (data) => {
    let csv = '';

    Object.keys(data).forEach(page => {
      csv += `Page ${page.replace('page_', '')}\n`;

      data[page].forEach(pair => {
        const quotedPair = pair.map(value => {
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        });
        csv += `${quotedPair.join(',')}\n`;
      });
  
      csv += '\n';
    });

    return csv;
  };

  const saveAs = (blob, fileName) => {
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
                  value={keyValueData?.documentName || ''} 
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
