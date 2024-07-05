import React, { useState, useEffect } from 'react';
import FeatherIcon from 'feather-icons-react';

const ContentSwitcher = ({ activeTab, tableExtraction, setTableExtraction, keyValues, setKeyValues, selectedPage }) => {
  // State initialization with props
  const [formLabels, setFormLabels] = useState(keyValues[`page_${selectedPage}`] || []);
  const [tableData, setTableData] = useState(tableExtraction[`page_${selectedPage}`]?.table_1 || [{"empty column": ""}]);

  useEffect(() => {
    // Update local state when props change
    setFormLabels(keyValues[`page_${selectedPage}`] || []);
    setTableData(tableExtraction[`page_${selectedPage}`]?.table_1 || [{"empty column": ""}]);
  }, [selectedPage, keyValues, tableExtraction]);

  const tableHeaders = Array.from(new Set(tableData.reduce((acc, obj) => [...acc, ...Object.keys(obj)], [])));

  const handleLabelChange = (event, index) => {
    const newLabel = event.target.value;
    const newFormLabels = [...formLabels];
    newFormLabels[index][0] = newLabel;
    setFormLabels(newFormLabels);
    setKeyValues(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: newFormLabels
    }));
  };

  const handleValueChange = (event, index) => {
    const newValue = event.target.value;
    const newFormLabels = [...formLabels];
    newFormLabels[index][1] = newValue;
    setFormLabels(newFormLabels);
    setKeyValues(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: newFormLabels
    }));
  };

  const handleTableChange = (event, rowIndex, columnName) => {
    const { value } = event.target;
    const newTableData = [...tableData];
    newTableData[rowIndex][columnName] = value;
    setTableData(newTableData);
    setTableExtraction(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: {
        ...prevState[`page_${selectedPage}`],
        table_1: newTableData
      }
    }));
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
    setTableExtraction(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: {
        ...prevState[`page_${selectedPage}`],
        table_1: updatedTableData
      }
    }));
  };

  const addRow = (index) => {
    const newRow = {};
    tableHeaders.forEach(header => {
      newRow[header] = "";
    });
    const newData = [...tableData];
    newData.splice(index + 1, 0, newRow);
    setTableData(newData);
    setTableExtraction(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: {
        ...prevState[`page_${selectedPage}`],
        table_1: newData
      }
    }));
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
    setTableExtraction(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: {
        ...prevState[`page_${selectedPage}`],
        table_1: updatedTableData
      }
    }));
  };

  const deleteRow = (rowIndex) => {
    const newData = tableData.filter((_, index) => index !== rowIndex);
    setTableData(newData);
    setTableExtraction(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: {
        ...prevState[`page_${selectedPage}`],
        table_1: newData
      }
    }));
  };

  const deleteColumn = (columnIndex) => {
    const columnToDelete = tableHeaders[columnIndex];
    const updatedTableData = tableData.map(row => {
      const newRow = { ...row };
      delete newRow[columnToDelete];
      return newRow;
    });
    setTableData(updatedTableData);
    setTableExtraction(prevState => ({
      ...prevState,
      [`page_${selectedPage}`]: {
        ...prevState[`page_${selectedPage}`],
        table_1: updatedTableData
      }
    }));
  };

  if (activeTab === 'keyValues') {
    return (
      <div className="extract-popup-content key-values">
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
                    <div className="table-header-wrapper">
                      <input
                        type="text"
                        value={header}
                        onChange={(event) => handleHeaderChange(event, index)}
                        className="table-input table-input-bold"
                      />
                      <div className="add-icon-wrapper">
                        <div className="table-icon" onClick={() => addColumn(index)} title="Add Right Column">
                          <FeatherIcon className="table-feather-icon add-icon" icon="plus-circle" />
                        </div>
                      </div>
                      <div className="delete-icon-wrapper">
                        <div className="table-icon" onClick={() => deleteColumn(index)} title="Delete Column">
                          <FeatherIcon className="table-feather-icon trash-icon" icon="trash" />
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className="content-table-row">
                  <td className="content-table-data">
                    <div className="row-trash-icon" onClick={() => deleteRow(rowIndex)} title="Delete Row">
                      <FeatherIcon className="table-feather-delete-icon trash-icon" icon="trash" />
                    </div>
                    <div className="row-add-icon" onClick={() => addRow(rowIndex)} title="Add Next Row">
                      <FeatherIcon className="table-feather-add-icon add-icon" icon="plus-circle" />
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
