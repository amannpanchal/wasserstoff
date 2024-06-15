const winston = require("winston");

// Create a logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "combined.log" })],
});

// Middleware for logging request details
const logMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      payloadSize: req.headers["content-length"] || 0,
      contentType: req.headers["content-type"],
      customCriteria: req.query.customCriteria || null,
    });
  });
  next();
};

module.exports = logMiddleware;
