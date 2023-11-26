const { OAuth2Client } = require("google-auth-library");

async function verify(client_id, jwtToken) {
  const client = new OAuth2Client(client_id);

  // Call the verifyIdToken to
  // varify and decode it
  const ticket = await client.verifyIdToken({
    idToken: jwtToken,
    audience: client_id,
  });

  // Get the JSON with all the user info
  const payload = ticket.getPayload();

  // This is a JSON object that contains
  // all the user info
  return payload;
}
module.exports = {
  verify: verify,
};
