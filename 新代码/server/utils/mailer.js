// File: server/utils/mailer.js
// 作用：发送「找回密码」验证码邮件。
//
// 配置全部来自 server/.env（缺一项就当未配置）：
//   SMTP_HOST   smtp.qq.com / smtp.163.com / smtp.gmail.com …
//   SMTP_PORT   465（SSL）或 587（STARTTLS）
//   SMTP_SECURE  465 端口填 true，587 填 false；不填按端口自动判断
//   SMTP_USER   发件邮箱账号
//   SMTP_PASS   邮箱的「SMTP 授权码」（注意：不是登录密码）
//   MAIL_FROM   收件人看到的发件人，例如 "普骑屋 <xxx@qq.com>"
//
// 未配置时的行为：只把验证码打到后端控制台，并在接口响应里带 devCode，
// 这样可以先在本地把流程跑通；上线前必须把上面 5 项配齐。

const nodemailer = require('nodemailer');

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM
} = process.env;

const port = Number(SMTP_PORT || 465);
const secure = SMTP_SECURE ? SMTP_SECURE === 'true' : port === 465;

const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

function buildHtml(code) {
  return `
  <div style="max-width:520px;margin:0 auto;padding:28px;border-radius:12px;background:#fff8ec;font-family:'Microsoft YaHei',Arial,sans-serif;color:#3a2c1c">
    <h2 style="margin:0 0 12px;font-size:20px">普骑屋 · 找回密码</h2>
    <p style="margin:0 0 18px;line-height:1.8;font-size:14px">你正在重置账号密码，本次验证码：</p>
    <p style="margin:0 0 18px;font-size:32px;font-weight:800;letter-spacing:8px;color:#c45d16">${code}</p>
    <p style="margin:0;line-height:1.8;font-size:13px;color:#7a6248">
      验证码 10 分钟内有效，只能使用一次。如果不是你本人操作，请忽略这封邮件，账号密码不会被修改。
    </p>
  </div>`;
}

/**
 * 发送验证码
 * @returns {Promise<{ delivered: boolean, reason?: string }>}
 */
async function sendResetCode(email, code) {
  if (!isConfigured) {
    // 开发模式：不真的发信，把验证码打到控制台，接口会回传 devCode
    console.log(`[mailer] 未配置 SMTP，验证码（仅本地调试可见）：${email} -> ${code}`);
    return { delivered: false, reason: 'smtp-not-configured' };
  }

  try {
    await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: email,
      subject: '【普骑屋】找回密码验证码',
      html: buildHtml(code)
    });
    return { delivered: true };
  } catch (err) {
    console.error('[mailer] 发送失败：', err.message);
    return { delivered: false, reason: err.message };
  }
}

module.exports = { sendResetCode, isConfigured };
