// adminScript.js

document.addEventListener('DOMContentLoaded', function() {

    // --- Display Functions (Refactored for Tables) ---
    function displayRegisteredStudents() {
      const tableBody = document.querySelector('#registered-students-table tbody');
      if (!tableBody) return;

      tableBody.innerHTML = '';
      const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];

      approvedUsers.forEach(user => {
          const row = tableBody.insertRow();
          row.insertCell().textContent = user.studentId;
          row.insertCell().textContent = user.email;

          const actionsCell = row.insertCell();
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.classList.add('delete'); // Add the 'delete' class
          deleteButton.addEventListener('click', () => deleteRegisteredStudent(user.email));

          actionsCell.appendChild(deleteButton);
      });
  }
function deleteRegisteredStudent(email) {
    if (confirm(`Are you sure you want to delete the student account for ${email}?`)) {
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
        approvedUsers = approvedUsers.filter(u => u.email !== email);
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
        displayRegisteredStudents();
        addAuditLog(`Deleted student account: ${email}`);
    }
}
    function displayPendingAccounts() {
        const tableBody = document.querySelector('#pending-accounts-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];

        pendingUsers.forEach(user => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = user.studentId;
            row.insertCell().textContent = user.email;

            const actionsCell = row.insertCell();
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.addEventListener('click', () => approveUser(user));

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.classList.add('reject'); // Add the 'reject' class
            rejectButton.addEventListener('click', () => rejectUser(user));

            actionsCell.appendChild(approveButton);
            actionsCell.appendChild(rejectButton);
        });
    }
   function displayPendingFeedbacks() {
    const tableBody = document.querySelector('#pending-feedbacks-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    let pendingFeedbacks = feedbacks.filter(f => f.status === 'pending');

    // Get the selected sort order
    const sortOrderSelect = document.getElementById('sort-order-pending'); // Correct ID
    const sortOrder = sortOrderSelect ? sortOrderSelect.value : 'most-recent'; // Default to most-recent

     // Sort feedbacks based on the selected order
    pendingFeedbacks = sortFeedbacks(pendingFeedbacks, sortOrder);



    pendingFeedbacks.forEach(feedback => {
        const row = tableBody.insertRow();
        const date = new Date(feedback.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        row.insertCell().textContent = formattedDate;
        row.insertCell().textContent = feedback.topic;
        row.insertCell().textContent = feedback.type;
        row.insertCell().textContent = feedback.message;
        row.insertCell().textContent = feedback.userId;

        const actionsCell = row.insertCell();
        const prioritySelect = document.createElement('select');
        prioritySelect.innerHTML = `
            <option value="very-high">Very High</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
        `;
        const approveButton = document.createElement('button');
        approveButton.textContent = 'Approve';
        approveButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to approve this feedback?")) {
                approveFeedback(feedback.timestamp, prioritySelect.value);
            }
        });

        const rejectButton = document.createElement('button');
        rejectButton.textContent = 'Reject';
        rejectButton.classList.add('reject'); // Add class for styling
        rejectButton.addEventListener('click', () => rejectFeedback(feedback.timestamp, prioritySelect.value));

        actionsCell.appendChild(prioritySelect);
        actionsCell.appendChild(approveButton);
        actionsCell.appendChild(rejectButton);

    });
}


   function displayApprovedFeedbacks() {
    const tableBody = document.querySelector('#approved-feedbacks-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    let approvedFeedbacks = feedbacks.filter(f => f.status === 'approved');

    // Get the selected sort order
    const sortOrderSelect = document.getElementById('sort-order');
    const sortOrder = sortOrderSelect ? sortOrderSelect.value : 'most-recent';  // Default to most recent

    // Sort feedbacks based on selected order
    approvedFeedbacks = sortFeedbacks(approvedFeedbacks, sortOrder);

    approvedFeedbacks.forEach(feedback => {
        const row = tableBody.insertRow();
        const date = new Date(feedback.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        row.insertCell().textContent = formattedDate;
        row.insertCell().textContent = feedback.topic;
        row.insertCell().textContent = feedback.type;
        row.insertCell().textContent = feedback.priority;
        row.insertCell().textContent = feedback.message;

        const actionsCell = row.insertCell(); // Get the actions cell
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete'); // Add the 'delete' class
        deleteButton.addEventListener('click', () => deleteFeedback(feedback.timestamp));
        actionsCell.appendChild(deleteButton); // Append to the actions cell
    });
}

    function displayAdminAccounts() {
        const tableBody = document.querySelector('#admin-accounts-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const admins = JSON.parse(localStorage.getItem('admins')) || [];

        admins.forEach(admin => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = admin.username;
            row.insertCell().textContent = admin.role;

            const actionsCell = row.insertCell();
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.addEventListener('click', () => updateAdmin(admin.username));
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
             deleteButton.classList.add('delete');
            deleteButton.addEventListener('click', () => deleteAdmin(admin.username));

            actionsCell.appendChild(updateButton);
            actionsCell.appendChild(deleteButton);
        });
    }
  function displayAdminAnnouncements() {
    const announcementsList = document.querySelector('#announcements-admin'); // Changed
    if (!announcementsList) return;

    announcementsList.innerHTML = '';
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];

    announcements.forEach(announcement => {
        const p = document.createElement('p');
        p.textContent = announcement;
        announcementsList.appendChild(p);
    });
}

function displayAnnouncementsTable() {
    const tableBody = document.querySelector('#announcements-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];

    announcements.forEach((announcement, index) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = announcement;

        const actionsCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete'); // Add class for styling
        deleteButton.addEventListener('click', () => deleteAnnouncement(index)); // Pass index
        actionsCell.appendChild(deleteButton);
    });
}
    function displayTopicSuggestions() {
      const tableBody = document.querySelector('#topic-suggestions-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const suggestions = JSON.parse(localStorage.getItem('topicSuggestions')) || [];

        suggestions.forEach(suggestion => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = suggestion.topic;
            row.insertCell().textContent = suggestion.userId;
            row.insertCell().textContent = suggestion.status;

            const actionsCell = row.insertCell();
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.addEventListener('click', () => {
              if (confirm("Are you sure you want to approve this topic?")) {
                    approveTopic(suggestion.topic);
                }
            });

            const rejectButton = document.createElement('button');
            rejectButton.textContent = 'Reject';
            rejectButton.classList.add('reject');
            rejectButton.addEventListener('click', () => rejectTopic(suggestion.topic));

            actionsCell.appendChild(approveButton);
            actionsCell.appendChild(rejectButton);
        });
    }

    function displayReportData() {
        // ... (Report logic remains the same, as it's not table-based) ...
         let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];

        const selectedTimePeriod = document.querySelector('input[name="time-period"]:checked').value;
        let startDate = new Date();

        if (selectedTimePeriod === 'last-week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (selectedTimePeriod === 'last-15-days') {
            startDate.setDate(startDate.getDate() - 15);
        } else if (selectedTimePeriod === 'last-year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        }

        if (selectedTimePeriod !== 'all') {
            feedbacks = feedbacks.filter(f => {
              const feedbackDate = new Date(f.timestamp);
              return feedbackDate >= startDate;
            });
        }

        const totalFeedback = feedbacks.length;
        document.getElementById('total-feedback').textContent = totalFeedback;

        const pendingCount = feedbacks.filter(f => f.status === 'pending').length;
        document.getElementById('pending-count').textContent = pendingCount;
        const approvedCount = feedbacks.filter(f => f.status === 'approved').length;
        document.getElementById('approved-count').textContent = approvedCount;
        const rejectedCount = feedbacks.filter(f => f.status === 'rejected').length;
        document.getElementById('rejected-count').textContent = rejectedCount;

        const veryHighCount = feedbacks.filter(f => f.priority === 'very-high').length;
        document.getElementById('very-high-count').textContent = veryHighCount;
        const highCount = feedbacks.filter(f => f.priority === 'high').length;
        document.getElementById('high-count').textContent = highCount;
        const mediumCount = feedbacks.filter(f => f.priority === 'medium').length;
        document.getElementById('medium-count').textContent = mediumCount;
        const lowCount = feedbacks.filter(f => f.priority === 'low').length;
        document.getElementById('low-count').textContent = lowCount;


        const feedbackTypeCount = feedbacks.filter(f => f.type === 'feedback').length;
        document.getElementById('feedback-type-count').textContent = feedbackTypeCount;
        const complaintTypeCount = feedbacks.filter(f => f.type === 'complaint').length;
        document.getElementById('complaint-type-count').textContent = complaintTypeCount;
        const ideaTypeCount = feedbacks.filter(f => f.type === 'idea').length;
        document.getElementById('idea-type-count').textContent = ideaTypeCount;
    }

    function displayAuditLog() {
        const tableBody = document.querySelector('#audit-log-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const auditLogs = JSON.parse(localStorage.getItem('auditLog')) || [];

        auditLogs.forEach(log => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = log.timestamp;
            row.insertCell().textContent = log.action;
        });
    }

    // --- Action Functions (Approving, Rejecting, etc.) ---

    function approveUser(user) {
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];

        const updatedPendingUsers = pendingUsers.filter(u => u.email !== user.email);
        approvedUsers.push(user);

        localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

        addAuditLog(`Approved user: ${user.email}`);
        alert(`Approved user: ${user.email}. Send an email to inform them.`);
        displayPendingAccounts();
    }

    function rejectUser(user) {
        const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];
        const updatedPendingUsers = pendingUsers.filter(u => u.email !== user.email);
        localStorage.setItem('pendingUsers', JSON.stringify(updatedPendingUsers));

        addAuditLog(`Rejected user: ${user.email}`);
        alert(`Rejected user: ${user.email}. Send an email to inform them.`);
        displayPendingAccounts();
    }



    function approveFeedback(timestamp, priority) {
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        const feedbackIndex = feedbacks.findIndex(f => f.timestamp === parseInt(timestamp));

        if (feedbackIndex > -1) {
            feedbacks[feedbackIndex].status = 'approved';
            feedbacks[feedbackIndex].priority = priority;
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
            displayPendingFeedbacks();
            displayApprovedFeedbacks();
            addAuditLog(`Approved feedback (Timestamp: ${timestamp}, Priority: ${priority})`);
        }
    }

    function rejectFeedback(timestamp, priority) {
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        const feedbackIndex = feedbacks.findIndex(f => f.timestamp === parseInt(timestamp));

        if (feedbackIndex > -1) {
            feedbacks[feedbackIndex].status = 'rejected';
            feedbacks[feedbackIndex].priority = priority; // Store priority even if rejected
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
            displayPendingFeedbacks();
            addAuditLog(`Rejected feedback (Timestamp: ${timestamp}, Priority: ${priority})`);
        }
    }
  function deleteAnnouncement(index) {
    if (confirm('Are you sure you want to delete this announcement?')) {
        let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        announcements.splice(index, 1); // Remove the announcement at the given index
        localStorage.setItem('announcements', JSON.stringify(announcements));
        displayAnnouncementsTable();
        displayAdminAnnouncements() // Refresh the display on the dashboard too
        addAuditLog('Deleted an announcement'); // Log the action
    }
}
function deleteFeedback(timestamp) {
    if (confirm('Are you sure you want to delete this feedback?')) {
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        feedbacks = feedbacks.filter(f => f.timestamp !== parseInt(timestamp));
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
        displayApprovedFeedbacks(); // Refresh the display
        addAuditLog(`Deleted feedback (Timestamp: ${timestamp})`);
    }
}


    // --- Admin Account Management ---

    const createAdminForm = document.getElementById('create-admin-form');
    if (createAdminForm) {
        createAdminForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('new-admin-username').value;
            const password = document.getElementById('new-admin-password').value;
            const role = document.getElementById('new-admin-role').value;

            const admins = JSON.parse(localStorage.getItem('admins')) || [];
            if (admins.some(admin => admin.username === username)) {
                alert('Username is already taken.');
                return;
            }

            admins.push({ username, password, role });
            localStorage.setItem('admins', JSON.stringify(admins));

            displayAdminAccounts();
            addAuditLog(`Created admin: ${username} (${role})`);
            createAdminForm.reset();
        });
    }

    function updateAdmin(username) {
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        const adminToUpdate = admins.find(a => a.username === username);

        if (adminToUpdate) {
            const newPassword = prompt("Enter new password (leave blank to keep current):", "");
            const newRole = prompt("Enter new role (admin, moderator, reports):", adminToUpdate.role);

            if (newPassword !== null && newPassword !== "") {
                adminToUpdate.password = newPassword;
            }
            if(newRole !== null && (newRole === 'admin' || newRole === 'moderator' || newRole === 'reports')) {
               adminToUpdate.role = newRole;
            }

            localStorage.setItem('admins', JSON.stringify(admins));
            displayAdminAccounts();
            addAuditLog(`Updated admin: ${username}`);

        }
    }

    function deleteAdmin(username) {
        if (confirm(`Are you sure you want to delete admin ${username}?`)) {
            let admins = JSON.parse(localStorage.getItem('admins')) || [];
            admins = admins.filter(a => a.username !== username);
            localStorage.setItem('admins', JSON.stringify(admins));
            displayAdminAccounts();
            addAuditLog(`Deleted admin: ${username}`);
        }
    }
  const addAnnouncementButton = document.getElementById('add-announcement');
    if (addAnnouncementButton) {
        addAnnouncementButton.addEventListener('click', addAnnouncement);
    }
    //ANNOUNCEMENT
    function addAnnouncement() {
        const announcementText = document.getElementById('announcement-text').value;
        if (announcementText.trim() !== '') {
            const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
            announcements.push(announcementText);
            localStorage.setItem('announcements', JSON.stringify(announcements));
            document.getElementById('announcement-text').value = '';
            displayAnnouncementsTable(); // Display in the table on manage-announcements page
             displayAdminAnnouncements()
            addAuditLog(`Added announcement: ${announcementText}`);
        }
    }


    //ADMIN LOGOUT
    const adminLogoutButton = document.getElementById('admin-logout');
    if (adminLogoutButton) {
      adminLogoutButton.addEventListener('click', function(){
            localStorage.removeItem('session');
            window.location.href = 'admin-login.html' // Changed back to admin-login.html
        });
    }
//GO BACK
    const goBackButton = document.getElementById('go-back'); // Corrected ID
    if (goBackButton) {
        goBackButton.addEventListener('click', goBackToIndex);
    }
     function goBackToIndex() {
        window.location.href = 'index.html';
    }



//TOPIC SUGGESTION
      const addInitialTopicButton = document.getElementById('add-initial-topic-button');
    if (addInitialTopicButton) {
        addInitialTopicButton.addEventListener('click', function() {
            const initialTopicInput = document.getElementById('initial-topic-input');
            const topic = initialTopicInput.value.trim();

            if (topic) {
                const topicSuggestions = JSON.parse(localStorage.getItem('topicSuggestions')) || [];
                topicSuggestions.push({
                    topic: topic,
                    userId: 'admin', // Indicate it's an admin-added topic
                    status: 'approved'
                });
                localStorage.setItem('topicSuggestions', JSON.stringify(topicSuggestions));

                initialTopicInput.value = '';
                displayTopicSuggestions();
                 addAuditLog(`Added initial topic: ${topic}`);
                 // Trigger topic list update on student dashboard
                if (typeof updateTopicList === 'function') {
                    updateTopicList();
                }
            }
        });
    }
function approveTopic(topic) {
    let suggestions = JSON.parse(localStorage.getItem('topicSuggestions')) || [];
    const suggestionIndex = suggestions.findIndex(s => s.topic === topic);

    if (suggestionIndex > -1) {
        suggestions[suggestionIndex].status = 'approved';
        localStorage.setItem('topicSuggestions', JSON.stringify(suggestions));
        displayTopicSuggestions();
         addAuditLog(`Approved topic suggestion: ${topic}`);
         if (typeof updateTopicList === 'function') {
            updateTopicList(); //from script.js
        }
    }
}

function rejectTopic(topic) {
    let suggestions = JSON.parse(localStorage.getItem('topicSuggestions')) || [];
    const suggestionIndex = suggestions.findIndex(s => s.topic === topic);

    if (suggestionIndex > -1) {
        suggestions[suggestionIndex].status = 'rejected';
        localStorage.setItem('topicSuggestions', JSON.stringify(suggestions));
        displayTopicSuggestions();
         addAuditLog(`Rejected topic suggestion: ${topic}`);
    }
}

    const timePeriodRadios = document.querySelectorAll('input[name="time-period"]');
    timePeriodRadios.forEach(radio => {
        // Continuing from the previous adminScript.js response

        radio.addEventListener('change', displayReportData);
    });


    const createSuperAdminForm = document.getElementById('create-superadmin-form');
    if (createSuperAdminForm) {
        createSuperAdminForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;
            const admins = JSON.parse(localStorage.getItem('admins')) || [];
            admins.push({ username, password, role: 'admin' });
            localStorage.setItem('admins', JSON.stringify(admins));
            window.location.href = 'admin-dashboard.html'; // Redirect to dashboard
        });
    }


    // --- Admin Login (admin-login.html) ---
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            const admins = JSON.parse(localStorage.getItem('admins')) || [];
            const admin = admins.find(a => a.username === username && a.password === password);

            if (admin) {
                localStorage.setItem('session', JSON.stringify({ isLoggedIn: true, role: admin.role }));
                localStorage.removeItem('currentUser');  // Clear any student session
                window.location.href = 'admin-dashboard.html'; // Redirect to admin dashboard
            } else {
                const adminLoginMessage = document.getElementById('admin-login-message'); // Get element
                if(adminLoginMessage) {  // Check if element exists
                    adminLoginMessage.textContent = 'Invalid admin credentials.';
                }
            }
        });
    }


    if (document.getElementById('admin-dashboard') || document.querySelector('nav') || document.getElementById('announcements-admin') || document.getElementById('audit-log')) {
        checkAdminSession();
    }
    // --- Sorting Function ---
    function sortFeedbacks(feedbacks, order) {
      return feedbacks.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return order === 'most-recent' ? dateB - dateA : dateA - dateB;
      });
    }
  // --- Event Listener for Sorting (Approved Feedbacks) ---
  const sortOrderSelect = document.getElementById('sort-order');
    if (sortOrderSelect) {
        sortOrderSelect.addEventListener('change', displayApprovedFeedbacks);
    }
  // Event Listener for Sorting (Pending Feedbacks)
  const sortOrderSelectPending = document.getElementById('sort-order-pending');
    if (sortOrderSelectPending) {
        sortOrderSelectPending.addEventListener('change', displayPendingFeedbacks); // Corrected
    }
    // Initial Display Calls (depending on the current page)
    if (window.location.pathname.endsWith('admin-pending-students.html')) {
        displayPendingAccounts();
    } else if (window.location.pathname.endsWith('admin-pending-feedback.html')) {
        displayPendingFeedbacks();
    } else if (window.location.pathname.endsWith('admin-approved-feedback.html')) {
        displayApprovedFeedbacks();
    } else if (window.location.pathname.endsWith('admin-users.html')) {
        displayAdminAccounts();
    } else if (window.location.pathname.endsWith('admin-manage-topics.html')) {
        displayTopicSuggestions();
    }else if (window.location.pathname.endsWith('admin-manage-announcements.html')) {
        displayAnnouncementsTable();
   }else if (window.location.pathname.endsWith('admin-reports.html')) {
        displayReportData();
    } else if (window.location.pathname.endsWith('admin-audit-log.html')) {
       displayAuditLog();
   }else if(window.location.pathname.endsWith('admin-dashboard.html')){
        //Removed
   } else if (window.location.pathname.endsWith('admin-registered-students.html')) {
        displayRegisteredStudents();
    }
});



function addAuditLog(action) {
    const auditLogs = JSON.parse(localStorage.getItem('auditLog')) || [];
    auditLogs.push({ action, timestamp: new Date().toLocaleString() });
    localStorage.setItem('auditLog', JSON.stringify(auditLogs));
    if (window.location.pathname.endsWith('admin-audit-log.html') || window.location.pathname.endsWith('admin-dashboard.html') ) {
           displayAuditLog();
    }
}

function checkAdminSession() {
    const session = JSON.parse(localStorage.getItem('session'));
     if (!session || !session.isLoggedIn || !session.role) {
        window.location.href = 'index.html';
    }
}