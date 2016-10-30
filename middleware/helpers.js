

module.exports.ParseIp = function(ipString) {
    ipString = ipString.split(":");
    var clientIp = ipString[ipString.length - 1];
    return clientIp === "1" ? 'Localhost' : clientIp;
};

module.exports.requireLogin = function(req, res, next) {
  if (req.session.loggedIn) {
    next(); // allow the next route to run
  } else {
    // require the user to log in
    res.redirect("/login"); // or render a form, etc.
  }
}
