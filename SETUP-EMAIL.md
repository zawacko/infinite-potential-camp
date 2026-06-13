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

> Until you paste in your endpoint, the **Confirm & Submit** button still shows
> the friendly "You're all set!" message — it just doesn't email anyone yet.
