import nodemailer from "nodemailer";

// Email transporter setup
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "JelantahGO <noreply@jelantahgo.com>";

  if (!smtpUser || !smtpPass) {
    console.warn("⚠️ SMTP credentials not configured. Email sending will be disabled.");
    // Create a dummy transporter that won't actually send emails
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser || "dummy",
        pass: smtpPass || "dummy",
      },
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

// Email templates
export const emailTemplates = {
  orderCreated: (data: {
    customerName: string;
    orderNumber: string;
    pickupAddress: string;
    estimatedLiters?: number;
  }) => ({
    subject: `✅ Order Created: ${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info { margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Created Successfully!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.customerName},</p>
            <p>Your pickup order has been created successfully!</p>
            <div class="info">
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Pickup Address:</strong> ${data.pickupAddress}</p>
              ${data.estimatedLiters ? `<p><strong>Estimated Liters:</strong> ${data.estimatedLiters} L</p>` : ""}
            </div>
            <p>A courier will be assigned to your order shortly.</p>
            <p>Thank you for using JelantahGO!</p>
          </div>
          <div class="footer">
            <p>JelantahGO - Your trusted used cooking oil pickup service</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  courierAssigned: (data: {
    customerName: string;
    courierName: string;
    courierPhone: string;
    orderNumber: string;
    pickupAddress: string;
  }) => ({
    subject: `🚚 Courier Assigned: ${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info { margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Courier Assigned!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.customerName},</p>
            <p>A courier has been assigned to your order.</p>
            <div class="info">
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Courier Name:</strong> ${data.courierName}</p>
              <p><strong>Courier Phone:</strong> ${data.courierPhone}</p>
              <p><strong>Pickup Address:</strong> ${data.pickupAddress}</p>
            </div>
            <p>You can track your order in real-time and chat with the courier through the app.</p>
            <p>Thank you for using JelantahGO!</p>
          </div>
          <div class="footer">
            <p>JelantahGO - Your trusted used cooking oil pickup service</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  pickupCompleted: (data: {
    customerName: string;
    orderNumber: string;
    actualLiters: number;
  }) => ({
    subject: `✅ Pickup Completed: ${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info { margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pickup Completed!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.customerName},</p>
            <p>Your pickup order has been completed and verified at the warehouse.</p>
            <div class="info">
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Actual Liters Collected:</strong> ${data.actualLiters} L</p>
            </div>
            <p>Billing will be generated shortly based on the collected liters.</p>
            <p>Thank you for using JelantahGO!</p>
          </div>
          <div class="footer">
            <p>JelantahGO - Your trusted used cooking oil pickup service</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentReceived: (data: {
    customerName: string;
    orderNumber: string;
    billNumber: string;
    totalAmount: number;
  }) => ({
    subject: `💰 Payment Received: ${data.billNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info { margin: 10px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Received!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.customerName},</p>
            <p>Your payment has been received and confirmed.</p>
            <div class="info">
              <p><strong>Bill Number:</strong> ${data.billNumber}</p>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p class="amount">Total Amount: Rp ${data.totalAmount.toLocaleString("id-ID")}</p>
            </div>
            <p>Thank you for your payment!</p>
            <p>Thank you for using JelantahGO!</p>
          </div>
          <div class="footer">
            <p>JelantahGO - Your trusted used cooking oil pickup service</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  inactiveReminder: (data: {
    customerName: string;
    daysSinceLastOrder: number;
  }) => ({
    subject: `📬 We Miss You! Come Back to JelantahGO`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .info { margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>We Miss You!</h1>
          </div>
          <div class="content">
            <p>Hello ${data.customerName},</p>
            <p>It's been ${data.daysSinceLastOrder} days since your last pickup order.</p>
            <p>We'd love to help you dispose of your used cooking oil again!</p>
            <p>Schedule a pickup today and earn rewards.</p>
            <p>Thank you for using JelantahGO!</p>
          </div>
          <div class="footer">
            <p>JelantahGO - Your trusted used cooking oil pickup service</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from?: string
): Promise<boolean> {
  try {
    const transporter = getTransporter();
    const smtpFrom = from || process.env.SMTP_FROM || "JelantahGO <noreply@jelantahgo.com>";

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ Email not sent - SMTP not configured. Recipient:", to);
      return false;
    }

    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

// Helper functions for specific email types
export async function sendOrderCreatedEmail(data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  pickupAddress: string;
  estimatedLiters?: number;
}): Promise<boolean> {
  if (!data.customerEmail) return false;

  const template = emailTemplates.orderCreated(data);
  return await sendEmail(data.customerEmail, template.subject, template.html);
}

export async function sendCourierAssignedEmail(data: {
  customerEmail?: string;
  customerName: string;
  courierEmail?: string;
  courierName: string;
  courierPhone: string;
  orderNumber: string;
  pickupAddress: string;
}): Promise<{ customerSent: boolean; courierSent: boolean }> {
  const template = emailTemplates.courierAssigned(data);
  
  const customerSent = data.customerEmail
    ? await sendEmail(data.customerEmail, template.subject, template.html)
    : false;

  const courierSent = data.courierEmail
    ? await sendEmail(data.courierEmail, template.subject, template.html)
    : false;

  return { customerSent, courierSent };
}

export async function sendPickupCompletedEmail(data: {
  customerEmail?: string;
  customerName: string;
  courierEmail?: string;
  orderNumber: string;
  actualLiters: number;
}): Promise<{ customerSent: boolean; courierSent: boolean }> {
  const template = emailTemplates.pickupCompleted(data);
  
  const customerSent = data.customerEmail
    ? await sendEmail(data.customerEmail, template.subject, template.html)
    : false;

  const courierSent = data.courierEmail
    ? await sendEmail(data.courierEmail, template.subject, template.html)
    : false;

  return { customerSent, courierSent };
}

export async function sendPaymentReceivedEmail(data: {
  customerEmail?: string;
  customerName: string;
  courierEmail?: string;
  affiliateEmail?: string;
  orderNumber: string;
  billNumber: string;
  totalAmount: number;
}): Promise<{ customerSent: boolean; courierSent: boolean; affiliateSent: boolean }> {
  const template = emailTemplates.paymentReceived(data);
  
  const customerSent = data.customerEmail
    ? await sendEmail(data.customerEmail, template.subject, template.html)
    : false;

  const courierSent = data.courierEmail
    ? await sendEmail(data.courierEmail, template.subject, template.html)
    : false;

  const affiliateSent = data.affiliateEmail
    ? await sendEmail(data.affiliateEmail, template.subject, template.html)
    : false;

  return { customerSent, courierSent, affiliateSent };
}

export async function sendInactiveReminderEmail(data: {
  customerEmail: string;
  customerName: string;
  daysSinceLastOrder: number;
}): Promise<boolean> {
  if (!data.customerEmail) return false;

  const template = emailTemplates.inactiveReminder(data);
  return await sendEmail(data.customerEmail, template.subject, template.html);
}

