document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants (${details.participants.length}):</strong>
            ${details.participants.length > 0 
              ? `<div class="participants-list">${details.participants.map((p, idx) => `<span class="participant-row"><span>${p}</span> <button class="delete-btn" title="Unregister" data-activity="${name}" data-index="${idx}">&#128465;</button></span>`).join('')}</div>`
              : '<p class="no-participants">No participants yet</p>'
            }
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add delete button event listeners after rendering
        setTimeout(() => {
          const deleteBtns = activityCard.querySelectorAll('.delete-btn');
          deleteBtns.forEach(btn => {
            btn.onclick = async function() {
              const activityName = btn.getAttribute('data-activity');
              const participantIndex = btn.getAttribute('data-index');
              try {
                const response = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister?index=${participantIndex}`, {
                  method: 'DELETE',
                });
                if (response.ok) {
                  fetchActivities();
                } else {
                  alert('Failed to unregister participant.');
                }
              } catch (err) {
                alert('Error occurred while unregistering.');
              }
            };
          });
        }, 0);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
