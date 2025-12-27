// lib/nodemailer/index.ts
import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE } from '@/lib/nodemailer/templates';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    },
});

export type WelcomeEmailData = {
    email: string;
    name: string;
    intro: string;
};

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData): Promise<void> => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"MoneyMint" <dishachoubey01@gmail.com>`,
        to: email,
        subject: `Welcome to MoneyMint - your stock market toolkit is ready!`,
        text: 'Thanks for joining MoneyMint',
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Signalist News" <signalist@jsmastery.pro>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from MoneyMint`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export type UserNewsSummary = {
    user: { email: string };
    newsContent?: string | null;
};

export type StepRunner = {
    run: (name: string, fn: () => Promise<void>) => Promise<void>;
};

export const sendNewsEmailsStep = async (
    userNewsSummaries: UserNewsSummary[],
    formatDateToday: string,
    step?: StepRunner
): Promise<{ success: boolean; message: string }> => {
    const sendAll = async () => {
        await Promise.all(
            userNewsSummaries.map(async ({ user, newsContent }) => {
                if (!newsContent) return false;
                return await sendNewsSummaryEmail({
                    email: user.email,
                    date: formatDateToday,
                    newsContent,
                });
            })
        );
    };

    try {
        if (step && typeof step.run === 'function') {
            await step.run('send-news-emails', sendAll);
        } else {
            await sendAll();
        }

        return { success: true, message: 'Daily news summary emails sent successfully' };
    } catch (err) {
        return { success: false, message: `Failed to send news summary emails: ${(err as Error).message}` };
    }
};
