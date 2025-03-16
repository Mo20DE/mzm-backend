const nodemailer = require('nodemailer');

// Erlaubte Ursprünge für CORS
const allowedOrigins = ['http://localhost:5173', 'https://mzm.vercel.app'];

module.exports = async (req, res) => {

    // Ursprung aus Anfrage-Header holen
    const origin = req.headers.origin;
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Setze die CORS-Header für jede Anfrage
    if (isAllowedOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    else {
        res.status(403).json({ success: false, message: "CORS policy does not allow this origin."});
        return;
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // OPTIONS-Anfrage (CORS Preflight) direkt beantworten
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Nur POST-Anfragen akzeptieren
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed!' });
    }

    // JSON-Daten aus der Anfrage holen
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // E-Mail-Transporter konfigurieren
    const transporter = nodemailer.createTransport({
        host: 'mail.gmx.net',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
    });

    try {
        console.log('Sending email...');
        await transporter.sendMail({
            from: `"MZM Portfolio Contact-Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            subject: 'A message from your contact-form on your portfolio website',
            text: `From: ${name} (${email}) \n\n ${message}`,
            replyTo: email
        });

        console.log(`Email sent successfully to: ${process.env.EMAIL_TO}`);
        return res.status(200).json({ success: true, message: 'E-Mail was sent successfully!' });

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ success: false, message: 'E-Mail could not be sent!', error: error.message });
    }
};