# Getting Started Checklist

This checklist will guide you through setting up and testing your TimiTime app.

## ✅ Setup Checklist

### 1. Supabase Backend Setup
- [ ] Create a Supabase account at https://supabase.com
- [ ] Create a new Supabase project
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Copy and run the SQL from `SUPABASE_SETUP.md` (Create tasks table section)
- [ ] Verify the `tasks` table was created in the Table Editor
- [ ] Go to Authentication > Providers
- [ ] Ensure Email provider is enabled

### 2. Get API Credentials
- [ ] Go to Project Settings > API in Supabase dashboard
- [ ] Copy your Project URL
- [ ] Copy your anon/public key (not the secret key!)

### 3. Configure the App
- [ ] Create a `.env` file in the project root
- [ ] Copy contents from `.env.example` to `.env`
- [ ] Replace `your-supabase-url` with your actual Project URL
- [ ] Replace `your-supabase-anon-key` with your actual anon key
- [ ] Save the `.env` file

### 4. Install and Run
- [ ] Run `npm install` (if you haven't already)
- [ ] Run `npm start` to start the development server
- [ ] Choose your platform:
  - Press `i` for iOS simulator
  - Press `a` for Android emulator
  - Scan QR code with Expo Go app on your phone

## ✅ Testing Checklist

### Authentication
- [ ] Sign up with a new email and password
- [ ] Check your email for verification (if enabled)
- [ ] Sign out
- [ ] Sign in with the same credentials
- [ ] Verify you're automatically logged in on app restart

### Task Management
- [ ] Tap "+ Add" button
- [ ] Create a task with:
  - Title: "Test Task"
  - Duration: 15
  - Due Date: Tomorrow's date in YYYY-MM-DD format
  - Flexibility: Medium
- [ ] Verify the task appears in the list
- [ ] Create 2-3 more tasks with different durations (5, 10, 30 minutes)

### Task Filtering
- [ ] Tap "🔍 Find Tasks" button
- [ ] Enter "20" for 20 minutes
- [ ] Tap "Find Tasks"
- [ ] Verify only tasks ≤ 20 minutes are shown
- [ ] Tap the blue banner at the top to show all tasks
- [ ] Try quick filter buttons (5, 10, 15, 30, 60 min)

### Task Completion
- [ ] Tap a task to mark it complete
- [ ] Verify it shows with strikethrough and reduced opacity
- [ ] Tap it again to mark incomplete
- [ ] Verify it returns to normal appearance

### Navigation
- [ ] Tap Calendar tab - verify placeholder shows
- [ ] Tap Settings tab - verify your email is displayed
- [ ] Tap Back to Tasks tab

### Sign Out
- [ ] Go to Settings tab
- [ ] Tap "Sign Out" button
- [ ] Confirm in the dialog
- [ ] Verify you're redirected to login screen

## ✅ Database Verification

In Supabase dashboard:
- [ ] Go to Table Editor
- [ ] Click on `tasks` table
- [ ] Verify your test tasks are listed
- [ ] Check that `user_id` matches your user ID from Authentication > Users

## ✅ EAS Updates Verification

If you have EAS configured:
- [ ] Make a small change (e.g., change "Tasks" title to "My Tasks" in `app/(tabs)/index.tsx`)
- [ ] Commit and push to main branch
- [ ] Wait for the EAS workflow to complete
- [ ] Open the app and verify it updates automatically

## 🐛 Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has correct values
- Ensure variables start with `EXPO_PUBLIC_`
- Restart the Expo dev server (`npm start`)

### Authentication not working
- Check Supabase > Authentication > Providers is enabled
- Check Supabase logs for errors
- Verify you're using the anon key, not the service role key

### Tasks not loading
- Verify the SQL schema was run correctly
- Check Supabase > Table Editor to ensure `tasks` table exists
- Check RLS policies are enabled
- Look in Supabase logs for errors

### App crashes on startup
- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for any console errors

## 📚 Next Steps

Once everything is working:

1. **Customize the App**
   - Update colors in `constants/theme.ts`
   - Modify app name in `app.json`
   - Add custom icons

2. **Implement Calendar**
   - Replace `app/(tabs)/calendar.tsx` with calendar view
   - Show tasks on their due dates

3. **Enhance Settings**
   - Add profile editing
   - Add preferences (notifications, default flexibility, etc.)
   - Add about/help sections

4. **Add Features**
   - Task categories/tags
   - Recurring tasks
   - Task notes/descriptions
   - Reminders/notifications
   - Statistics/analytics

5. **Deploy**
   - Create development builds: `npm run development-builds`
   - Test thoroughly
   - Deploy to production: `npm run deploy`

## 🎉 You're All Set!

If you completed all checkboxes, congratulations! Your TimiTime app is ready to help you manage your time effectively.

For questions or issues, refer to:
- `README.md` - Project overview
- `SUPABASE_SETUP.md` - Database details
- `IMPLEMENTATION.md` - Technical details
- `UI_STRUCTURE.md` - UI documentation

Happy time managing! ⏰✨
