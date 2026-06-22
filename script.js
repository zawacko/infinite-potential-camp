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
const regType = document.getElementById('regType');
const summerFields = document.getElementById('summerFields');
const programSelect = document.getElementById('programSelect');
const totalLabel = document.getElementById('totalLabel');

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

// Show the summer-only fields only when "Summer Camp" is chosen.
// (Summer is locked for now, so this stays on the Free Trial.)
function updateRegType() {
  const summer = regType && regType.value === 'summer';
  if (summerFields) summerFields.hidden = !summer;
  if (programSelect) programSelect.disabled = !summer;
}
if (regType) {
  regType.addEventListener('change', updateRegType);
  updateRegType();
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

  msg.textContent = '';
  const isSummer = regType && regType.value === 'summer';

  // Base info shared by both registration types.
  pendingData = {
    // _replyto lets Formspree send the auto-confirmation to the parent
    // (enable "Autoresponse" in your Formspree dashboard — see SETUP-EMAIL.md).
    _replyto: form.email.value,
    'Parent / Guardian': form.parent.value,
    Email: form.email.value,
    Camper: form.camper.value,
    Grade: form.grade.value,
  };
  const rows = [
    ['Parent / Guardian', form.parent.value],
    ['Email', form.email.value],
    ['Camper', form.camper.value],
    ['Grade', form.grade.value],
  ];

  if (isSummer) {
    const weekCount = selectedWeekCount();
    if (weekCount === 0) {
      msg.style.color = '#ff5da2';
      msg.textContent = 'Please pick at least one week. 📅';
      return;
    }
    if (!form.program.value) {
      msg.style.color = '#ff5da2';
      msg.textContent = 'Please choose a program. 📝';
      return;
    }

    const program = form.program.value;
    const priceMatch = program.match(/\$(\d+)/);
    const listedWeekly = priceMatch ? parseInt(priceMatch[1], 10) : 0;
    const codeEntered = form.discountCode.value.trim();
    const familyApplied = codeEntered.toUpperCase() === FAMILY_CODE;
    const baseWeekly = /Full Day/i.test(program) ? 225 : 150;
    const weekly = familyApplied ? baseWeekly * 0.75 : listedWeekly;
    const total = weekly * weekCount;

    let codeStatus = '';
    if (familyApplied) codeStatus = `✅ ${FAMILY_CODE} applied — 25% off + free lunch`;
    else if (codeEntered) codeStatus = `⚠️ "${codeEntered}" isn't a valid code — no discount applied`;

    Object.assign(pendingData, {
      'Registering for': 'Summer 2027 Camp',
      Program: program,
      Weeks: weeksField.value,
      'Number of weeks': weekCount,
      'Weekly price': money(weekly),
      'Family discount code': codeEntered || '—',
      'Discount applied': familyApplied ? 'Yes — 25% off + free lunch' : 'No',
      'Estimated total': money(total),
    });
    rows.push(['Registering for', 'Summer 2027 Camp']);
    rows.push(['Program', program]);
    rows.push(['Weeks', `${weeksField.value}  ·  ${weekCount} week${weekCount > 1 ? 's' : ''} × ${money(weekly)}`]);
    if (codeEntered) rows.push(['Family discount code', `${codeEntered}  ·  ${codeStatus}`]);

    if (totalLabel) totalLabel.textContent = 'Estimated Total';
    totalAmount.textContent = money(total);
  } else {
    // Free trial — no program, weeks, or cost.
    Object.assign(pendingData, {
      'Registering for': 'Free Trial Camp — Wed, Nov 11, 2026 (Veterans Day)',
      Cost: 'Free ($10 donation optional)',
    });
    rows.push(['Registering for', 'Free Trial Camp — Wed, Nov 11, 2026 (Veterans Day)']);

    if (totalLabel) totalLabel.textContent = 'Cost';
    totalAmount.textContent = 'Free';
  }

  pendingData.Notes = form.notes.value.trim() || '—';
  pendingData._subject = `${isSummer ? 'Summer camp' : 'Free trial'} registration: ${form.camper.value}`;
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

// Celebratory confetti burst 🎉
function launchConfetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#6c4ce0', '#ff5da2', '#ffc83d', '#2ec5b6', '#ff8a5c', '#4f33b3'];
  const count = 110;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 8;
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.width = size + 'px';
    piece.style.height = size * (0.4 + Math.random() * 0.6) + 'px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
    piece.style.setProperty('--spin', (Math.random() * 720 - 360) + 'deg');
    piece.style.animationDuration = 2.4 + Math.random() * 1.6 + 's';
    piece.style.animationDelay = Math.random() * 0.4 + 's';
    if (Math.random() > 0.5) piece.style.borderRadius = '50%';
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4600);
  }
}

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
  launchConfetti();
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
