import {
    BRAND,
    FONT_BODY,
    emailShell,
    eyebrow,
    heading,
    paragraph,
    button,
    esc,
} from "./_shared";

/**
 * Generic internal alert for the admin team (reviews, signups, shipment
 * problems, sync failures, test emails). Each caller passes a short intro and a
 * list of label/value rows; every value is escaped here.
 *
 * @param {object} data
 * @param {string}  data.label        Eyebrow text, e.g. "New Review"
 * @param {string}  data.title        Heading
 * @param {string}  [data.intro]      One-line explanation under the heading
 * @param {Array}   [data.rows]       [{ label, value }]
 * @param {string}  [data.ctaLabel]
 * @param {string}  [data.ctaUrl]     Absolute URL
 */
export const adminAlert = ({ label = "Admin Alert", title, intro, rows = [], ctaLabel, ctaUrl } = {}) => {
    const rowHtml = (Array.isArray(rows) ? rows : [])
        .filter((row) => row && row.value !== undefined && row.value !== null && row.value !== "")
        .map(
            (row) => `
<tr>
  <td style="padding:0 0 16px;">
    <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:10px;font-weight:bold;letter-spacing:0;text-transform:uppercase;color:${BRAND.muted};">${esc(row.label)}</p>
    <p style="margin:0;font-family:${FONT_BODY};font-size:15px;line-height:22px;color:${BRAND.ink};white-space:pre-wrap;">${esc(row.value)}</p>
  </td>
</tr>`
        )
        .join("");

    const bodyHtml = `
${eyebrow(label)}
${heading(title)}
${intro ? paragraph(intro) : ""}
${rowHtml ? `<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:8px;">${rowHtml}</table>` : ""}
${ctaUrl ? `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:8px;">
  <tr>
    <td align="center" style="border-top:1px solid ${BRAND.border};padding-top:24px;">
      ${button(ctaLabel || "Open admin panel", esc(ctaUrl))}
    </td>
  </tr>
</table>` : ""}`;

    return emailShell({
        preheader: intro || title,
        title,
        bodyHtml,
    });
};
