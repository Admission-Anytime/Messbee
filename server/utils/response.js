/**
 * Format success response
 */
exports.successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Format error response
 */
exports.errorResponse = (message = 'Error', statusCode = 500) => {
  return {
    success: false,
    message,
    statusCode
  };
};

/**
 * Pagination helper
 */
exports.getPagination = (page = 1, limit = 10, total) => {
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const totalPages = Math.ceil(total / itemsPerPage);

  return {
    page: currentPage,
    limit: itemsPerPage,
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
