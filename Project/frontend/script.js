const API_URL = "http://localhost:3000"; // Your backend URL

// Handle voter registration
document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const voterId = document.getElementById("voter_id").value;

    // Send the registration request
    fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ voter_id: voterId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Voter registered successfully") {
                alert("Registration successful. Please choose a candidate.");
                showCandidates();
            } else {
                alert("Registration failed: " + data.message);
            }
        })
        .catch(error => console.error("Error registering voter:", error));
});

// Show candidates after registration
function showCandidates() {
    fetch(`${API_URL}/candidates`)
        .then(response => response.json())
        .then(data => {
            const candidatesList = document.getElementById("candidatesList");
            candidatesList.innerHTML = ""; // Clear the previous list

            data.candidates.forEach(candidate => {
                const candidateElement = document.createElement("div");
                candidateElement.innerHTML = `
                    <input type="radio" name="candidate" value="${candidate.id}" id="candidate_${candidate.id}" required>
                    <label for="candidate_${candidate.id}">${candidate.name}</label>
                `;
                candidatesList.appendChild(candidateElement);
            });

            // Show the vote button
            document.getElementById("submitVoteButton").style.display = "block";
            document.getElementById("candidatesSection").style.display = "block";
        })
        .catch(error => console.error("Error fetching candidates:", error));
}

// Handle vote submission
document.getElementById("submitVoteButton").addEventListener("click", function () {
    const selectedCandidateId = document.querySelector('input[name="candidate"]:checked')?.value;
    const voterId = document.getElementById("voter_id").value;

    if (selectedCandidateId) {
        fetch(`${API_URL}/vote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ voter_id: voterId, candidate_id: selectedCandidateId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Vote successfully cast") {
                    alert("Vote successfully cast!");
                    startResultsTimer();
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => console.error("Error submitting vote:", error));
    } else {
        alert("Please select a candidate.");
    }
});

// Start timer to show results after 5 minutes
function startResultsTimer() {
    setTimeout(() => {
        fetchResults();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
}

// Fetch results from the backend
function fetchResults() {
    fetch(`${API_URL}/results`)
        .then(response => response.json())
        .then(data => {
            if (data.candidates && data.winner) {
                displayResults(data.candidates, data.winner);
            } else {
                alert("Error fetching results.");
            }
        })
        .catch(error => console.error("Error fetching results:", error));
}

// Display results in a table format
function displayResults(candidates, winner) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <h3>Winner: ${winner.name} with ${winner.vote_count} votes</h3>
        <table>
            <tr>
                <th>Candidate Name</th>
                <th>Vote Count</th>
            </tr>
            ${candidates
                .map(
                    (candidate) => `
                    <tr>
                        <td>${candidate.name}</td>
                        <td>${candidate.vote_count}</td>
                    </tr>`
                )
                .join("")}
        </table>
    `;
    document.getElementById("resultsSection").style.display = "block";
}
