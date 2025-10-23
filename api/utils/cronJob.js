// cronJobs/notificationJob.ts
import cron from 'node-cron';
import { getUsersWithUnfinishedBooks, cleanupOldIncompleteRegistrations } from './cronFunctions.js';
import { sendPushNotification } from './expoPushNotif.js';

export const startNotificationCron = () => {
  // Daily bedtime reminder at 5 PM
  cron.schedule('0 17 * * *', async () => {
    console.log('Bedtime reminder cron job ran');
    const users = await getUsersWithUnfinishedBooks();

    if (users.length > 0) {
        console.log('Users found for bedtime reminder');
        for (const user of users) {
            await sendPushNotification(user, {
                title: "Ready for bedtime?",
                body: `You have unfinished books waiting for you. 📖`,
                data: {
                    type: "bedtime_reminder"
                }
            });
        }
    }
    else {
        console.log('No users found for bedtime reminder');
    }
  });

  // Cleanup incomplete registrations after 1 day - runs daily at 12am
  cron.schedule('0 0 * * *', async () => {
    console.log('Incomplete registration cleanup cron job ran');
    
    try {
      const cleanupResult = await cleanupOldIncompleteRegistrations(); 
      console.log(`Cleaned up ${cleanupResult.deletedCompanies} companies and ${cleanupResult.deletedAuthors} authors`);
    } catch (error) {
      console.error('Error in cleanup cron job:', error);
    }
  });
};
