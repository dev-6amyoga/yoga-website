const crypto = require("crypto-js");

module.exports = {
  enc_token: (invite_user_email, invite_user_phone, invite_user_name) => {
    const bytes = crypto.RC4.encrypt(
      JSON.stringify({
        invite_user_email,
        invite_user_phone,
        invite_user_name,
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
