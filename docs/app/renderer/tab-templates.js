// Starting points for a new tab (Manage → Tabs → Add a tab). Every field
// can be renamed, removed or added to before the tab is created, and
// changed later in Manage → Field Types / Dropdown options.
//   type      — what the backend records in _TabTypes; decides the screens
//               (ticket-tracker: ticket list + Teams post; weekly-meeting:
//               one-meeting-many-queries form; leave: today's-leave banner,
//               one entry per person per day).
//   columns   — field type: text (default), select, multiselect, date,
//               week-auto (from basedOn), sequence (1, 2, 3…), url, checkbox
(function () {
  window.TAB_TEMPLATES = [
    {
      id: 'daily-status', type: 'daily-status', icon: '📝', name: 'Daily status',
      hint: 'What each person worked on — one row per update',
      category: 'Daily work', inReport: true,
      columns: [
        { name: 'Date', type: 'date' },
        { name: 'Name', type: 'text' },
        { name: 'Task', type: 'text' },
        { name: 'Update', type: 'text' },
        { name: 'Status', type: 'select', options: ['Done', 'In progress', 'Blocked'] },
        { name: 'Week', type: 'week-auto', basedOn: 'Date' },
      ],
    },
    {
      id: 'leave', type: 'leave', icon: '🌴', name: 'Leave',
      hint: "Who's off and when — shows in Today's highlights",
      category: 'Team', inReport: false,
      columns: [
        { name: 'Name', type: 'text' },
        { name: 'Date', type: 'date' },
        { name: 'Type', type: 'select', options: ['Vacation', 'Sick', 'Work from home', 'Holiday', 'Other'] },
        { name: 'Reason', type: 'text' },
      ],
    },
    {
      id: 'ticket-tracker', type: 'ticket-tracker', icon: '🎫', name: 'Ticket tracker',
      hint: 'Issues raised through the week — status, owner, and a weekly post to Teams',
      category: 'Tickets', inReport: true,
      columns: [
        { name: 'Ticket ID', type: 'sequence' },
        { name: 'Group', type: 'select', optionsKey: 'ConnectGroups' },
        { name: 'Date', type: 'date' },
        { name: 'Requester', type: 'text' },
        { name: 'Owner', type: 'text' },
        { name: 'Type', type: 'select', options: ['Bug', 'Question', 'Request', 'Blocker'] },
        { name: 'Issue', type: 'text' },
        { name: 'URL', type: 'url' },
        { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
        { name: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved', 'Deferred'] },
        { name: 'Comments', type: 'text' },
      ],
      fixed: ['Ticket ID', 'Status'], // the ticket screens need these two
    },
    {
      id: 'weekly-meeting', type: 'weekly-meeting', icon: '🗓️', name: 'Weekly meeting',
      hint: 'One row per meeting — every question with its answer, status and owner',
      category: 'Meetings', inReport: false,
      columns: [
        { name: 'Meeting Date', type: 'date' },
        { name: 'Requester', type: 'text' },
        { name: 'Queries', type: 'text' },
      ],
      fixed: ['Meeting Date', 'Requester', 'Queries'], // the meeting form writes exactly these
    },
    {
      id: 'custom', type: 'custom', icon: '✨', name: 'Custom',
      hint: 'Start almost blank and add your own fields',
      category: '', inReport: false,
      columns: [
        { name: 'Date', type: 'date' },
        { name: 'Name', type: 'text' },
        { name: 'Notes', type: 'text' },
      ],
    },
  ];
  window.TAB_TYPE_LABELS = {
    'daily-status': 'Daily status', leave: 'Leave', 'ticket-tracker': 'Ticket tracker',
    'weekly-meeting': 'Weekly meeting', custom: 'Custom',
  };
})();
