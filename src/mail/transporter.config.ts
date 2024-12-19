import * as nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'juan.yampara.rojas@alumnos.uta.cl',
        pass: ''
    }
});