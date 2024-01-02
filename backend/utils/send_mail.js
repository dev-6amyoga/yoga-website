module.exports = {
    send_mail: (mailTransporter, mailOptions) => {
        return new Promise((resolve, reject) => {
            mailTransporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },
};
