import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import FeatherIcon from "feather-icons-react";
import Preview from "../widgets/preview";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {useDispatch} from "react-redux";
import { toggleLoader } from "../../actions/setting";
import { EXTRACTION_STATUS } from "../../utils/enum";
import { formatDisplayEnumValue, extractFilePath, formatDateTime } from "../../utils/utils";

const UploadDocument = () => {
  const [docList, setDocList] = useState([]);
  const [filteredList, setFilteredList] = useState(docList);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("/uploaded-files/FORM-MAQ-012.pdf");

  const dispatch = useDispatch();

  useEffect(() => {
    const filtered = docList.filter(user =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "" || user.status === statusFilter)
    );
    setFilteredList(filtered);
  }, [searchTerm, statusFilter, docList]);

  const fetchDocumentPage = async (pageIndex = 0, pageSize = 10) => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/documentPage?pageIndex=${pageIndex}&pageSize=${pageSize}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setDocList(data.content.content); 

      } else {
        toast.error("Failed to fetch documents.");
      }
      dispatch(toggleLoader(false));
    } catch (error) {
      console.error("Error fetching document page:", error);
      dispatch(toggleLoader(false));
    }
  };

  useEffect(() => {
    fetchDocumentPage();
  }, [refresh]);

  const handleCheckboxChange = (documentId) => {
    const currentIndex = selectedRows.indexOf(documentId);
    const newSelected = [...selectedRows];

    if (currentIndex === -1) {
      newSelected.push(documentId);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedRows(newSelected);
  };

  const handleDelete = () => {
    const updatedDocList = docList.filter(user =>!selectedRows.includes(user.documentId));
    setDocList(updatedDocList);
    setSelectedRows([]);
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf'; // Accept only PDF files
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        console.log("No file selected");
        return;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        await uploadFile(formData);

      } catch (error) {
        console.error("Failed to upload file:", error);
      }
    };
    
    input.click(); 
  };

  const uploadFile = async (formData) => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/upload`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        let filePath = data.filePath.replace(/\\/g, '/');  
  
        const documentData = {
          name: data.fileName,
          pdfPath: filePath,
          status: EXTRACTION_STATUS.IN_QUEUE,
        };
        await handleAddDocument(documentData);
        
      } else {
        toast.error("File upload failed.");
      }
      dispatch(toggleLoader(false));
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("File upload failed.");
      dispatch(toggleLoader(false));
    }
  };

  const handleAddDocument = async (documentData) => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(documentData),
      });
  
      if (response.ok) {
        const data = await response.json();
        setRefresh(!refresh)
        toast.success("Document added successfully.");

      } else {
        toast.error("Failed to add document.");
      }
      dispatch(toggleLoader(false));
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to add document.");
      dispatch(toggleLoader(false));
    }
  };

  return (
    <div>
      <Container className={'pb-2'}>
       <div className="p-a-16">
       <span>
        <span className="sa-table-btn-mute sa-search-align sa-table-float-left">
          <input
            className={'sa-table-search font-14'}
            type="text"
            placeholder={"Search"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FeatherIcon className={"sa-search-icon"} icon={"search"} width={'16px'}/>
        </span>
        <select
          className="sa-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value={""}>{"Show All"}</option>
          <option value="In Queue">{"In Queue"}</option>
          <option value="Extraction in Progress">{"Extraction in Progress"}</option>
          <option value="Extraction Failed">{"Extraction Failed"}</option>
          <option value="Validation Completed">{"Validation Completed"}</option>
          <option value="Validation Pending">{"Validation Pending"}</option>
        </select>
        </span>

        <div
          className="pull-right">
          <button
            onClick={handleUpload}
            className="sa-table-btn-secondary sa-table-float-right">
            <FeatherIcon
              icon={"upload"} className={"delete-icon"}/> 
              <span className="delete-text">{"Upload"}</span>
          </button>
        </div>

       <div id="main3" className="sa-table-container calc-height">
        <table className="table table-borderless sa-table-width">
          <thead>
            <tr>
              <th className={"sa-table-head-sticky"}>Document ID</th>
              <th className={"sa-table-head-sticky"}>Document</th>
              <th className={"sa-table-head-sticky"}>Date Uploaded</th>
              <th className={"sa-table-head-sticky"}>Preview</th>
              <th className={"sa-table-head-sticky"}>Status</th>
              <th className={"sa-table-head-sticky"}>
                <button disabled={selectedRows.length === 0} onClick={handleDelete} 
                        className={`delete-button ${selectedRows.length > 0? '' : 'disabled'}`}>
                  <div className="delete-button-content">
                    <FeatherIcon icon="trash" className={"delete-icon"} /> 
                    <span className="delete-text">Delete</span>
                  </div>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((user, index) => (
              <tr key={index} className="sa-table-row">
                <td className={'sa-table-data'}>{user.documentId}</td>
                <td className={'sa-table-data'}>{user.name}</td>
                <td className={'sa-table-data'}>{formatDateTime(user.uploadedDate)}</td>
                <td className={'sa-table-data'}>
                 <div className="content-wrapper" onClick={() => {
                  setShowPreview(true);
                  setPdfUrl(extractFilePath(user.pdfPath))
                 }}>
                  <FeatherIcon icon="file" className="pdf-icon"/>
                 </div>
                </td>
                <td className={'sa-table-data'}>
                  <div className="content-wrapper">
                  {user.status === EXTRACTION_STATUS.EXTRACTION_IN_PROGRESS && <div className="extraction-progress">{formatDisplayEnumValue(user.status)}</div>}
                  {user.status === EXTRACTION_STATUS.EXTRACTION_FAILED && <div className="extraction-failed">{formatDisplayEnumValue(user.status)}</div>}
                  {user.status === EXTRACTION_STATUS.VALIDATION_COMPLETE && <div className="validation-completed">{formatDisplayEnumValue(user.status)}</div>}
                  {user.status === EXTRACTION_STATUS.VALIDATION_PENDING && <div className="validation-pending">{formatDisplayEnumValue(user.status)}</div>}
                  {user.status === EXTRACTION_STATUS.IN_QUEUE && <div className="queue">{formatDisplayEnumValue(user.status)}</div>}
                  </div>
                </td>
                <td className={'sa-table-data'}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(user.documentId)}
                      onChange={() => handleCheckboxChange(user.documentId)}
                    />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
       </div>
      </Container>

      {showPreview && <Preview onClose={() => {
            setShowPreview(false)
          }} pdfUrl={pdfUrl} />}

    </div>
  );
};

export default UploadDocument;
