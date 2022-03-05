const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_BOT,
        pass: process.env.PASSWORD_BOT,
    },
});

module.exports.vefifiedEmail = async (user_id, email, token_user) => {
    var mailVerify = {
        from: process.env.GMAIL_BOT,
        to: email,
        subject: 'Xác minh tài khoản tại Sositech.xyz',
        html: `
            <div
                style="
                    background-color: rgb(223, 223, 223);
                    padding: 20px;
                "
            >
                <div
                    style="
                        align-items: center;
                        background-color: #fff;
                        height: 100%;
                        border-radius: 15px;
                        padding: 20px;
                    "
                >
                    <h1 style="text-align: center; color: rgb(53, 186, 0)">
                        Cảm ơn bạn đã đăng ký tài khoản tại Sositech.xyz
                    </h1>
                    <p style="margin-top: 50px; font-size: 18px">
                        Đây là link xác minh tài khoản của bạn :
                        <a style="text-decoration: none" href="http://sositech.xyz/verify?user_id=${user_id}&email=${email}&token_user=${token_user}"
                            >! Click tại đây !</a
                        >
                    </p>
            
                    <p style="margin-top: 50px; font-size: 17px">Trân trọng,</p>
                    <p style="font-size: 13px">Sositech Team</p>

                    <p style="font-size: 13px; font-style: italic; margin-top : 50px ">*Đây là tin nhắn tự động vui lòng không reply lại. Xin trân trọng cảm ơn !!!</p>
                </div>
            </div>
        `,
    };

    transporter.sendMail(mailVerify, (err, info) => {
        if (err) {
            console.log(err);
        }
        // else {
        //     console.log('Email sent : ' + info.response);
        // }
    });
};
