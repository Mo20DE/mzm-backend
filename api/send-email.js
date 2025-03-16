const nodemailer = require('nodemailer');

module.exports = async (event) => {
    const { name, email, message } = JSON.parse(event.body);

    // Konfiguration des Transports mit Umgebungsvariablen
    const transporter = nodemailer.createTransport({
        host: 'mail.gmx.net',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,  // Umgebungsvariable für Benutzername
            pass: process.env.EMAIL_PASS   // Umgebungsvariable für Passwort
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.sendMail({
            from: `"MZM Portfolio Contact-Form" <${process.env.EMAIL_USER}>`,  // Umgebungsvariable für Absender
            to: process.env.EMAIL_TO,  // Umgebungsvariable für Empfänger
            subject: 'A message from your contact-form on your portfolio website',
            text: `From: ${name} (${email}) \n\n ${message}`,
            replyTo: email
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'E-Mail was sent successfully!'
            })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: 'E-Mail could not be sent!'
            })
        };
    }
};