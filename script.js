// ===== Scroll reveal: disabled =====
// (Cards no longer slide in from the side; everything shows normally.)

// ===== Week picker buttons =====
const weekButtons = document.getElementById('weekButtons');
const weeksField = document.getElementById('weeksField');
if (weekButtons && weeksField) {
  weekButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.week-btn');
    if (!btn) return;
    btn.classList.toggle('is-selected');
    btn.setAttribute('aria-pressed', btn.classList.contains('is-selected'));
    const selected = [...weekButtons.querySelectorAll('.week-btn.is-selected')]
      .map((b) => b.dataset.week);
    weeksField.value = selected.join(', ');
  });
}

// ===== Registration form =====
// Step 1: fill out the form. "Next Step" validates and shows a review.
// Step 2: "Check Your Information" review with the total price.
// To receive submissions, connect this to an email service
// (e.g. Formspree, Google Forms, or your own backend).
// ⬇️ PASTE YOUR FORMSPREE ENDPOINT HERE (see the README / instructions).
// It looks like: https://formspree.io/f/abcdwxyz
// Until you replace YOUR_ID, the Confirm button just shows a demo message.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqeodbde';

// Valid family discount code: 25% off + free lunch. Case-insensitive.
const FAMILY_CODE = 'IP2027FAM';

// Format a dollar amount (drop ".00" for whole numbers).
function money(n) {
  return '$' + n.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const form = document.getElementById('regForm');
const msg = document.getElementById('formMsg');
const reviewPanel = document.getElementById('reviewPanel');
const reviewList = document.getElementById('reviewList');
const totalAmount = document.getElementById('totalAmount');
const editBtn = document.getElementById('editBtn');
const confirmBtn = document.getElementById('confirmBtn');
const registerSection = document.getElementById('register');

// Holds the latest reviewed registration so Confirm can send it.
let pendingData = null;

function selectedWeekCount() {
  return weekButtons
    ? weekButtons.querySelectorAll('.week-btn.is-selected').length
    : 0;
}

function scrollToRegister() {
  registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Step 1 -> Step 2: validate, then show the review screen.
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    msg.style.color = '#ff5da2';
    msg.textContent = 'Please fill out all required fields. 📝';
    form.reportValidity();
    return;
  }

  const weekCount = selectedWeekCount();
  if (weekCount === 0) {
    msg.style.color = '#ff5da2';
    msg.textContent = 'Please pick at least one week. 📅';
    return;
  }
  msg.textContent = '';

  // Listed weekly price (pulled from the chosen program).
  const program = form.program.value;
  const priceMatch = program.match(/\$(\d+)/);
  const listedWeekly = priceMatch ? parseInt(priceMatch[1], 10) : 0;

  // Family discount code: 25% off + free lunch when valid.
  const codeEntered = form.discountCode.value.trim();
  const familyApplied = codeEntered.toUpperCase() === FAMILY_CODE;

  // With the family discount, lunch is free — so charge the base (no-lunch)
  // rate, then take 25% off.
  const baseWeekly = /Full Day/i.test(program) ? 225 : 150;
  const weekly = familyApplied ? baseWeekly * 0.75 : listedWeekly;
  const total = weekly * weekCount;

  let codeStatus = '';
  if (familyApplied) {
    codeStatus = `✅ ${FAMILY_CODE} applied — 25% off + free lunch`;
  } else if (codeEntered) {
    codeStatus = `⚠️ "${codeEntered}" isn't a valid code — no discount applied`;
  }

  pendingData = {
    'Parent / Guardian': form.parent.value,
    Email: form.email.value,
    Camper: form.camper.value,
    Grade: form.grade.value,
    Program: program,
    Weeks: weeksField.value,
    'Number of weeks': weekCount,
    'Weekly price': money(weekly),
    'Family discount code': codeEntered || '—',
    'Discount applied': familyApplied ? 'Yes — 25% off + free lunch' : 'No',
    'Estimated total': money(total),
    Notes: form.notes.value.trim() || '—',
    _subject: `Camp registration: ${form.camper.value} (${money(total)})`,
  };

  const rows = [
    ['Parent / Guardian', form.parent.value],
    ['Email', form.email.value],
    ['Camper', form.camper.value],
    ['Grade', form.grade.value],
    ['Program', program],
    ['Weeks', `${weeksField.value}  ·  ${weekCount} week${weekCount > 1 ? 's' : ''} × ${money(weekly)}`],
  ];
  if (codeEntered) rows.push(['Family discount code', `${codeEntered}  ·  ${codeStatus}`]);
  if (form.notes.value.trim()) rows.push(['Notes', form.notes.value.trim()]);

  // Build the review list safely with textContent (no HTML injection).
  reviewList.innerHTML = '';
  rows.forEach(([label, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    reviewList.append(dt, dd);
  });

  totalAmount.textContent = money(total);

  form.hidden = true;
  reviewPanel.hidden = false;
  scrollToRegister();
});

// Step 2 -> Step 1: go back and edit.
editBtn.addEventListener('click', () => {
  reviewPanel.hidden = true;
  form.hidden = false;
  scrollToRegister();
});

// Show the final "You're all set!" screen.
function showDone(camper) {
  const done = document.createElement('div');
  done.className = 'review-done';

  const emoji = document.createElement('div');
  emoji.className = 'done-emoji';
  emoji.textContent = '🎉';

  const heading = document.createElement('h3');
  heading.textContent = "You're all set!";

  const text = document.createElement('p');
  text.textContent = `Thanks! We received the registration for ${camper} and will email you to confirm the details and arrange payment.`;

  done.append(emoji, heading, text);
  reviewPanel.innerHTML = '';
  reviewPanel.append(done);
  scrollToRegister();
}

// Step 2 -> submit to Formspree (or show a demo message if not set up yet).
confirmBtn.addEventListener('click', async () => {
  const camper = form.camper.value.trim() || 'your camper';

  // Not connected yet: keep the friendly demo confirmation.
  if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('YOUR_ID')) {
    showDone(camper);
    return;
  }

  confirmBtn.disabled = true;
  editBtn.disabled = true;
  confirmBtn.textContent = 'Sending…';

  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(pendingData),
    });

    if (res.ok) {
      showDone(camper);
      form.reset();
      weekButtons.querySelectorAll('.week-btn.is-selected')
        .forEach((b) => b.classList.remove('is-selected'));
      weeksField.value = '';
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    confirmBtn.disabled = false;
    editBtn.disabled = false;
    confirmBtn.textContent = 'Confirm & Submit';
    let errMsg = reviewPanel.querySelector('.submit-error');
    if (!errMsg) {
      errMsg = document.createElement('p');
      errMsg.className = 'submit-error';
      reviewPanel.append(errMsg);
    }
    errMsg.textContent = '😕 Sorry, something went wrong sending that. Please try again, or email us directly.';
  }
});
