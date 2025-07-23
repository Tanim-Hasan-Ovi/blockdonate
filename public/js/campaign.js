// Global variable to store fetched campaigns
let campaigns = [];

// Fetch campaigns from the server
fetch('/campaigns')
    .then(response => response.json())
    .then(data => {
        campaigns = data;  // Store the campaigns data globally
        const campaignsGrid = document.getElementById('all-campaigns');

        // Clear the grid before adding new campaigns to avoid duplication
        campaignsGrid.innerHTML = ''; // Clears previous campaigns

        // Iterate through campaigns to create campaign cards
        campaigns.forEach(campaign => {
            const campaignCard = document.createElement('div');
            campaignCard.classList.add('campaign-card');

            campaignCard.innerHTML = `
                <div class="campaign-image">
                    <img src="uploads/${campaign.cover_image}" alt="Campaign Image">
                </div>
                <div class="campaign-content">
                    <h3 class="campaign-title">${campaign.title}</h3>
                    <p class="campaign-description">${campaign.description}</p>
                    <div class="campaign-meta">
                        <span class="campaign-category ${campaign.category.toLowerCase()}">${campaign.category}</span>
                        <span class="campaign-deadline">${campaign.duration} days left</span>
                    </div>

                    <!-- View Documents Button -->
                    <div class="campaign-document">
                        <button class="btn-view-document" onclick="viewDocuments(${campaign.id})">
                            <i class="fas fa-file-alt"></i> View Documents
                        </button>
                    </div>

                    <div class="campaign-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${campaign.progress}%"></div>
                        </div>
                        <div class="progress-info">
                            <span>${campaign.raised} ETH</span>
                            <span>${campaign.progress}% funded</span>
                        </div>
                    </div>
                    <div class="campaign-actions">
                        <button class="btn-donate">Donate Now</button>
                    </div>
                </div>

                <!-- Document container (hidden by default) -->
                <div id="documents-${campaign.id}" class="documents-container" style="display: none;">
                    <!-- Documents will be displayed here -->
                </div>
            `;

            campaignsGrid.appendChild(campaignCard);
        });
    })
    .catch(error => console.error('Error fetching campaigns:', error));

// Function to open the document directly on button click
function viewDocuments(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);

    if (campaign && campaign.documents.length > 0) {
        // Open the first document directly in a new tab
        const firstDocument = campaign.documents[0];
        window.open(firstDocument.filePath, '_blank');  // Opens the document in a new tab
    }
}

