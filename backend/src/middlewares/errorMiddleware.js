const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0] || "field";
    message = `${duplicatedField} already exists`;
  }

  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid resource identifier",
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
