import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import FeatherIcon from "feather-icons-react";
import Preview from "../widgets/preview";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { toggleLoader } from "../../actions/setting";
import { EXTRACTION_STATUS } from "../../utils/enum";
import { formatDisplayEnumValue, extractFilePath, formatDateTime } from "../../utils/utils";
import Pagination from "../widgets/pagination";

const UploadDocument = () => {
  const [docList, setDocList] = useState([]);
  const [filteredList, setFilteredList] = useState(docList);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [triggerExtraction, setTriggerExtraction] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tempDocData, setTempDocData] = useState(null);
  const [extractionData, setExtractionData] = useState();

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const filtered = docList.filter(doc =>
      (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "" || doc.status === statusFilter)
    );
    setFilteredList(filtered);
  }, [searchTerm, statusFilter, docList]);

  const fetchDocumentPage = async (pageIndex = 0) => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/documentPage?pageIndex=${pageIndex}&pageSize=${itemsPerPage}`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setDocList(data.content.content);
        setTotalPages(data.content.totalPages);
      } else {
        toast.error("Failed to fetch documents.");
      }
    } catch (error) {
      console.error("Error fetching document page:", error);
      toast.error("Error fetching document page.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/allDocuments`, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        return data.content;
      } else {
        toast.error("Failed to fetch all documents.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching all documents:", error);
      toast.error("Error fetching all documents.");
      return [];
    }
  };

  const updateDocumentStatus = async (document, status) => {
    try {
      const documentData = {
        name: document.name,
        pdfPath: document.pdfPath,
        status: status,
      };
      
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/document/${document.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status for document ID: ${document.id}`);
      } else {
        const data = await response.json();
        setTempDocData(data.content)
      }
    } catch (error) {
      console.error(`Error updating status for document ID: ${document.id}`, error);
      toast.error(`Failed to update status for document: ${document.name}`);
    }
  };

  const processDocument = async (document) => {
    try {
      // Update status to EXTRACTION_IN_PROGRESS
      await updateDocumentStatus(document, EXTRACTION_STATUS.EXTRACTION_IN_PROGRESS);

      const response = await fetch(`http://134.209.231.0:82/process_pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdf_file_path: `/app/gen_OCR/${extractFilePath(document.pdfPath)}`,
          _id: document.documentId.toString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExtractionData(data.content)
        await updateDocumentStatus(document, EXTRACTION_STATUS.VALIDATION_PENDING);

      } else {
        // Update status to EXTRACTION_FAILED
        await updateDocumentStatus(document, EXTRACTION_STATUS.EXTRACTION_FAILED);
      }
    } catch (error) {
      console.error("Error processing document:", error);
      toast.error("Error processing document");
      await updateDocumentStatus(document, EXTRACTION_STATUS.EXTRACTION_FAILED);
    }
  };

  const processQueue = async () => {
    const allDocuments = await fetchAllDocuments();
    const queueDocuments = allDocuments.filter(doc => doc.status === EXTRACTION_STATUS.IN_QUEUE);

    for (const document of queueDocuments) {
      await processDocument(document);
    }
    setTriggerExtraction(false);
  };

  useEffect(() => {
    fetchDocumentPage(currentPage - 1);
  }, [refresh, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!tempDocData || filteredList.length===0) {
      return
    }

    const updatedList = filteredList.map(doc => {
      if (doc.id === tempDocData.id) {
        return tempDocData; 
      }
      return doc; 
    });
    setFilteredList(updatedList)
    setTempDocData(null)

  }, [filteredList, tempDocData]);

  useEffect(() => {
    if (!triggerExtraction) {
      return
    }

    processQueue();
  }, [triggerExtraction]);

  const handleRowClick = (document) => {
    history.push(`/extract/${document.id}`);
  };

  const handleCheckboxChange = (id) => {
    const currentIndex = selectedRows.indexOf(id);
    const newSelected = [...selectedRows];

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedRows(newSelected);
  };

  const handleDelete = async () => {
    dispatch(toggleLoader(true));
    try {
      await Promise.all(selectedRows.map(async (id) => {
        const response = await fetch(`${process.env.REACT_APP_HOST}/api/document/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to delete document with ID: ${id}`);
        }
      }));
      setSelectedRows([]);
      setRefresh(!refresh);
      toast.success("Documents deleted successfully.");
    } catch (error) {
      console.error("Error deleting documents:", error);
      toast.error("Failed to delete some documents.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  const handleDeleteClick = () => {
    confirmAlert({
      title: 'Confirmation to delete',
      message: 'Are you sure you want to delete the selected documents?',
      buttons: [
        {
          label: 'Yes',
          onClick: handleDelete,
        },
        {
          label: 'No',
          onClick: () => {},
        },
      ],
    });
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
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
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/uploadVM`, {
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
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("File upload failed.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  const handleAddDocument = async (documentData) => {
    dispatch(toggleLoader(true));
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST}/api/document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        setRefresh(!refresh);
        setTriggerExtraction(true);
        toast.success("Document added successfully.");
      } else {
        toast.error("Failed to add document.");
      }
    } catch (error) {
      console.error("Error adding document:", error);
      toast.error("Failed to add document.");
    } finally {
      dispatch(toggleLoader(false));
    }
  };

  const handlePerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
              <FeatherIcon className={"sa-search-icon"} icon={"search"} width={'16px'} />
            </span>
            <select
              className="sa-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value={""}>{"Show All"}</option>
              <option value={EXTRACTION_STATUS.IN_QUEUE}>{"In Queue"}</option>
              <option value={EXTRACTION_STATUS.EXTRACTION_IN_PROGRESS}>{"Extraction in Progress"}</option>
              <option value={EXTRACTION_STATUS.EXTRACTION_FAILED}>{"Extraction Failed"}</option>
              <option value={EXTRACTION_STATUS.VALIDATION_COMPLETED}>{"Validation Completed"}</option>
              <option value={EXTRACTION_STATUS.VALIDATION_PENDING}>{"Validation Pending"}</option>
            </select>
          </span>

          <div className="pull-right">
            <button
              onClick={handleUpload}
              className="sa-table-btn-secondary sa-table-float-right"
            >
              <FeatherIcon icon={"upload"} className={"delete-icon"} />
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
                    <button disabled={selectedRows.length === 0} onClick={handleDeleteClick}
                      className={`delete-button ${selectedRows.length > 0 ? '' : 'disabled'}`}>
                      <div className="delete-button-content">
                        <FeatherIcon icon="trash" className={"delete-icon"} />
                        <span className="delete-text">Delete</span>
                      </div>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((doc, index) => (
                  <tr key={index} className="sa-table-row" onClick={() => handleRowClick(doc)}>
                    <td className={'sa-table-data'}>{doc.documentId}</td>
                    <td className={'sa-table-data'}>{doc.name}</td>
                    <td className={'sa-table-data'}>{formatDateTime(doc.uploadedDate)}</td>
                    <td className={'sa-table-data'}>
                      <div className="content-wrapper" onClick={(event) => {
                        event.stopPropagation();
                        setShowPreview(true);
                        setPdfUrl(`http://134.209.231.0/${extractFilePath(doc.pdfPath)}`);
                      }}>
                        <FeatherIcon icon="file" className="pdf-icon" />
                      </div>
                    </td>
                    <td className={'sa-table-data'}>
                      <div className="content-wrapper">
                        {doc.status === EXTRACTION_STATUS.EXTRACTION_IN_PROGRESS && <div className="extraction-progress">{formatDisplayEnumValue(doc.status)}</div>}
                        {doc.status === EXTRACTION_STATUS.EXTRACTION_FAILED && <div className="extraction-failed">{formatDisplayEnumValue(doc.status)}</div>}
                        {doc.status === EXTRACTION_STATUS.VALIDATION_COMPLETED && <div className="validation-completed">{formatDisplayEnumValue(doc.status)}</div>}
                        {doc.status === EXTRACTION_STATUS.VALIDATION_PENDING && <div className="validation-pending">{formatDisplayEnumValue(doc.status)}</div>}
                        {doc.status === EXTRACTION_STATUS.IN_QUEUE && <div className="queue">{formatDisplayEnumValue(doc.status)}</div>}
                      </div>
                    </td>
                    <td className={'sa-table-data'}>
                      <input onClick={(event) => event.stopPropagation()}
                        type="checkbox"
                        checked={selectedRows.includes(doc.id)}
                        onChange={() => handleCheckboxChange(doc.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sa-pagination-container">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              value={itemsPerPage}
              onChange={handlePerPageChange}
            />
          </div>
        </div>
      </Container>

      {showPreview && <Preview onClose={() => setShowPreview(false)} pdfUrl={pdfUrl} />}
    </div>
  );
};

export default UploadDocument;
