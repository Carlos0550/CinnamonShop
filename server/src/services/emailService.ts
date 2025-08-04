import nodemailer from 'nodemailer';
import { config } from '@/config/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  private async loadTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      const templatePath = join(__dirname, '../templates/emails', `${templateName}.html`);
      let template = readFileSync(templatePath, 'utf-8');
      
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key]);
      });
      
      return template;
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  async sendWelcomeEmail(userEmail: string, userFirstName: string, generatedPassword: string): Promise<void> {
    try {
      const htmlContent = await this.loadTemplate('welcome', {
        userFirstName: userFirstName || 'Usuario',
        userEmail,
        generatedPassword,
        loginUrl: config.email.loginUrl,
        supportEmail: config.email.supportEmail,
        companyName: 'Cinnamon Shop'
      });

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to: userEmail,
        subject: '¡Bienvenido a Cinnamon Shop! 🎉',
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`❌ Error sending welcome email to ${userEmail}:`, error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${config.email.resetPasswordUrl}?token=${resetToken}`;
      
      const htmlContent = await this.loadTemplate('password-reset', {
        resetUrl,
        supportEmail: config.email.supportEmail,
        companyName: 'Cinnamon Shop'
      });

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to: userEmail,
        subject: 'Restablecer contraseña - Cinnamon Shop',
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`❌ Error sending password reset email to ${userEmail}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendOrderConfirmationEmail(userEmail: string, orderData: any): Promise<void> {
    try {
      const htmlContent = await this.loadTemplate('order-confirmation', {
        orderNumber: orderData.orderNumber,
        orderDate: orderData.orderDate,
        totalAmount: orderData.totalAmount,
        items: orderData.items,
        supportEmail: config.email.supportEmail,
        companyName: 'Cinnamon Shop'
      });

      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to: userEmail,
        subject: `Confirmación de pedido #${orderData.orderNumber} - Cinnamon Shop`,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`❌ Error sending order confirmation email to ${userEmail}:`, error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 