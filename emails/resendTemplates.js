'use strict';

const BRAND = {
  name: 'Sacred Engagement',
  email: 'SacredEngagement@icloud.com',
  siteUrl: 'https://www.sacredengagement.org',
  logoUrl: 'https://www.sacredengagement.org/s/Logo_SE_blue.png',
  colors: {
    ink: '#203544',
    inkSoft: '#526875',
    night: '#143040',
    water: '#1d6083',
    evergreen: '#5c7c62',
    sky: '#e3edf4',
    moss: '#e8f0e9',
    clay: '#b07d56',
    sand: '#f8f5f0',
    white: '#ffffff',
    line: '#d7e1e7',
  },
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeParagraphs(items) {
  return (items || [])
    .map(item => String(item || '').trim())
    .filter(Boolean);
}

function renderButton(label, href, variant) {
  if (!label || !href) return '';
  const styles = variant === 'secondary'
    ? `display:inline-block;padding:13px 22px;border-radius:999px;border:1px solid ${BRAND.colors.line};color:${BRAND.colors.water};background:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;text-decoration:none;`
    : `display:inline-block;padding:13px 22px;border-radius:999px;border:1px solid ${BRAND.colors.water};color:#ffffff;background:${BRAND.colors.water};font-family:Arial,sans-serif;font-size:15px;font-weight:700;line-height:1.2;text-decoration:none;`;

  return `<a href="${escapeHtml(href)}" style="${styles}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function renderList(items) {
  if (!items?.length) return '';
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 0 0;">
      ${items.map(item => `
        <tr>
          <td width="22" valign="top" style="padding:0 0 12px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${BRAND.colors.evergreen};">●</td>
          <td valign="top" style="padding:0 0 12px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${BRAND.colors.inkSoft};">${escapeHtml(item)}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function renderQuote(quote, attribution) {
  if (!quote) return '';
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0 0 0;">
      <tr>
        <td style="border-left:4px solid ${BRAND.colors.water};padding:0 0 0 18px;">
          <div style="font-family:Georgia, 'Times New Roman', serif;font-size:24px;line-height:1.3;color:${BRAND.colors.night};">
            “${escapeHtml(quote)}”
          </div>
          ${attribution ? `<div style="margin-top:10px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:${BRAND.colors.inkSoft};font-weight:700;">${escapeHtml(attribution)}</div>` : ''}
        </td>
      </tr>
    </table>
  `;
}

function renderSection(title, paragraphs, listItems) {
  const copy = normalizeParagraphs(paragraphs)
    .map(text => `<p style="margin:0 0 14px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.7;color:${BRAND.colors.inkSoft};">${escapeHtml(text)}</p>`)
    .join('');

  if (!title && !copy && !listItems?.length) return '';

  return `
    <tr>
      <td style="padding:0 0 26px 0;">
        ${title ? `<h2 style="margin:0 0 12px 0;font-family:Georgia, 'Times New Roman', serif;font-size:28px;line-height:1.15;color:${BRAND.colors.night};font-weight:700;">${escapeHtml(title)}</h2>` : ''}
        ${copy}
        ${renderList(listItems)}
      </td>
    </tr>
  `;
}

function baseEmailLayout({
  previewText,
  eyebrow,
  heading,
  intro,
  sections,
  primaryCta,
  secondaryCta,
  quote,
  quoteAttribution,
  footerNote,
}) {
  const safeSections = Array.isArray(sections) ? sections : [];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(heading || BRAND.name)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BRAND.colors.sand};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(previewText || '')}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;background:
      linear-gradient(180deg, ${BRAND.colors.sand} 0%, #f3eee6 100%);">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 18px 0;text-align:center;">
                <img
                  src="${escapeHtml(BRAND.logoUrl)}"
                  alt="${escapeHtml(BRAND.name)}"
                  width="220"
                  style="width:220px;max-width:100%;height:auto;border:0;display:inline-block;"
                >
              </td>
            </tr>
            <tr>
              <td style="border-radius:30px;overflow:hidden;background:
                linear-gradient(180deg, rgba(227,237,244,0.95) 0%, rgba(255,255,255,0.98) 28%, rgba(255,253,249,1) 100%);
                border:1px solid ${BRAND.colors.line};box-shadow:0 12px 40px rgba(20,48,64,0.08);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                  <tr>
                    <td style="padding:42px 42px 32px 42px;background:
                      radial-gradient(circle at top right, rgba(29,96,131,0.10), transparent 34%),
                      radial-gradient(circle at left bottom, rgba(92,124,98,0.10), transparent 28%);
                      border-bottom:1px solid ${BRAND.colors.line};">
                      ${eyebrow ? `<div style="margin:0 0 16px 0;">
                        <span style="display:inline-block;padding:8px 14px;border-radius:999px;background:${BRAND.colors.sky};color:${BRAND.colors.water};font-family:Arial,sans-serif;font-size:12px;line-height:1.2;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">${escapeHtml(eyebrow)}</span>
                      </div>` : ''}
                      <h1 style="margin:0 0 16px 0;font-family:Georgia, 'Times New Roman', serif;font-size:42px;line-height:1.02;color:${BRAND.colors.night};font-weight:700;">
                        ${escapeHtml(heading)}
                      </h1>
                      ${intro ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:18px;line-height:1.7;color:${BRAND.colors.inkSoft};">${escapeHtml(intro)}</p>` : ''}
                      ${(primaryCta || secondaryCta) ? `
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 0 0;">
                          <tr>
                            ${primaryCta ? `<td style="padding:0 12px 12px 0;">${renderButton(primaryCta.label, primaryCta.href, 'primary')}</td>` : ''}
                            ${secondaryCta ? `<td style="padding:0 0 12px 0;">${renderButton(secondaryCta.label, secondaryCta.href, 'secondary')}</td>` : ''}
                          </tr>
                        </table>
                      ` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:34px 42px 18px 42px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                        ${safeSections.map(section => renderSection(section.title, section.paragraphs, section.listItems)).join('')}
                      </table>
                      ${renderQuote(quote, quoteAttribution)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 42px 34px 42px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:100%;">
                        <tr>
                          <td style="padding:18px 20px;border-radius:22px;background:${BRAND.colors.moss};font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:${BRAND.colors.ink};">
                            ${escapeHtml(footerNote || 'You are receiving this note because you requested updates from Sacred Engagement.')}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 18px 0 18px;text-align:center;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:${BRAND.colors.inkSoft};">
                ${escapeHtml(BRAND.name)} · ${escapeHtml(BRAND.email)}<br>
                <a href="${escapeHtml(BRAND.siteUrl)}" target="_blank" rel="noopener noreferrer" style="color:${BRAND.colors.water};text-decoration:underline;">${escapeHtml(BRAND.siteUrl)}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function createModule1InviteEmail({
  recipientName = 'Friend',
  cohortName = 'the next Module 1 cohort',
  cohortDateText = 'an upcoming start date',
  primaryUrl = `${BRAND.siteUrl}/mod-1`,
  secondaryUrl = `${BRAND.siteUrl}/the-program-1`,
} = {}) {
  const firstName = String(recipientName).trim() || 'Friend';
  const previewText = `Join ${cohortName} and begin turning inward with gentle awareness.`;

  const html = baseEmailLayout({
    previewText,
    eyebrow: 'Module 1 • Waking Up',
    heading: `${firstName}, begin with gentle awareness.`,
    intro: `Sacred Engagement invites you into a guided journey of self-discovery through daily practice, live Zoom gatherings, and a circle of thoughtful peers.`,
    primaryCta: { label: 'Explore Module 1', href: primaryUrl },
    secondaryCta: { label: 'View the full program', href: secondaryUrl },
    sections: [
      {
        title: `You’re invited to ${cohortName}`,
        paragraphs: [
          `Our next opening begins ${cohortDateText}. Module 1 is the starting place for everyone and offers a steady, practice-based path into greater awareness, honesty, and connection.`,
          `This is not a course in quick fixes. It is a spacious invitation to notice your inner patterns, reflect with care, and discover how your inner life shapes the way you meet others.`,
        ],
      },
      {
        title: 'What the rhythm feels like',
        listItems: [
          '30 to 60 minutes of guided practice on most days',
          'Live Zoom gatherings with facilitators and a small group',
          'Reflection, journaling, and real conversation grounded in everyday life',
        ],
      },
      {
        title: 'Why people join',
        paragraphs: [
          'Many participants come because they sense that life is asking more of them: more awareness, more steadiness, and more honest connection.',
          'The tone is gentle, sincere, and deeply human. You do not need to be an expert in meditation or self-inquiry to begin.',
        ],
      },
    ],
    quote: 'You’ve lived enough life to know that real change asks for time, attention, and a willingness to be stirred.',
    quoteAttribution: 'Sacred Engagement',
    footerNote: 'Sacred Engagement currently operates on a by-donation basis. Cost is not meant to be a barrier to participation.',
  });

  const text = [
    `${firstName}, begin with gentle awareness.`,
    '',
    `You’re invited to ${cohortName}.`,
    `Our next opening begins ${cohortDateText}. Module 1 is the starting place for everyone and offers a guided journey of self-discovery through daily practice, live Zoom gatherings, and a circle of thoughtful peers.`,
    '',
    'What the rhythm feels like:',
    '- 30 to 60 minutes of guided practice on most days',
    '- Live Zoom gatherings with facilitators and a small group',
    '- Reflection, journaling, and real conversation grounded in everyday life',
    '',
    `Explore Module 1: ${primaryUrl}`,
    `View the full program: ${secondaryUrl}`,
    '',
    'Sacred Engagement currently operates on a by-donation basis. Cost is not meant to be a barrier to participation.',
  ].join('\n');

  return {
    subject: `Sacred Engagement: Join ${cohortName}`,
    previewText,
    html,
    text,
  };
}

module.exports = {
  BRAND,
  baseEmailLayout,
  createModule1InviteEmail,
};
