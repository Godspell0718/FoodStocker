import nodeMailer from 'nodemailer'

class EmailServide {
    getTransportador(){
        return nodeMailer.createTransport({
            host: 'smtp.gamil.com',
            port: 587,
            secure: false,
            auth: {
                user: procces.env.SMTP_USER,
                pass: procces.env.EMAIL_PASS
            }
        })
    }
    async sendPasswordResetEmail(email, tokenPassword) {
        const transporter = this.getTransportador();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${tokenForPassword}`

        const mailOptions = {
            from: `"Soporte foodstocker" <${process.env.SMTP_USER}>`,
            to: email,
            subjetc: "Restablecer contraseña",
            html: `<h2>Recuperación de contraseña</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <a href="${resetUrl}">Restablecer tu contraseña.</a>
            <p>Eeste enlacr vence en 15 minutoss.</p>
            <p>Si no solicitaste este cambio, ignora este correo`
        }

        return await transporter.sendMail(mailOptions)
    }
}

export default new EmailServide()