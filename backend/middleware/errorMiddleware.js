const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProductionServerError =
    process.env.NODE_ENV === "production" && statusCode >= 500;

  res.status(statusCode);
  res.json({
    message: isProductionServerError ? "Server error" : err.message,
    ...(process.env.NODE_ENV === "production" ? {} : { stack: err.stack }),
  });
};

export { errorHandler, notFound };
