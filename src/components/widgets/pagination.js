import React from 'react';
import FeatherIcon from "feather-icons-react";

const Pagination = ({ currentPage, totalPages, onPageChange, value, onChange, handleRefresh }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Maximum number of visible page numbers

    // Calculate start and end pages to display
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleNextTwoPages = () => {
    if (currentPage + 2 <= totalPages) {
      onPageChange(currentPage + 2);
    } else if (currentPage + 1 <= totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handlePrevTwoPages = () => {
    if (currentPage - 2 >= 1) {
      onPageChange(currentPage - 2);
    } else if (currentPage - 1 >= 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className="pagination">
      <span>Page {currentPage} of {totalPages}</span>
      <div className="page-numbers">
        <button onClick={handleFirstPage} disabled={currentPage === 1}>{"<<<"}</button>
        <button onClick={handlePrevTwoPages} disabled={currentPage <= 2}>{"<<"}</button>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>{"<"}</button>
        {getPageNumbers().map(number => (
          <button
            key={number}
            className={`page-number ${number === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
        <button onClick={handleNextPage} disabled={currentPage >= totalPages}>{">"}</button>
        <button onClick={handleNextTwoPages} disabled={currentPage >= totalPages - 1}>{">>"}</button>
        <button onClick={handleLastPage} disabled={currentPage === totalPages}>{">>>"}</button>
        <select className="per-page-dropdown" value={value} onChange={onChange}>
            <option value={10}>10/pages</option>
            <option value={20}>20/pages</option>
            <option value={50}>50/pages</option>
            <option value={100}>100/pages</option>
        </select>
        <button onClick={handleRefresh} className="refresh-button">
          <FeatherIcon icon="refresh-cw" className="refresh-icon" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
