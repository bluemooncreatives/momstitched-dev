import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: Number(process.env.NODEMAILER_PORT),
    secure: false,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

// Verify ONCE when server starts
transporter.verify((err) => {
    if (err) {
        console.error("SMTP connection failed:", err);
    } else {
        console.log("SMTP server is ready");
    }
});

export const sendMail = async (subject, receiver, body) => {
    const options = {
        from: `"MomStitched" <${process.env.NODEMAILER_EMAIL}>`,
        to: receiver,
        subject,
        html: body,
    };

    try {
        await transporter.sendMail(options);
        return { success: true };
    } catch (error) {
        console.error("Mail send failed:", error);
        return { success: false, message: error.message };
    }
};
