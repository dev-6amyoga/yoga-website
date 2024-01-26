const crypto = require("crypto-js");

module.exports = {
  enc_token: (email, name) => {
    const bytes = crypto.RC4.encrypt(
      JSON.stringify({
        email,
        name,
      }),
      "secret"
    );
    const token = bytes.toString();
    return token;
  },
  dec_token: (token) => {
    const bytes = crypto.RC4.decrypt(token, "secret");
    const invite = JSON.parse(bytes.toString(crypto.enc.Utf8));
    return invite;
  },
};
