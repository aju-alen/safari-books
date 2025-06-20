# 📚 Audiobook App

Your personal gateway to a world of stories — listen, explore, and immerse yourself in audiobooks anytime, anywhere.

---

## 🎷 Overview

The **Audiobook App** is a React Native mobile app that provides a smooth and intuitive audiobook experience. It allows users to:

- Discover and browse audiobooks by category
- Stream or download audio
- Bookmark progress and resume where they left off
- Purchase premium content via RevenueCat and Apple In-App Purchases

---

## ✨ Features

- 🎵 **Stream & Download Audiobooks**
- 🔍 **Search by title, author, or category**
- 📀 **Offline Listening Support**
- 📌 **Bookmark Resume Points**
- ❤️ **Save Favorites**
- 💳 **In-App Purchases** with RevenueCat
- 🌙 **Dark and Light Mode Support**
- 🔐 **Secure Auth (OAuth Ready)**

---

## 💦 Tech Stack

- **Frontend**: React Native (Expo), TypeScript
- **State Management**: Zustand, AsyncStorage
- **Payments**: RevenueCat + Apple In-App Purchases
- **Backend**: Node.js
- **Styling**: Tailwind + Custom UI
- **Fonts**: Clash Grotesk, Roboto, Noto

---

## 📦 Installation

```bash
# Clone the repository
cd client


# Install dependencies
npm install

# Start the app with Expo
npx expo start -c
```

---

## 🔐 Environment Setup

Create a `.env` file in your project root:

```
REVENUECAT_PUBLIC_KEY=your_revenuecat_key
APPLE_BUNDLE_ID=your.ios.bundle.id
FIREBASE_API_KEY=your_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Add your `.env` values to your `app.config.js` or use `expo-constants`.

---

## 🖼️ Screenshots

| Home | Player | Library |
|------|--------|---------|
| ![Home](screenshots/home.png) | ![Player](screenshots/player.png) | ![Library](screenshots/library.png) |

_(Add your screenshots to a `screenshots/` folder)_

---

## 🧪 Testing

```bash
# Run unit tests (if configured)
npm test
```

Recommend: Jest (unit), Detox (e2e), React Native Testing Library (components)

---

## 🚀 Roadmap

- [x] Audiobook playback
- [x] Purchase flow with RevenueCat
- [x] Bookmark resume feature
- [ ] Background playback support
- [ ] Social sharing & referrals
- [ ] User profiles
- [ ] Admin dashboard for content upload

---

## 🧑‍💼 Contributing

Want to contribute?

1. Fork the repo
2. Create a new branch `git checkout -b feature/feature-name`
3. Commit your changes
4. Push to your fork and submit a PR

---

## 📄 License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for more.

---

## 🙏 Acknowledgements

- [RevenueCat](https://www.revenuecat.com/)
- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Unsplash](https://unsplash.com) for placeholder images

---

## 👤 Author

**Your Name**  
📧 your@email.com  
🌐 [yourwebsite.com](https://yourwebsite.com)  
💼 [LinkedIn](https://linkedin.com/in/yourprofile)

---

> _“The only thing you absolutely have to know is the location of the library.” – Albert Einstein_
