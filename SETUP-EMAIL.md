# 📬 Make the registration form email you

The form is ready to send real registrations to your inbox. You just need a free
**Formspree** endpoint. Takes about 3 minutes.

## Steps

1. Go to **https://formspree.io** and click **Sign up** (the free plan is fine —
   it allows 50 submissions per month).
2. Verify your email, then click **+ New Form**.
3. Name it something like `Camp Registrations` and set the email where you want
   registrations delivered (e.g. your real camp Gmail).
4. Formspree shows you a **form endpoint URL** that looks like:

   ```
   https://formspree.io/f/abcdwxyz
   ```

   Copy it.

5. Open **`script.js`** and find this line near the registration section
   (around line 70):

   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_ID';
   ```

   Replace the whole URL with **your** endpoint, e.g.:

   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
   ```

6. Save the file. Copy the updated `script.js` into the `publish` folder (or ask
   me to refresh it), then re-deploy by dragging the `publish` folder onto
   **https://app.netlify.com/drop** (or your site's Deploys tab).

## Test it

- The **first** real submission triggers a Formspree confirmation email to you —
  click the link in it to activate the form. After that, every registration
  (with the camper info and total price) arrives in your inbox automatically.

## What gets emailed

Parent/guardian name, email, camper name, grade, program, the weeks chosen,
number of weeks, weekly price, the estimated total, and any notes.

## Send a confirmation copy to the parent (Autoresponse)

The form already sends the parent's address to Formspree as the reply-to, so a
confirmation can go straight back to them. To turn it on:

1. In your Formspree dashboard, open your form → **Plugins** (or **Settings**) →
   **Autoresponse**.
2. Toggle it **on**, set the **subject** to something like
   `You're all set for our Free Trial Camp! 🎉`, and paste this message:

   > Hello!
   >
   > Thank you for registering for the Infinite Potential Math free trial camp —
   > you're all set! 🎉
   >
   > Here are the details:
   > • Date: Wednesday, November 11, 2026 (Veterans Day)
   > • Time: 9:00 AM – 3:30 PM
   > • Location: 1728 Joel Way
   > • Cost: Free! (a $10 donation is appreciated but completely optional)
   >
   > Please bring pencils, an eraser, a ruler, and a water bottle — and a computer
   > or tablet is strongly recommended. Get ready for a day packed with math,
   > games, and fun!
   >
   > If you have any questions, just reply to this email. See you on Veterans Day!
   >
   > — The Infinite Potential Math Team

3. Save. Now every family gets an instant confirmation email after they submit.

> Note: Autoresponse availability depends on your Formspree plan. If you don't
> see the option on the free plan, you can still reply to any registration and
> it will go straight to the parent (thanks to the reply-to we set up).

> Until you paste in your endpoint, the **Confirm & Submit** button still shows
> the friendly "You're all set!" message — it just doesn't email anyone yet.
