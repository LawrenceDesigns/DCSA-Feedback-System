// script.js

document.addEventListener('DOMContentLoaded', function() { // Corrected: Added the function
    console.log("script.js loaded");

    const signupForm = document.getElementById('signup-form');
    const signupMessage = document.getElementById('signup-message');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackMessage = document.getElementById('feedback-message');
    const suggestTopicForm = document.getElementById('suggest-topic-form');
    const suggestionMessage = document.getElementById('suggestion-message');
    const changePasswordForm = document.getElementById('change-password-form');
    const changePasswordMessage = document.getElementById('change-password-message');

    // --- Helper Functions ---

    function checkLoginCooldown() {
        const lastFailedLogin = localStorage.getItem('lastFailedLogin');
        if (lastFailedLogin) {
            const timeLeft = 20 * 1000 - (Date.now() - parseInt(lastFailedLogin)); // 20 seconds
            if (timeLeft > 0) {
                const seconds = Math.ceil(timeLeft / 1000);
                return `Please wait ${seconds}s before trying again.`;
            }
        }
        return null;
    }

    function checkFeedbackCooldown() {
        const lastFeedbackTime = localStorage.getItem('lastFeedbackTime');
        if (lastFeedbackTime) {
            const timeLeft = 20 * 1000 - (Date.now() - parseInt(lastFeedbackTime)); // 20 seconds
            if (timeLeft > 0) {
                const seconds = Math.ceil(timeLeft / 1000);
                return `Please wait ${seconds}s before sending another feedback.`;
            }
        }
        return null;
    }
     function containsOffensiveWords(text) {
        const offensiveWords = ['bully', 'rape', 'fuck', 'shit'];
        const lowerCaseText = text.toLowerCase();
        for (const word of offensiveWords) {
            if (lowerCaseText.includes(word)) {
                return true;
            }
        }
        return false;
    }

    function displayAnnouncements() {
        const announcementsDiv = document.getElementById('announcements');
        if (!announcementsDiv) return;

        announcementsDiv.innerHTML = '';

        const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
        announcements.forEach(announcement => {
            const p = document.createElement('p');
            p.textContent = announcement;
            announcementsDiv.appendChild(p);
        });
    }

        // Function to populate the topic select dropdown
        function populateTopicDropdown() {
            const topicSelect = document.getElementById('topic');
            if (!topicSelect) return; // Ensure the element exists

            topicSelect.innerHTML = ''; // Clear existing options

            const approvedTopics = (JSON.parse(localStorage.getItem('topicSuggestions')) || [])
                .filter(suggestion => suggestion.status === 'approved')
                .map(suggestion => suggestion.topic);

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a Topic';
            topicSelect.appendChild(defaultOption);

            approvedTopics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                topicSelect.appendChild(option);
            });
        }


    function displayFeedbackHistory() {
        const tableBody = document.querySelector('#feedback-history-table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        const userFeedbacks = feedbacks.filter(f => f.userId === currentUser.studentId);

        userFeedbacks.forEach(feedback => {
            const row = tableBody.insertRow();
            const date = new Date(feedback.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            row.insertCell().textContent = formattedDate;
            row.insertCell().textContent = feedback.topic;
            row.insertCell().textContent = feedback.type;
            row.insertCell().textContent = feedback.message;
            row.insertCell().textContent = feedback.status;
        });
    }


    // --- Event Listeners ---

    if (suggestTopicForm) {
        suggestTopicForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const suggestedTopic = document.getElementById('suggested-topic').value;

            if (!suggestedTopic) {
                suggestionMessage.textContent = 'Please enter a topic.';
                return;
            }

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                window.location.href = 'student-login.html'; // Redirect to login
                return;
            }

            const topicSuggestions = JSON.parse(localStorage.getItem('topicSuggestions')) || [];
            topicSuggestions.push({
                topic: suggestedTopic,
                userId: currentUser.studentId,
                status: 'pending'
            });
            localStorage.setItem('topicSuggestions', JSON.stringify(topicSuggestions));

            suggestionMessage.textContent = 'Your topic suggestion has been submitted.';
            suggestTopicForm.reset();
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const studentId = document.getElementById('studentId').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!studentId || !email || !password) {
                signupMessage.textContent = 'Please fill in all fields.';
                return;
            }

            const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];
            const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
            const allUsers = pendingUsers.concat(approvedUsers);

            if (allUsers.some(user => user.studentId === studentId)) {
                signupMessage.textContent = 'This Student ID is already in use.';
                return;
            }
             if (allUsers.some(user => user.email === email)) {
                signupMessage.textContent = 'This Email is already in use.';
                return;
            }

            pendingUsers.push({ studentId, email, password, status: 'pending' });
            localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));

            signupMessage.textContent = 'Your signup request has been submitted.';
            signupForm.reset();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const cooldownMessage = checkLoginCooldown();
            if (cooldownMessage) {
                loginMessage.textContent = cooldownMessage;
                return;
            }

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
            const user = approvedUsers.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.removeItem('lastFailedLogin');
                window.location.href = 'student-dashboard.html'; // Redirect
            } else {
                loginMessage.textContent = 'Invalid email or password.';
                localStorage.setItem('lastFailedLogin', Date.now().toString());
            }
        });
    }


     if (feedbackForm) {
        populateTopicDropdown(); // Call on page load
        feedbackForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const cooldownMessage = checkFeedbackCooldown();
            if (cooldownMessage) {
                feedbackMessage.textContent = cooldownMessage;
                return;
            }

            const topic = document.getElementById('topic').value;
            const feedbackType = document.getElementById('feedback-type').value;
            const message = document.getElementById('message').value;

            if (!topic || !feedbackType || !message) {
                feedbackMessage.textContent = "Please fill in all fields.";
                return;
            }
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                window.location.href = 'student-login.html'; // Redirect to login
                return;
            }

            if (confirm("Are you sure you want to submit this feedback?")) {
                const feedback = {
                    userId: currentUser.studentId,
                    topic: topic,
                    type: feedbackType,
                    message: message,
                    status: 'pending',
                    timestamp: new Date().getTime()
                };

                const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
                feedbacks.push(feedback);
                localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
                localStorage.setItem('lastFeedbackTime', Date.now().toString());

                feedbackMessage.textContent = 'Your feedback has been submitted.';
                feedbackForm.reset();
                displayFeedbackHistory();
            }
        });
    }

 if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            changePasswordMessage.textContent = 'Please fill in all fields.';
            return;
        }

        if (newPassword !== confirmNewPassword) {
            changePasswordMessage.textContent = 'New passwords do not match.';
            return;
        }
         const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            // If no user is logged in, redirect to login page
            window.location.href = 'student-login.html';
            return;
        }

        if (currentPassword !== currentUser.password) {
            changePasswordMessage.textContent = 'Incorrect current password.';
            return;
        }

        // Update the password in approvedUsers
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers')) || [];
        const userIndex = approvedUsers.findIndex(u => u.email === currentUser.email);

        if (userIndex > -1) {
            approvedUsers[userIndex].password = newPassword;
            localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

            // Update currentUser in case they are still logged in.
            currentUser.password = newPassword;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            changePasswordMessage.textContent = 'Password changed successfully.';
            changePasswordForm.reset();
        } else {
            changePasswordMessage.textContent = 'User not found.  Please log in again.'; // Shouldn't happen, but good to handle
        }
    });
}
    // --- Initializations ---
    const studentNameSpan = document.getElementById('student-name');
    if (studentNameSpan) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            studentNameSpan.textContent = currentUser.studentId;
        } else {
            window.location.href = 'student-login.html'; // Redirect to login
        }
    }
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'student-login.html'; // Redirect to student login
        });
    }

    // GO BACK BUTTON - Student
    const goBackButtonStudent = document.getElementById('go-back-student');
    if (goBackButtonStudent) {
        goBackButtonStudent.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    if (document.getElementById('announcements')) {
        displayAnnouncements();
    }
     displayFeedbackHistory();


    // Function to update the topic list (used by adminScript.js)
    window.updateTopicList = function() {  // Expose globally
        populateTopicDropdown(); // Call the existing function
    }

}); // Corrected: Closing brace for the DOMContentLoaded event listener