import fetch from 'node-fetch';

export const sendPushNotification = async (expoPushToken, message) => {
    console.log(expoPushToken, message);
  const body = {
    to: expoPushToken,
    sound: 'default',
    title: message.title,
    body: message.body,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};