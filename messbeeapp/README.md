# MessBee Mobile App (React Native + Expo)

Figma-exact mobile application for **MessBee**, connected to the existing Express/MongoDB backend (`d:\Messbee\server`).

---

## 📱 Features & Screens Implemented (Figma 1:1)

1. **Onboarding & Splash Flow**
   - `SplashScreen`: Brand green gradient with Messbee logo.
   - `OnboardingScreen`: 3 swipeable presentation cards (*Connect with Customers*, *Automate Your Conversations*, *Grow with MessBee*) with animated pill indicators.

2. **Authentication Flow**
   - `LoginScreen`: Dark forest green header + white card with Email / Phone Number tabs, Country code selector (+91), and "Send OTP" button.
   - `OtpVerificationScreen`: 6 individual auto-advancing OTP digit boxes, countdown timer, and Resend Code action.
   - `PhoneVerifiedSuccessScreen`: Animated green check badge with auto-redirection to the main application.

3. **Bottom Navigation (4 Main Tabs)**
   - **Home Tab** (`HomeScreen`):
     - Search header with logo & profile shortcut.
     - Top business banner.
     - 4 Quick Action cards: *New Chat*, *Contacts*, *Quick Replies*, *Templates*.
     - Business Tools row: *Campaigns*, *Automation*, *Analytics*, *Commerce*, *Inventory*.
     - Filter chips: *Unread Messages*, *Follow-ups*, *My Campaigns*.
     - Dark green "Your business copilot" AI resource card with "Ask >" action.
     - Horizontal "People" avatar carousel.
     - "Recent Chats" list with status indicators & unread counters.
   - **Chats Tab** (`ChatsScreen`):
     - Filter tabs: *All*, *Unread*, *Groups*, *Broadcast*, *Starred*.
     - Contact rows with color initials, status badges (*VIP Lead*, *Customer*, etc.), unread badge.
     - Floating Action Button (+) for starting new conversations.
   - **Chat Detail Screen** (`ChatDetailScreen`):
     - Top contact bar with online status & call action.
     - WhatsApp-style message bubbles (incoming/outgoing).
     - Automated Template Message preview cards.
     - Quick Replies shortcut pills.
     - Media attachment & voice/send message bar.
   - **Contacts CRM Tab** (`ContactsScreen`):
     - Contact list with tags, phone numbers, and direct chat actions.
   - **You / Settings Tab** (`ProfileScreen`):
     - User business card, WhatsApp Business number connection status, templates, team members, and logout.

---

## 🚀 How to Run the Mobile App

1. Open a terminal and navigate to `messbeeapp`:
   ```bash
   cd d:\Messbee\messbeeapp
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. **To run on your Phone (No setup needed):**
   - Download the free **Expo Go** app from Google Play Store or Apple App Store.
   - Scan the QR code shown in your terminal with your phone camera or the Expo Go app.

4. **To run on Web browser:**
   - Press `w` in the terminal to view in your web browser.

5. **To run on Android Emulator:**
   - Press `a` in the terminal.

