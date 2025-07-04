// cronJobs/notificationJob.ts
import cron from 'node-cron';
import { getUsersWithUnfinishedBooks } from './cronFunctions.js';
import { sendPushNotification } from './expoPushNotif.js';

export const startNotificationCron = () => {
  cron.schedule('0 21 * * *', async () => {
    console.log('Cron job ran');
    const users = await getUsersWithUnfinishedBooks();

    if (users.length > 0) {
        console.log('Users found');
        for (const user of users) {
            await sendPushNotification(user, {
                title: "Ready for bedtime?",
                body: `You have unfinished books waiting for you.  📖`,
            });
        }
    }
    else {
        console.log('No users found');
    }
  }
);
};
