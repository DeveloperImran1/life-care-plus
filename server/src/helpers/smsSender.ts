import twilio from 'twilio';
import config from '../config';
import ApiError from '../app/errors/ApiError';
import httpStatus from 'http-status';

const accountSid = config.twilio.accountSid;
const authToken = config.twilio.authToken;
const twilioNumber = config.twilio.phoneNumber;

// Twilio Client Initialize করা হলো
const twilioClient = twilio(accountSid, authToken);

export const sendSMS = async (to: string, message: string) => {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: to,
    });
    console.log(`SMS Sent Successfully to ${to}. SID: ${response.sid}`);
    return response;
  } catch (error: any) {
    console.error('Failed to send SMS:', error);
    // Twilio থেকে আসা স্পেসিফিক এরর মেসেজ দেখানোর জন্য
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.message || 'Failed to send SMS message',
    );
  }
};
