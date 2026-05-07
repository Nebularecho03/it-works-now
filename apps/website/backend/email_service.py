"""
Email service for sending emails using free SMTP stack
Supports Gmail, Outlook, and custom SMTP servers
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.utils import formataddr
import json
import os
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    """Free email service using Python's built-in smtplib"""
    
    def __init__(self):
        self.settings = self.load_settings()
    
    def load_settings(self):
        """Load email settings from database"""
        try:
            import sqlite3
            conn = sqlite3.connect('messages.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM email_settings WHERE enabled = 1 LIMIT 1
            ''')
            
            settings_row = cursor.fetchone()
            conn.close()
            
            if settings_row:
                return dict(settings_row)
            else:
                return self.get_default_settings()
                
        except Exception as e:
            logger.error(f"Failed to load email settings: {e}")
            return self.get_default_settings()
    
    def get_default_settings(self):
        """Get default email settings"""
        return {
            'provider': 'none',
            'smtp_host': '',
            'smtp_port': 587,
            'smtp_username': '',
            'smtp_password': '',
            'smtp_use_tls': True,
            'gmail_client_id': '',
            'gmail_client_secret': '',
            'gmail_refresh_token': '',
            'outlook_client_id': '',
            'outlook_client_secret': '',
            'outlook_refresh_token': '',
            'from_email': 'noreply@stephenasatsa.com',
            'from_name': 'Dr. Stephen Asatsa',
            'reply_to_email': 'admin@stephenasatsa.com',
            'enabled': False
        }
    
    def test_connection(self):
        """Test email connection"""
        if not self.settings.get('enabled'):
            return {"success": False, "error": "Email service is not enabled"}
        
        provider = self.settings.get('provider')
        
        try:
            if provider == 'gmail':
                return self._test_gmail_connection()
            elif provider == 'outlook':
                return self._test_outlook_connection()
            elif provider == 'smtp':
                return self._test_smtp_connection()
            else:
                return {"success": False, "error": "No email provider configured"}
                
        except Exception as e:
            logger.error(f"Email connection test failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _test_smtp_connection(self):
        """Test SMTP connection"""
        try:
            server = smtplib.SMTP(self.settings['smtp_host'], self.settings['smtp_port'])
            
            if self.settings['smtp_use_tls']:
                server.starttls()
            
            server.login(self.settings['smtp_username'], self.settings['smtp_password'])
            server.quit()
            
            return {"success": True, "message": "SMTP connection successful"}
            
        except Exception as e:
            return {"success": False, "error": f"SMTP connection failed: {str(e)}"}
    
    def _test_gmail_connection(self):
        """Test Gmail SMTP connection"""
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(self.settings['smtp_username'], self.settings['smtp_password'])
            server.quit()
            
            return {"success": True, "message": "Gmail connection successful"}
            
        except Exception as e:
            return {"success": False, "error": f"Gmail connection failed: {str(e)}"}
    
    def _test_outlook_connection(self):
        """Test Outlook SMTP connection"""
        try:
            server = smtplib.SMTP('smtp-mail.outlook.com', 587)
            server.starttls()
            server.login(self.settings['smtp_username'], self.settings['smtp_password'])
            server.quit()
            
            return {"success": True, "message": "Outlook connection successful"}
            
        except Exception as e:
            return {"success": False, "error": f"Outlook connection failed: {str(e)}"}
    
    def send_email(self, to_email, subject, html_content, from_email=None, from_name=None):
        """Send email using configured provider"""
        if not self.settings.get('enabled'):
            logger.warning("Email service is not enabled")
            return {"success": False, "error": "Email service is not enabled"}
        
        try:
            provider = self.settings.get('provider')
            
            if provider == 'gmail':
                return self._send_via_gmail(to_email, subject, html_content, from_email, from_name)
            elif provider == 'outlook':
                return self._send_via_outlook(to_email, subject, html_content, from_email, from_name)
            elif provider == 'smtp':
                return self._send_via_smtp(to_email, subject, html_content, from_email, from_name)
            else:
                return {"success": False, "error": "No email provider configured"}
                
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return {"success": False, "error": str(e)}
    
    def _send_via_smtp(self, to_email, subject, html_content, from_email=None, from_name=None):
        """Send email via custom SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = formataddr((from_name or self.settings['from_name'], from_email or self.settings['from_email']))
            msg['To'] = to_email
            
            # Attach HTML content
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            server = smtplib.SMTP(self.settings['smtp_host'], self.settings['smtp_port'])
            
            if self.settings['smtp_use_tls']:
                server.starttls()
            
            server.login(self.settings['smtp_username'], self.settings['smtp_password'])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent via SMTP to {to_email}")
            return {"success": True, "message": "Email sent successfully"}
            
        except Exception as e:
            logger.error(f"SMTP send failed: {e}")
            return {"success": False, "error": f"SMTP send failed: {str(e)}"}
    
    def _send_via_gmail(self, to_email, subject, html_content, from_email=None, from_name=None):
        """Send email via Gmail SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = formataddr((from_name or self.settings['from_name'], from_email or self.settings['from_email']))
            msg['To'] = to_email
            
            # Attach HTML content
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(self.settings['smtp_username'], self.settings['smtp_password'])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent via Gmail to {to_email}")
            return {"success": True, "message": "Email sent successfully"}
            
        except Exception as e:
            logger.error(f"Gmail send failed: {e}")
            return {"success": False, "error": f"Gmail send failed: {str(e)}"}
    
    def _send_via_outlook(self, to_email, subject, html_content, from_email=None, from_name=None):
        """Send email via Outlook SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = formataddr((from_name or self.settings['from_name'], from_email or self.settings['from_email']))
            msg['To'] = to_email
            
            # Attach HTML content
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            server = smtplib.SMTP('smtp-mail.outlook.com', 587)
            server.starttls()
            server.login(self.settings['smtp_username'], self.settings['smtp_password'])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent via Outlook to {to_email}")
            return {"success": True, "message": "Email sent successfully"}
            
        except Exception as e:
            logger.error(f"Outlook send failed: {e}")
            return {"success": False, "error": f"Outlook send failed: {str(e)}"}
    
    def send_new_message_notification(self, user_data, message_data):
        """Send new message notification to admin"""
        if not self.settings.get('enabled'):
            return {"success": False, "error": "Email notifications are disabled"}
        
        try:
            from email_templates import render_new_message_notification
            html_content = render_new_message_notification(user_data, message_data)
            
            subject = f"New Message from {user_data.get('full_name', user_data['email'])}"
            
            result = self.send_email(
                to_email=self.settings['reply_to_email'],
                subject=subject,
                html_content=html_content,
                from_email=self.settings['from_email'],
                from_name=self.settings['from_name']
            )
            
            if result['success']:
                logger.info(f"New message notification sent to {self.settings['reply_to_email']}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to send new message notification: {e}")
            return {"success": False, "error": str(e)}
    
    def send_message_reply_notification(self, user_data, reply_data):
        """Send message reply notification to user"""
        if not self.settings.get('enabled'):
            return {"success": False, "error": "Email notifications are disabled"}
        
        try:
            from email_templates import render_message_reply_notification
            html_content = render_message_reply_notification(user_data, reply_data)
            
            subject = f"Reply to Your Message - {reply_data.get('original_subject', 'No Subject')}"
            
            result = self.send_email(
                to_email=user_data['email'],
                subject=subject,
                html_content=html_content,
                from_email=self.settings['from_email'],
                from_name=self.settings['from_name']
            )
            
            if result['success']:
                logger.info(f"Message reply notification sent to {user_data['email']}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to send message reply notification: {e}")
            return {"success": False, "error": str(e)}
    
    def send_welcome_email(self, user_data):
        """Send welcome email to new user"""
        if not self.settings.get('enabled'):
            return {"success": False, "error": "Email notifications are disabled"}
        
        try:
            from email_templates import render_welcome_email
            html_content = render_welcome_email(user_data)
            
            subject = "Welcome to Stephen Asatsa Website!"
            
            result = self.send_email(
                to_email=user_data['email'],
                subject=subject,
                html_content=html_content,
                from_email=self.settings['from_email'],
                from_name=self.settings['from_name']
            )
            
            if result['success']:
                logger.info(f"Welcome email sent to {user_data['email']}")
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")
            return {"success": False, "error": str(e)}
