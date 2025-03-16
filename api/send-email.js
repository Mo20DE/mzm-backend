
const nodemailer = require('nodemailer');

// Erlaube nur die angegebene Ursprünge (CORS)
const allowedOrigins = ['http://localhost:5173', 'https://mzm.vercel.app'];

module.exports = async (req, res) => {
    console.log("Function triggered!");

    // CORS-Prüfung: Nur erlaubte Ursprünge erhalten Zugriff
    const headers = {
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true', // Falls du Cookies oder Sessions verwendest
    };

    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin; // Erlaube den Zugang für den Ursprung
    } else {
        // Optional: Du kannst auch hier ein Standard-Header setzen oder den Header weglassen, wenn der Ursprung nicht erlaubt ist
        // headers['Access-Control-Allow-Origin'] = '*'; // wenn du es für alle Ursprünge erlauben möchtest
    }

    // Wenn es eine OPTIONS-Anfrage ist (CORS Preflight), antworte sofort mit Status 200
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).send('');
        return;
    }

    // Nur POST-Anfragen akzeptieren
    if (req.method === 'POST') {
        const { name, email, message } = req.body;

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
            console.log('Starting to send email...');
            await transporter.sendMail({
                from: `"MZM Portfolio Contact-Form" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: 'A message from your contact-form on your portfolio website',
                text: `From: ${name} (${email}) \n\n ${message}`,
                replyTo: email
            });

            // Logge, dass die E-Mail erfolgreich gesendet wurde
            console.log(`Email sent successfully to: ${process.env.EMAIL_TO}`);
            
            // Erfolgreiche Antwort zurückgeben
            res.setHeader('Access-Control-Allow-Origin', origin || '*'); // Setze origin oder benutze '*'
            res.status(200).json({
                success: true,
                message: 'E-Mail was sent successfully!'
            });
        } catch (error) {
            console.error('Fehler beim Senden der E-Mail:', error);

            // Logge den Fehler
            console.error(`E-Mail could not be sent. Error: ${error.message}`);

            // Fehlerhafte Antwort zurückgeben
            res.setHeader('Access-Control-Allow-Origin', origin || '*');
            res.status(500).json({
                success: false,
                message: 'E-Mail could not be sent!',
                error: error.message
            });
        }
    } else {
        // Method Not Allowed
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.status(405).json({
            success: false,
            message: 'Method Not Allowed!'
        });
    }
};
