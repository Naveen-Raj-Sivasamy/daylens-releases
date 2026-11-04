// Daylens setup guide — ONE source for the words shown in the
// Create-team / Join screens (connect.html) and in Settings → Team setup &
// connection (index.html), so the two can never say different things.
// Written for people who aren't IT folks: what to click, and why.
(function () {
  const G = {
    create: {
      title: 'Set up your team',
      time: 'about 5 minutes',
      needs: 'You need a Google account (Gmail, or your company\'s Google account).',
      privacy: "Your team's data is kept in a Google Sheet in your own Google Drive. Nobody else can see it, including the makers of Daylens.",
      steps: [
        { id: 'name', title: 'Name your team', body: 'Type your team name.' },
        { id: 'signin', title: 'Sign in with Google', body: 'Choose your account. Tick every box, then click Continue.', why: 'So Daylens can create your team\'s Sheet in your Drive.' },
        { id: 'switch', title: 'Turn on one switch (only if asked)', body: 'On the page that opens, turn "Google Apps Script API" On, then come back and click Continue.', why: "So Daylens can install your team's backend now, and update it later." },
        { id: 'build', title: 'Daylens builds your Sheet', body: 'About 30 seconds: Sheet created, backend installed, backend published.' },
        { id: 'allow', title: "Allow your team's backend", body: 'On the page that opens, choose your account. If you see "Google hasn\'t verified this app", click Advanced → Go to Daylens backend → Allow.', why: 'This lets your Sheet save entries, send report emails and reminders. It runs as you, inside your own Google account.' },
        { id: 'admin', title: 'Create your admin account', body: 'Pick a username and password for Daylens. This is not your Google password.' },
        { id: 'tabs', title: 'Choose what your team tracks', body: 'Pick from Daily status, Leave, Ticket tracker, Weekly meeting or Custom. You can change the fields any time.' },
        { id: 'invite', title: 'Invite your team', body: 'People → Add user, then copy the ready-made message and send it.' },
      ],
    },
    // "Set it up by hand" — when Sign in with Google isn't available or
    // isn't allowed in the company's Google account.
    manual: [
      { title: 'Create a Google Sheet', body: 'Go to sheets.google.com → Blank spreadsheet. Name it after your team.' },
      { title: 'Open its script editor', body: 'In the Sheet: Extensions → Apps Script.' },
      { title: 'Paste the Daylens backend', body: 'Click "Copy the backend" below, then in the editor select everything in Code.gs, paste, and click Save (💾).' },
      { title: 'Publish it', body: 'Click Deploy → New deployment → ⚙ → Web app. Set "Execute as: Me" and "Who has access: Anyone" → Deploy.' },
      { title: 'Allow it', body: 'Google asks you to authorize. Choose your account. If you see "Google hasn\'t verified this app": Advanced → Go to … → Allow.' },
      { title: 'Copy the link', body: 'Copy the Web app URL (it ends in /exec) and paste it below.' },
    ],
    join: {
      title: 'Join your team',
      time: 'about 1 minute',
      steps: [
        { title: 'Choose "Join a team"', body: 'On the first screen of Daylens.' },
        { title: 'Paste your invite code', body: "It's in your admin's message and starts with DL1-. If you've just copied the message, it fills in by itself." },
        { title: 'Sign in', body: 'Enter your username and the temporary password from the message, then choose your own password.' },
      ],
      note: 'No Google account needed.',
    },
    troubleshooting: [
      { q: '"Google hasn\'t verified this app"', a: 'Expected for your team\'s own backend: it runs inside your own Google account. Click Advanced → Go to … → Allow.' },
      { q: 'Google says "Access blocked" (or another error) during sign-in', a: '"Sign in with Google" in Daylens isn\'t open to your Google account yet — tell the person who gave you Daylens. Back in Daylens, click "Start sign-in again" after it\'s fixed, or choose "Set it up by hand instead": it works without signing in to Daylens.' },
      { q: '"The switch is off" / "Apps Script API"', a: 'Open script.google.com/home/usersettings, turn "Google Apps Script API" On, wait a few seconds, then click Continue (or Update) again.' },
      { q: 'Allow didn\'t finish', a: 'Click "Open the Allow page" again and make sure you end on a page that says the backend is ready (or shows some text) — not on a Google error.' },
      { q: "A teammate's invite code isn't accepted", a: 'Send them a fresh invite: People → their name → Reset password. The message includes the code; ask them to copy the whole message.' },
      { q: "Where do I see who's on leave and my reminders?", a: 'The bell at the top of every screen shows Today: your reminders that are due, who\'s on leave, holidays and the team\'s message. The same list is at the top of Home. Reminder pop-ups stay in the corner of your screen until you click Done, Snooze or ✕. Turn the chime off in Settings → Sound.' },
      { q: 'How do I email reports automatically?', a: 'Admins: Reports → Scheduled reports. For each report, pick its tabs and columns, who receives it, and when it goes out: every day, every weekday, once a week, once a month, or on days you choose. You can also remind the team a few hours before it goes out, in your own words (bold, lists and links work). Day-by-day reports skip holidays listed in your Holidays tab.' },
      { q: 'Not everyone got the report or reminder email', a: 'Everything your team\'s Sheet emails is sent from the Google account that owns the Sheet, and Google limits how many people it can email each day: about 100 for a free Gmail account and 1,500 for Google Workspace, counting every recipient of every email. After that Google waits until the next day. Fewer recipients, or a Workspace account for the Sheet, fixes it.' },
      { q: 'What is Ask Daylens?', a: 'The 🔍 Ask button at the bottom right. Ask about your team\'s records ("What did I log last week?"), how to do something ("How do I add a category?") — it shows a button to the right screen — or ask it to fill in an entry ("Apply leave for me on Friday"). It asks for anything missing, and nothing is saved until you press Confirm. It only uses what you can already see in Daylens, through your team\'s Gemini key (Tabs & fields → App Settings).' },
      { q: 'The Friday check-in and the dashboard', a: 'Home shows the team\'s week on the right: who logged which day, totals, earlier weeks, a PDF or picture to download for a meeting, and 🎉 kudos. Admins can switch on the Friday check-in (Reports → Friday check-in): anyone with nothing logged that week gets a reminder, unless they\'re on leave all week.' },
      { q: 'Old rows disappeared from the Sheet', a: 'That\'s Clean-up & backups (Tabs & fields): once a month, rows older than each tab\'s period are emailed to the admins as CSV files, then removed. The Activity log keeps 6 months by default; other tabs only if an admin switches them on. Leave, holidays and reminders are never removed. The backup email has every row.' },
      { q: 'How do I know a new version is out?', a: 'Daylens downloads updates by itself. When one is ready you get a desktop notification and a "Version … is ready" message in the window: click Restart now, or keep working and it installs the next time Daylens closes. If you don\'t restart, it reminds you once a day. Check any time in Settings → About Daylens → Check for updates.' },
      { q: 'Some teammates haven\'t updated yet — is that a problem?', a: 'No. Older and newer versions save to the same Sheet the same way, and an older version can\'t wipe settings it can\'t show. If an update ever has to be required, Daylens shows those people an "Update required" screen with the update button.' },
      { q: 'I was renamed — how do I sign in?', a: 'With your new name and your same password. Your old name still works too, and Daylens tells you the new one.' },
      { q: "I'm in more than one team", a: 'Click the team card at the top of the menu → Join another team, and paste that team\'s invite code. After that, switch between your teams from the same card: one click, no password. Each team keeps its own Sheet and its own login.' },
      { q: "I'm moving to a new computer", a: 'Install Daylens, choose Join a team, and paste an invite code (Settings → Team setup & connection → Copy invite code on your old PC, or ask another admin). Then sign in with your username and password.' },
      { q: 'I forgot my password', a: 'Ask another Admin to reset it (People → Reset password). If you are the only Admin: open your team\'s Sheet (you own it) → menu Daylens → Reset admin password. It shows a temporary password.' },
      { q: 'Someone left the team', a: 'People → Deactivate (or Delete). They can no longer sign in.' },
    ],
  };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Numbered steps; `why` lines in a softer style.
  G.stepsHtml = function (steps, cls) {
    return `<ol class="${cls || 'guide-steps'}">${steps.map((s) =>
      `<li><b>${esc(s.title)}.</b> ${esc(s.body)}${s.why ? `<div class="guide-why">Why: ${esc(s.why)}</div>` : ''}</li>`).join('')}</ol>`;
  };
  G.troubleshootingHtml = function () {
    return G.troubleshooting.map((t) => `<details class="guide-faq"><summary>${esc(t.q)}</summary><p>${esc(t.a)}</p></details>`).join('');
  };
  window.APP_GUIDE = G;
})();
