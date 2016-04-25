var login = {};
login.loginMiddleware = function (req, res, next) {
  next();
};

module.exports = login;