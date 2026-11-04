// Tile icons — the library admins pick from (Tabs & fields → Tabs, and
// → Landing-Screen Categories), plus the automatic guess for anything
// nobody has picked an icon for yet. Emoji, so they look right in every
// theme with no image files. Each has words for the picker's search.
(function () {
  var LIBRARY = [
    ['📝', 'daily status update notes write log'], ['🗒️', 'notes notepad list'], ['📋', 'clipboard checklist tasks'],
    ['✅', 'done complete tick check'], ['☑️', 'checkbox todo'], ['📌', 'pin important'], ['📎', 'attachment paperclip'],
    ['🗂️', 'folders categories files'], ['📁', 'folder files'], ['📂', 'open folder'], ['🗃️', 'archive records'],
    ['📊', 'report chart bar statistics'], ['📈', 'growth trend up chart'], ['📉', 'decline down chart'], ['🧮', 'count calculate numbers'],
    ['📅', 'calendar date schedule'], ['🗓️', 'calendar planner week'], ['⏰', 'alarm reminder time'], ['⏱️', 'timer stopwatch time tracking'],
    ['⌛', 'waiting pending hourglass'], ['🕘', 'clock hours shift'],
    ['🌴', 'leave holiday vacation off'], ['🏖️', 'beach holiday break'], ['🤒', 'sick leave unwell'], ['🏠', 'home work from home wfh'],
    ['✈️', 'travel trip flight'], ['🎉', 'celebration event party'], ['🎂', 'birthday'],
    ['🎫', 'ticket support request'], ['🐞', 'bug defect issue error'], ['🛠️', 'fix tools maintenance repair'], ['🔧', 'wrench fix settings'],
    ['⚙️', 'settings gear config'], ['🧹', 'cleanup clean tidy'], ['🚑', 'urgent incident emergency hotfix'], ['🔥', 'hot priority fire critical'],
    ['🚨', 'alert incident outage'], ['⚠️', 'warning risk'], ['🧯', 'firefighting incident'], ['🛡️', 'security protect'],
    ['🔒', 'lock access security'], ['🔑', 'key access password'],
    ['🚀', 'release deploy launch'], ['📦', 'package delivery release'], ['🧪', 'test qa experiment'], ['🔍', 'review search inspect qa'],
    ['🔬', 'analysis research detail'], ['🧩', 'feature component puzzle'], ['💡', 'idea improvement suggestion'], ['🎯', 'goal target objective'],
    ['🏁', 'finish milestone'], ['🧭', 'plan direction roadmap'], ['🗺️', 'roadmap map plan'], ['🏗️', 'build construction project'],
    ['💻', 'computer development code laptop'], ['🖥️', 'desktop server'], ['🌐', 'website web internet'], ['📱', 'mobile app phone'],
    ['☁️', 'cloud hosting'], ['🗄️', 'database server storage'], ['🔗', 'link url integration'], ['🔌', 'integration plugin connect'],
    ['✉️', 'mail email message'], ['📧', 'email inbox'], ['📨', 'incoming mail'], ['📮', 'post send mailbox'], ['💬', 'chat comment message'],
    ['📞', 'call phone'], ['📢', 'announcement broadcast news'], ['🔔', 'notification bell'],
    ['🤝', 'meeting connect sync handshake client'], ['👥', 'team people group'], ['👤', 'person user'], ['🧑‍💼', 'manager business'],
    ['🙋', 'request question help'], ['🎓', 'training learning course'], ['📚', 'documentation knowledge books'], ['📖', 'guide manual read'],
    ['✍️', 'content writing author'], ['🖊️', 'sign pen edit'], ['🎨', 'design creative ui'], ['🖼️', 'image media gallery'], ['🎬', 'video media'],
    ['📰', 'news content articles'], ['🧾', 'invoice receipt billing'], ['💰', 'money budget finance'], ['💳', 'payment card'],
    ['🛒', 'order purchase shop'], ['🚚', 'delivery shipping logistics'], ['🏢', 'office company building'], ['🏥', 'hospital health clinic'],
    ['⭐', 'star favourite highlight'], ['🏆', 'award achievement win'], ['❓', 'question help faq'], ['ℹ️', 'info information'],
    ['🔄', 'sync refresh recurring'], ['🧲', 'leads attract'], ['📍', 'location site place'], ['🌱', 'growth new start'],
  ];
  var GUESSES = [
    [/daily|status/, '📝'], [/mail/, '✉️'], [/clean/, '🧹'], [/bug|issue|defect/, '🐞'],
    [/deploy|release/, '🚀'], [/leave|holiday|vacation/, '🌴'], [/connect|meeting|sync/, '🤝'],
    [/report|insight/, '📊'], [/ticket|support|request/, '🎫'], [/team|people/, '👥'],
    [/qa|test|validat/, '✅'], [/content|page|cms/, '🗂️'], [/improv|enhanc/, '✨'], [/log/, '📒'],
    [/work|task/, '🗂️'], [/review/, '🔍'], [/plan|roadmap/, '🧭'],
  ];
  // The automatic guess from a name — or its initials.
  function guess(name) {
    var n = String(name || '').toLowerCase();
    for (var i = 0; i < GUESSES.length; i++) if (GUESSES[i][0].test(n)) return GUESSES[i][1];
    var words = String(name || '').trim().split(/\s+/).filter(Boolean);
    return ((words[0] || '•')[0] + (words[1] ? words[1][0] : '')).toUpperCase();
  }
  // The icon to show: the admin's pick (icons = {"category:Name": "🎫",
  // "tab:Name": "📝"}), else the guess.
  function iconFor(kind, name, icons) {
    var picked = icons && icons[kind + ':' + name];
    return picked || guess(name);
  }
  window.DaylensIcons = { LIBRARY: LIBRARY, guess: guess, iconFor: iconFor };
})();
