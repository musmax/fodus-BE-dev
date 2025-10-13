const formDataStringConvert = (target) => (req, res, next) => {
  if (req.body[target] !== undefined) {
    req.body = JSON.parse(req.body[target]);
  }
  return next();
};

const formatBody = (req, res, next) => {
  if (req.body !== undefined) {
    req.body = JSON.parse(JSON.stringify(req.body));
  }
  return next();
};
module.exports = { formDataStringConvert, formatBody };
