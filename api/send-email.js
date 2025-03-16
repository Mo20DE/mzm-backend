const nodemailer = require('nodemailer');

// Erlaube nur die angegebene Ursprünge (CORS)
const allowedOrigins = ['http://localhost:5173', 'https://mzm.vercel.app'];

module.exports = async (event) => {
    const origin = event.headers.origin;

    // CORS-Prüfung: Nur erlaubte Ursprünge erhalten Zugriff
    const headers = {
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true', // Falls du Cookies oder Sessions verwendest
    };

    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin; // Erlaube den Zugang für den Ursprung
    }

    // Wenn es eine OPTIONS-Anfrage ist (CORS Preflight), antworte sofort mit Status 200
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Nur POST-Anfragen akzeptieren
    if (event.httpMethod === 'POST') {
        const { name, email, message } = JSON.parse(event.body);

        // Konfiguration für den E-Mail-Versand
        const transporter = nodemailer.createTransport({
            host: 'mail.gmx.net',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        try {
            // E-Mail senden
            await transporter.sendMail({
                from: `"MZM Portfolio Contact-Form" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: 'A message from your contact-form on your portfolio website',
                text: `From: ${name} (${email}) \n\n ${message}`,
                replyTo: email
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'E-Mail was sent successfully!'
                })
            };
        } catch (error) {
            console.error('Fehler beim Senden der E-Mail:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'E-Mail could not be sent!',
                    error: error.message // Füge den Fehlertext hinzu, um das Problem besser zu erkennen
                })
            };
        }
    } else {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Method Not Allowed!'
            })
        };
    }
};