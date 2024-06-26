import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import FeatherIcon from "feather-icons-react";

const UploadDocument = () => {
  const [userList, setUserList] = useState([
    { documentID: "1", document: "FA623778.pdf", date: "Jun 5, 2024 6:16 PM", status: "Extraction in Progress" },
    { documentID: "2", document: "FA623779.pdf", date: "Jun 5, 2024 6:16 PM", status: "Validation Pending" },
    { documentID: "3", document: "FA623787.pdf", date: "Jun 5, 2024 6:16 PM", status: "Extraction Failed" },
    { documentID: "4", document: "FA623945.pdf", date: "Jun 5, 2024 6:16 PM", status: "Validation Completed" },
    { documentID: "5", document: "FA623345.pdf", date: "Jun 5, 2024 6:16 PM", status: "In Queue" },
    // Add more data as needed
  ]);
  const [filteredList, setFilteredList] = useState(userList);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    const filtered = userList.filter(user =>
      (user.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.document.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "" || user.status === statusFilter)
    );
    setFilteredList(filtered);
  }, [searchTerm, statusFilter, userList]);

  const handleCheckboxChange = (documentID) => {
    const currentIndex = selectedRows.indexOf(documentID);
    const newSelected = [...selectedRows];

    if (currentIndex === -1) {
      newSelected.push(documentID);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedRows(newSelected);
  };

  const handleDelete = () => {
    const updatedUserList = userList.filter(user =>!selectedRows.includes(user.documentID));
    setUserList(updatedUserList);
    setSelectedRows([]);
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
                <td className={'sa-table-data'}>{user.documentID}</td>
                <td className={'sa-table-data'}>{user.document}</td>
                <td className={'sa-table-data'}>{user.date}</td>
                <td className={'sa-table-data'}>
                 <div className="content-wrapper">
                 <FeatherIcon icon="file" className="pdf-icon"/>
                 </div>
                </td>
                <td className={'sa-table-data'}>
                  <div className="content-wrapper">
                  {user.status === "Extraction in Progress" && <div className="extraction-progress">{user.status}</div>}
                  {user.status === "Extraction Failed" && <div className="extraction-failed">{user.status}</div>}
                  {user.status === "Validation Completed" && <div className="validation-completed">{user.status}</div>}
                  {user.status === "Validation Pending" && <div className="validation-pending">{user.status}</div>}
                  {user.status === "In Queue" && <div className="queue">{user.status}</div>}
                  </div>
                </td>
                <td className={'sa-table-data'}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(user.documentID)}
                      onChange={() => handleCheckboxChange(user.documentID)}
                    />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
       </div>
      </Container>
    </div>
  );
};

export default UploadDocument;
