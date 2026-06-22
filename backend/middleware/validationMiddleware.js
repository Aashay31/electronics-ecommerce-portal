const validateLength = (fields) => {
  return (req, res, next) => {
    for (const [field, maxLength] of Object.entries(fields)) {
      if (req.body[field] && req.body[field].length > maxLength) {
        return res.status(400).json({
          success: false,
          message: `${field} must be at most ${maxLength} characters long`,
        });
      }
    }
    next();
  };
};

const validateNestedLength = (nestedObject, fields) => {
  return (req, res, next) => {
    if (req.body[nestedObject]) {
      for (const [field, maxLength] of Object.entries(fields)) {
        if (
          req.body[nestedObject][field] &&
          req.body[nestedObject][field].length > maxLength
        ) {
          return res.status(400).json({
            success: false,
            message: `${nestedObject}.${field} must be at most ${maxLength} characters long`,
          });
        }
      }
    }
    next();
  };
};

module.exports = { validateLength, validateNestedLength };
