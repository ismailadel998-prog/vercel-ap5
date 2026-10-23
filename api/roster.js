const { DEFAULT_ROSTER } = require('../lib/config');

module.exports = function handler(req, res) {
  const students = [];
  const classes = [];
  Object.keys(DEFAULT_ROSTER).forEach(cls => {
    classes.push(cls);
    DEFAULT_ROSTER[cls].forEach(name => students.push({ cls, name }));
  });
  res.json({ classes, students });
};
