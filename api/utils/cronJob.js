// cronJobs/notificationJob.ts
import cron from 'node-cron';

export const startNotificationCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Cron job started');
    // const users = await getUsersWithUnfinishedBooks();

    // for (const user of users) {
    //   await sendPushNotification(user.pushToken, {
    //     title: "Keep reading!",
    //     body: `You still have unfinished books waiting for you 📖`,
    //   });
    // }
  }
);
};
