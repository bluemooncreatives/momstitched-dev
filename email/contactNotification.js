export const contactNotification = ({ name, email, subject, message }) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#111111;padding:32px 48px;">
              <img
                src="https://res.cloudinary.com/dg7efdu9o/image/upload/v1747200653/logo-black_luvjrd.webp"
                alt="MomStitched"
                width="140"
                style="display:block;filter:invert(1);"
              />
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:40px 48px 8px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#888888;">
                Contact Form
              </p>
              <h1 style="margin:12px 0 0;font-size:28px;font-weight:700;letter-spacing:-0.02em;color:#111111;line-height:1.2;">
                New Message Received
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 48px 0;">
              <div style="height:1px;background-color:#eeeeee;"></div>
            </td>
          </tr>

          <!-- Fields -->
          <tr>
            <td style="padding:32px 48px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#aaaaaa;">From</p>
                    <p style="margin:0;font-size:16px;color:#111111;font-weight:600;">${name}</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#555555;">${email}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#aaaaaa;">Subject</p>
                    <p style="margin:0;font-size:16px;color:#111111;">${subject || '(No subject)'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:32px;">
                    <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#aaaaaa;">Message</p>
                    <p style="margin:0;font-size:15px;color:#333333;line-height:1.7;white-space:pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <div style="height:1px;background-color:#eeeeee;"></div>
            </td>
          </tr>

          <!-- Reply CTA -->
          <tr>
            <td style="padding:28px 48px 40px;">
              <a
                href="mailto:${email}"
                style="display:inline-block;background-color:#111111;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:2px;"
              >
                Reply to ${name}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:20px 48px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                This message was submitted via the contact form on MomStitched.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return html;
};
