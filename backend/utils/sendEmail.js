const nodemailer = require('nodemailer');
const { welcomeEmail, otpEmail, resendOtpEmail, passwordResetEmail, passwordChangedEmail, roleChangeEmail } = require('./emailTemplates');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'myusman137@gmail.com', // Replace with environment variable in production
        pass: 'hvnqfgiaiamyskui' // Replace with environment variable in production
    }
});

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: '"ADUSTECH" <myusman137@gmail.com>',
            to: email,
            subject: '🎉 Welcome to ADUSTECH - Let\'s Get Started!',
            html: welcomeEmail(name, email)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error };
    }
};

// Send OTP Email
const sendOtpEmail = async (email, name, otp) => {
    try {
        const mailOptions = {
            from: '"ADUSTECH" <myusman137@gmail.com>',
            to: email,
            subject: '🔐 Your ADUSTECH Verification Code',
            html: otpEmail(name, otp)
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error };
    }
};

// Send Resend OTP Email
const sendResendOtpEmail = async (email, name, otp) => {
    try {
        const mailOptions = {
            from: '"ADUSTECH" <myusman137@gmail.com>',
            to: email,
            subject: '🔄 Your New ADUSTECH Verification Code',
            html: resendOtpEmail(name, otp)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Resend OTP email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending resend OTP email:', error);
        return { success: false, error };
    }
};

// Send Password Reset Email
const sendPasswordResetEmail = async (email, name, resetToken) => {
    try {
        const mailOptions = {
            from: '"ADUSTECH" <myusman137@gmail.com>',
            to: email,
            subject: '🔑 Reset Your ADUSTECH Password',
            html: passwordResetEmail(name, resetToken, email)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error };
    }
};

// Send Password Changed Confirmation Email
const sendPasswordChangedEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: '"ADUSTECH" <myusman137@gmail.com>',
            to: email,
            subject: '✅ Your ADUSTECH Password Has Been Changed',
            html: passwordChangedEmail(name, email)
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password changed confirmation email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending password changed email:', error);
        return { success: false, error };
    }
};

// Send Role Change Notification
const sendRoleChangeEmail = async (email, name, previousRole, newRole) => {
    try {
        const mailOptions = {
            from: '"ADUSTECH" <myusman137@gmail.com>',
            to: email,
            subject: `👤 Your ADUSTECH Role Changed: ${previousRole || 'user'} → ${newRole}`,
            html: roleChangeEmail(name, email, previousRole, newRole)
        };
        await transporter.sendMail(mailOptions);
        console.log(`Role change email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending role change email:', error);
        return { success: false, error };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendOtpEmail,
    sendResendOtpEmail,
    sendPasswordResetEmail,
    sendPasswordChangedEmail,
    sendRoleChangeEmail
};
