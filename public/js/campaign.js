// Global variable to store fetched campaigns
let campaigns = [];
let currentPage = 1;
const itemsPerPage = 6;

// Fetch campaigns from the server
fetch('/api/campaigns') // /campaigns → /api/campaigns
    .then(response => response.json())
    .then(data => {
        campaigns = data;
        renderPage(currentPage);
    })
    .catch(error => console.error('Error fetching campaigns:', error));


function renderPage(page) {
    const campaignsGrid = document.getElementById('all-campaigns');

    // Clear the grid before adding new campaigns to avoid duplication
    campaignsGrid.innerHTML = ''; 

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = campaigns.slice(start, end);

    if (pageItems.length === 0) {
        campaignsGrid.innerHTML = '<p>No campaigns found.</p>';
        return;
    }

    // Iterate through campaigns to create campaign cards
    pageItems.forEach(campaign => {
        const campaignCard = document.createElement('div');
        campaignCard.classList.add('campaign-card');

        const progress = campaign.progress || 0;
        const raised = campaign.raised || 0;

        campaignCard.innerHTML = `
            <div class="campaign-image">
    <img src="/uploads/cover-images/${campaign.cover_image}" alt="Campaign Image">
</div>


            <div class="campaign-content">
                <h3 class="campaign-title">${campaign.title}</h3>
                <p class="campaign-description">${campaign.description}</p>
                <div class="campaign-meta">
                    <span class="campaign-category ${campaign.category?.toLowerCase() || ''}">${campaign.category || ''}</span>
                    <span class="campaign-deadline">${campaign.duration || 0} days left</span>
                </div>

                <!-- View Documents Button -->
                <div class="campaign-document">
                    <button class="btn-view-document" onclick="viewDocuments(${campaign.id})">
                        <i class="fas fa-file-alt"></i> View Documents
                    </button>
                </div>

                <div class="campaign-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-info">
                        <span>${raised} ETH</span>
                        <span>${progress}% funded</span>
                    </div>
                </div>
                <div class="campaign-actions">
    <a href="wallet.html" class="btn-donate">Donate Now</a>
</div>

            </div>

            <!-- Document container (hidden by default) -->
            <div id="documents-${campaign.id}" class="documents-container" style="display: none;">
                <!-- Documents will be displayed here -->
            </div>
        `;

        campaignsGrid.appendChild(campaignCard);
    });

    updatePagination();
}

// Function to open the document directly on button click
function viewDocuments(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || !campaign.documents || campaign.documents.length === 0) return;

    // Open the first document directly in a new tab
    window.open(campaign.documents[0].filePath, '_blank');
}

// Pagination
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPage * itemsPerPage < campaigns.length) {
        currentPage++;
        renderPage(currentPage);
    }
});

function updatePagination() {
    pageInfo.textContent = `Page ${currentPage}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage * itemsPerPage >= campaigns.length;
}
