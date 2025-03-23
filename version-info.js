/**
 * Version Info Module
 * Displays application name, version, and latest commit details in the footer
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const appVersionElement = document.getElementById('app-version');
    const commitInfoElement = document.getElementById('commit-info');

    // Initialize with package.json version
    const appName = 'Snake Game';
    // This will be replaced with the actual version from package.json during build
    const appVersion = 'v' + (window.APP_VERSION || '0.1.0');

    // Update app version display with a subtle animation
    appVersionElement.innerHTML = `<span class="app-name">${appName}</span> <span class="version-number">${appVersion}</span>`;

    // Add tooltip to version element
    appVersionElement.title = `Application version: ${appVersion}\nBuilt with Docker and TensorFlow.js`;

    // Function to fetch the latest commit info
    async function fetchLatestCommitInfo() {
        try {
            // Create a unique URL to avoid caching
            const timestamp = new Date().getTime();
            const response = await fetch(`commit-info.json?t=${timestamp}`);

            if (!response.ok) {
                throw new Error('Failed to fetch commit info');
            }

            const commitData = await response.json();

            // Format the date properly to handle various date formats
            let commitDate;
            try {
                // Try to parse the date string
                commitDate = new Date(commitData.date);

                // Check if date is valid
                if (isNaN(commitDate.getTime())) {
                    throw new Error('Invalid date');
                }
            } catch (e) {
                // If date parsing fails, try alternative format (Git date format)
                const dateMatch = commitData.date.match(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})/);
                if (dateMatch) {
                    commitDate = new Date(
                        parseInt(dateMatch[1]), // year
                        parseInt(dateMatch[2]) - 1, // month (0-based)
                        parseInt(dateMatch[3]), // day
                        parseInt(dateMatch[4]), // hour
                        parseInt(dateMatch[5]), // minute
                        parseInt(dateMatch[6])  // second
                    );
                } else {
                    // Fallback to current date if parsing fails
                    commitDate = new Date();
                }
            }

            // Format the date in a human-friendly way in the user's local time zone
            // First ensure we're working with the user's local time by creating a new date
            // This forces the date to be interpreted in the user's local time zone
            const localDate = new Date(commitDate.getTime());

            // Helper function to get the day suffix (st, nd, rd, th)
            function getDaySuffix(day) {
                if (day > 3 && day < 21) return 'th';
                switch (day % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                }
            }

            // Get date components
            const day = localDate.getDate();
            const month = localDate.toLocaleString('en', { month: 'short' });
            const year = localDate.getFullYear();
            const hour = localDate.getHours();
            const minute = localDate.getMinutes().toString().padStart(2, '0');
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12; // Convert 24h to 12h format
            const timeZone = new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(localDate)
                .find(part => part.type === 'timeZoneName').value;

            // Format the date with the day suffix
            const formattedDate = `${month} ${day}${getDaySuffix(day)}, ${year} at ${hour12}:${minute} ${ampm} ${timeZone}`;

            // Create the GitHub commit URL
            const repoUrl = 'https://github.com/TheRobBrennan/snake-game-tensorflow-docker';
            const commitUrl = `${repoUrl}/commit/${commitData.hash}`;

            // Update the commit info display with a link to the commit
            commitInfoElement.innerHTML = `<a href="${commitUrl}" target="_blank" class="commit-link" title="View commit on GitHub">${commitData.hash}</a> • ${commitData.branch} • ${formattedDate}`;
            commitInfoElement.title = `Branch: ${commitData.branch}\nCommit: ${commitData.hash}\nDate: ${commitData.date}`;
        } catch (error) {
            console.error('Error fetching commit info:', error);
            commitInfoElement.textContent = 'Git info unavailable';
        }
    }

    // Call the function to fetch commit info
    fetchLatestCommitInfo();
});
