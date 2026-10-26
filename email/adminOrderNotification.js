import {
    BRAND,
    FONT_BODY,
    FONT_DISPLAY,
    emailShell,
    eyebrow,
    heading,
    paragraph,
    button,
    formatINR,
    esc,
} from "./_shared";

const PAYMENT_LABEL = {
    cod: "Cash on Delivery",
    partial: "Partial Payment",
    full: "Paid in Full",
};

/**
 * Internal "new order" alert for the admin team. Mirrors the customer
 * confirmation but is written for fulfilment: who ordered, how to reach them,
 * what was paid vs what is still to collect, and a deep link into the admin
 * order page. Every value is the server-computed one from save-order.
 *
 * @param {object} data
 * @param {string}  data.order_id
 * @param {string}  data.adminOrderUrl
 * @param {object}  data.customer            { name, email, phone }
 * @param {Array}   [data.items]             [{ name, qty, sellingPrice, mrp }]
 * @param {number}  [data.subtotal]
 * @param {number}  [data.couponDiscountAmount]
 * @param {number}  [data.totalAmount]
 * @param {'cod'|'full'|'partial'} [data.paymentMethod]
 * @param {number}  [data.partialPaymentPercentage]
 * @param {number}  [data.paidAmount]
 * @param {number}  [data.remainingAmount]
 * @param {string}  [data.paymentId]
 * @param {object}  [data.address]           { address, landmark, city, state, pincode, country }
 * @param {string}  [data.ordernote]
 * @param {Date}    [data.placedAt]
 */
export const adminOrderNotification = (data = {}) => {
    const {
        order_id,
        adminOrderUrl = "#",
        customer = {},
        items = [],
        subtotal = 0,
        couponDiscountAmount = 0,
        totalAmount = 0,
        paymentMethod = "full",
        partialPaymentPercentage,
        paidAmount = 0,
        remainingAmount = 0,
        paymentId,
        address = {},
        ordernote,
        placedAt = new Date(),
    } = data;

    const label = (text) => `
<p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:11px;font-weight:bold;letter-spacing:0;text-transform:uppercase;color:${BRAND.muted};">${esc(text)}</p>`;

    const itemCount = (Array.isArray(items) ? items : []).reduce((sum, it) => sum + (Number(it?.qty) || 0), 0);

    // ── Summary strip: total + amount still to collect ──
    const summaryCell = (title, value, color = BRAND.oxblood) => `
<td class="ms-stack" width="50%" style="padding:16px 18px;background-color:${BRAND.warm};border:1px solid ${BRAND.border};">
  ${label(title)}
  <p style="margin:0;font-family:${FONT_DISPLAY};font-size:22px;line-height:28px;color:${color};">${esc(value)}</p>
</td>`;

    const summary = `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
  <tr>
    ${summaryCell("Order total", formatINR(totalAmount))}
    ${summaryCell("To collect on delivery", formatINR(remainingAmount), Number(remainingAmount) > 0 ? BRAND.crimson : BRAND.success)}
  </tr>
</table>`;

    // ── Order meta ──
    const metaRow = (title, value) => `
<tr>
  <td style="padding:6px 0;font-family:${FONT_BODY};font-size:13px;color:${BRAND.muted};">${esc(title)}</td>
  <td align="right" style="padding:6px 0;font-family:${FONT_BODY};font-size:14px;color:${BRAND.ink};">${value}</td>
</tr>`;

    const paymentLabel = PAYMENT_LABEL[paymentMethod] || paymentMethod;
    const paymentText = paymentMethod === "partial" && partialPaymentPercentage
        ? `${paymentLabel} (${esc(partialPaymentPercentage)}% upfront)`
        : esc(paymentLabel);

    const metaTable = `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  ${metaRow("Order ID", `<strong style="font-family:${FONT_DISPLAY};color:${BRAND.oxblood};">${esc(order_id)}</strong>`)}
  ${metaRow("Placed", esc(new Date(placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })))}
  ${metaRow("Payment", paymentText)}
  ${metaRow("Paid online", esc(formatINR(paidAmount)))}
  ${paymentId ? metaRow("Razorpay payment", esc(paymentId)) : ""}
</table>`;

    // ── Line items ──
    const itemRows = (Array.isArray(items) ? items : [])
        .map(
            (it) => `
<tr>
  <td style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-family:${FONT_BODY};font-size:14px;line-height:20px;color:${BRAND.ink};">
    ${esc(it?.name) || "Item"}
    <span style="color:${BRAND.muted};">&nbsp;×&nbsp;${esc(it?.qty ?? 1)}</span>
    <br /><span style="font-size:12px;color:${BRAND.muted};">${esc(formatINR(it?.sellingPrice))} each</span>
  </td>
  <td align="right" style="padding:12px 0;border-bottom:1px solid ${BRAND.border};font-family:${FONT_BODY};font-size:14px;line-height:20px;color:${BRAND.ink};white-space:nowrap;">
    ${formatINR((Number(it?.sellingPrice) || 0) * (Number(it?.qty) || 1))}
  </td>
</tr>`
        )
        .join("");

    const totalLine = (title, value, strong = false) => `
<tr>
  <td style="padding:5px 0;font-family:${FONT_BODY};font-size:${strong ? "15px" : "13px"};color:${strong ? BRAND.oxblood : BRAND.body};${strong ? "font-weight:bold;" : ""}">${esc(title)}</td>
  <td align="right" style="padding:5px 0;font-family:${FONT_BODY};font-size:${strong ? "15px" : "13px"};color:${strong ? BRAND.oxblood : BRAND.ink};${strong ? "font-weight:bold;" : ""}white-space:nowrap;">${esc(value)}</td>
</tr>`;

    const itemsBlock = `
${label(`Items (${itemCount})`)}
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
  ${itemRows}
</table>
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  ${totalLine("Subtotal", formatINR(subtotal))}
  ${Number(couponDiscountAmount) > 0 ? totalLine("Coupon discount", `– ${formatINR(couponDiscountAmount)}`) : ""}
  ${totalLine("Total", formatINR(totalAmount), true)}
</table>`;

    // ── Customer + shipping ──
    const addrLine = [
        esc(address?.address),
        esc(address?.landmark),
        [esc(address?.city), esc(address?.state), esc(address?.pincode)].filter(Boolean).join(", "),
        esc(address?.country),
    ]
        .filter(Boolean)
        .join("<br />");

    const customerBlock = `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr>
    <td class="ms-stack" width="50%" valign="top" style="padding:0 12px 16px 0;">
      ${label("Customer")}
      <p style="margin:0;font-family:${FONT_BODY};font-size:14px;line-height:22px;color:${BRAND.ink};">
        ${esc(customer?.name)}<br />
        <a href="mailto:${esc(customer?.email)}" style="color:${BRAND.crimson};">${esc(customer?.email)}</a><br />
        <a href="tel:${esc(customer?.phone)}" style="color:${BRAND.crimson};">${esc(customer?.phone)}</a>
      </p>
    </td>
    <td class="ms-stack" width="50%" valign="top" style="padding:0 0 16px;">
      ${label("Ship to")}
      <p style="margin:0;font-family:${FONT_BODY};font-size:14px;line-height:22px;color:${BRAND.ink};">${addrLine || "—"}</p>
    </td>
  </tr>
</table>`;

    const noteBlock = ordernote
        ? `
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr>
    <td style="background-color:${BRAND.cream};border-radius:12px;padding:16px 18px;">
      ${label("Customer note")}
      <p style="margin:0;font-family:${FONT_BODY};font-size:14px;line-height:22px;color:${BRAND.ink};white-space:pre-wrap;">${esc(ordernote)}</p>
    </td>
  </tr>
</table>`
        : "";

    const bodyHtml = `
${eyebrow("New Order")}
${heading(`${formatINR(totalAmount)} from ${customer?.name || "a customer"}`)}
${paragraph(`A new order with ${itemCount} item${itemCount === 1 ? "" : "s"} just came in. Here's everything you need to start fulfilment.`)}
${summary}
${metaTable}
${itemsBlock}
${customerBlock}
${noteBlock}
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
  <tr><td align="center">${button("Open order in admin", esc(adminOrderUrl))}</td></tr>
</table>`;

    return emailShell({
        preheader: `New order ${order_id} — ${formatINR(totalAmount)} (${paymentLabel}) from ${customer?.name || "a customer"}.`,
        title: "New order",
        bodyHtml,
    });
};
