const getLoggedInUserDetails = (req, isProd) => {
  return {
    'loggedInUserAvatar': isProd ? req.user.picture : '/s/generic_profile.png',
    'loggedInUserEmail': isProd ? req.user.email : 'tester@test.com',
    'loggedInUserDisplayName': isProd ? req.user.displayName : 'Tester',
  };
};

const addLoggedInUserDetails = (obj, req, isProd) => {
  const details = getLoggedInUserDetails(req, isProd);
  // Spelling it out for JS parsers thar don't understand spreading.
  obj['loggedInUserAvatar'] = details['loggedInUserAvatar'];
  obj['loggedInUserEmail'] = details['loggedInUserEmail'];
  obj['loggedInUserDisplayName'] = details['loggedInUserDisplayName'];
};

const oneRandomLetter = () => {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26));
};

module.exports = {
  addLoggedInUserDetails,
  getLoggedInUserDetails,
  oneRandomLetter,
};
