import cron from 'node-cron';
import prisma from '../../../shared/prisma';
import { sendSMS } from '../../../helpers/smsSender';

const checkAndSendAppointmentReminders = () => {
  // '0 8 * * *' মানে প্রতিদিন সকাল ৮ টায় রান হবে।
  // (টেস্টিংয়ের সময় আপনি চাইলে '* * * * *' দিতে পারেন, যা প্রতি ১ মিনিট পরপর রান হবে)
  //   cron.schedule('0 8 * * *', async () => {
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Cron Job Started: Checking for upcoming appointments...');

      const tomorrow = new Date();
      //   tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setDate(tomorrow.getDate() + 100);

      // আগামীকালের শুরু এবং শেষের সময় বের করা
      //   const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const startOfTomorrow = new Date();
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          status: 'SCHEDULED',
          schedule: {
            startDateTime: {
              gte: startOfTomorrow,
              lte: endOfTomorrow,
            },
          },
        },
        include: {
          patient: true,
          doctor: true,
          schedule: true,
        },
      });

      for (const appointment of upcomingAppointments) {
        if (appointment?.patient?.contactNumber) {
          // সুন্দর একটি মেসেজ বডি তৈরি করা
          const message = `Hello ${appointment.patient.name}, this is a reminder for your appointment with Dr. ${appointment.doctor.name} scheduled for tomorrow at ${appointment.schedule.startDateTime.toLocaleTimeString()}.`;

          await sendSMS(appointment.patient.contactNumber, message);
        }
      }

      console.log(`Cron Job Finished: Sent ${upcomingAppointments.length} reminders.`);
    } catch (error) {
      console.error('Error running appointment reminder cron job:', error);
    }
  });
};

export const AppointmentCron = {
  checkAndSendAppointmentReminders,
};
