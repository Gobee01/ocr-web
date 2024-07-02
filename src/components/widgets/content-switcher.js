import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';

const ContentSwitcher = ({ activeTab }) => {
  const [formLabels, setFormLabels] = useState([
    ["000226", "Hospital Code"],
    ["RODORIA", "Printed By:"],
    ["Due Date", "01/18/2022"],
    ["11/15/2021", "Date Admitted"],
    ["Printed Date:", "12/20/2021"]
  ]);

  const [tableData, setTableData] = useState([
    {
      "Amount": "11,713.25",
      "Date": "11/15/2021 to 11/16/2021",
      "Doctor": "GALANG, GERARDO, M.D.",
      "Pro. Fees": "18,000.00"
    },
    {
      "Amount": NaN,
      "Date": NaN,
      "Doctor": "GUTIERREZ, FELIX EMMANUEL, S M.D.",
      "Name of Patient": NaN,
    },
    {
      "Amount": "11,713.25",
      "Date": "TOTAL HOSPITAL CLAIMS",
      "Doctor": "TOTAL PF CLAIMS",
      "Name of Patient": "TOTAL HOSPITAL CLAIMS",
      "Pro. Fees": "27,000.00"
    }
  ]);

  const tableHeaders = Array.from(new Set(tableData.reduce((acc, obj) => [...acc, ...Object.keys(obj)], [])));

  const handleLabelChange = (event, index) => {
    const newLabel = event.target.value;
    const newFormLabels = [...formLabels];
    newFormLabels[index][0] = newLabel;
    setFormLabels(newFormLabels);
  };

  const handleValueChange = (event, index) => {
    const newValue = event.target.value;
    const newFormLabels = [...formLabels];
    newFormLabels[index][1] = newValue;
    setFormLabels(newFormLabels);
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
        {formLabels.map(([label, value], index) => (
          <div className="col-md-6" key={index}>
            <div className="m-b-16">
              <input
                onChange={(event) => handleLabelChange(event, index)}
                value={label}
                type="text"
                className="label-input"
                name={`label-${index}`}
              />
              <input
                onChange={(event) => handleValueChange(event, index)}
                value={value}
                type="text"
                className="form-control"
                name={`value-${index}`}
              />
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
            <th className="content-table-head-sticky"></th>
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
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="content-table-row">
                <td className="content-table-data">
                  <div className="table-icon" onClick={() => addRow(rowIndex)}>
                    <FeatherIcon className="table-feather-icon" icon="plus" />
                  </div>
                  <div className="table-icon" onClick={() => deleteRow(rowIndex)}>
                    <FeatherIcon className="table-feather-icon" icon="trash" />
                  </div>
                </td>
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
