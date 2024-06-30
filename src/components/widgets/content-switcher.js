import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';

const ContentSwitcher = ({ activeTab }) => {
  const [formDataState, setFormDataState] = useState({});
  const [tableData, setTableData] = useState([
    { column1: "Data 1", column2: "Data 2" },
    { column1: "Data 3", column2: "Data 4", column3: "Data 5" }
  ]);

  const formData = { label1: "value 1", label2: "value 2", label3: "value 3", label4: "value 4", label5: "value 5" };

  const tableHeaders = Array.from(new Set(tableData.reduce((acc, obj) => [...acc, ...Object.keys(obj)], []))).map(header => header);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormDataState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleTableChange = (event, rowIndex, columnName) => {
    const { value } = event.target;
    const newTableData = [...tableData];
    newTableData[rowIndex][columnName] = value;
    setTableData(newTableData);
  };

  const handleHeaderChange = (event, index) => {
    const newHeader = event.target.value;
    const updatedTableData = tableData.map(row => {
      const newRow = {};
      tableHeaders.forEach((header, i) => {
        if (i === index) {
          newRow[newHeader] = row[header];
        } else {
          newRow[header] = row[header];
        }
      });
      return newRow;
    });
    setTableData(updatedTableData);
  };

  const addRow = (index) => {
    const newRow = {};
    tableHeaders.forEach(header => {
      newRow[header] = "";
    });
    const newData = [...tableData];
    newData.splice(index + 1, 0, newRow);
    setTableData(newData);
  };

  const addColumn = (index) => {
    const updatedTableData = tableData.map(row => {
      const newRow = {};
      tableHeaders.forEach((header, i) => {
        newRow[header] = row[header];
        if (i === index) newRow[`column ${Date.now()}`] = "";
      });
      return newRow;
    });
    setTableData(updatedTableData);
  };

  const deleteRow = (rowIndex) => {
    setTableData(tableData.filter((_, index) => index !== rowIndex));
  };

  const deleteColumn = (columnIndex) => {
    const columnToDelete = tableHeaders[columnIndex];
    const updatedTableData = tableData.map(row => {
      const newRow = { ...row };
      delete newRow[columnToDelete];
      return newRow;
    });
    setTableData(updatedTableData);
  };

  if (activeTab === 'keyValues') {
    return (
      <div className="extract-popup-content">
        {Object.entries(formData).map(([label, value], index) => (
          <div className="col-md-6" key={index}>
            <div className="m-b-16">
              <label className='label'>{label}</label>
              <input onChange={handleChange} value={formDataState[label] || value} type="text" className="form-control" name={label} />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (activeTab === 'table') {
    return (
      <div className="content-table-container">
        <table className="content-table">
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index} className="content-table-head-sticky">
                  <input
                    type="text"
                    value={header}
                    onChange={(event) => handleHeaderChange(event, index)}
                    className="table-input table-input-bold"
                  />
                  <div className="table-icon" onClick={() => addColumn(index)}>
                    <FeatherIcon className="table-feather-icon" icon="plus" />
                  </div>
                  <div className="table-icon" onClick={() => deleteColumn(index)}>
                    <FeatherIcon className="table-feather-icon" icon="trash" />
                  </div>
                </th>
              ))}
              <th className="content-table-head-sticky"></th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="content-table-row">
                {tableHeaders.map((header, cellIndex) => (
                  <td key={cellIndex} className="content-table-data">
                    <input
                      type="text"
                      value={row[header] || ""}
                      onChange={(event) => handleTableChange(event, rowIndex, header)}
                      className="table-input"
                    />
                  </td>
                ))}
                <td className="content-table-data">
                  <div className="table-icon" onClick={() => addRow(rowIndex)}>
                    <FeatherIcon className="table-feather-icon" icon="plus" />
                  </div>
                  <div className="table-icon" onClick={() => deleteRow(rowIndex)}>
                    <FeatherIcon className="table-feather-icon" icon="trash" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

export default ContentSwitcher;
