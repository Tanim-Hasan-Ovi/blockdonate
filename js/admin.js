// Sample pending campaigns (in a real app, this would come from a smart contract)
const pendingCampaigns = [
    {
        id: 4,
        title: "Community Park Renovation",
        description: "Renovating the local park with new equipment and landscaping.",
        category: "community",
        goal: 8,
        document: "park_plan.pdf",
        submittedBy: "0x123...456"
    },
    {
        id: 5,
        title: "Animal Shelter Supplies",
        description: "Funds for food and medical supplies for the local animal shelter.",
        category: "community",
        goal: 3,
        document: "shelter_budget.pdf",
        submittedBy: "0x789...012"
    }
];

// Display pending campaigns in admin panel
function displayPendingCampaigns() {
    const pendingContainer = document.getElementById('pending-campaigns');
    if (!pendingContainer) return;
    
    pendingContainer.innerHTML = '';
    
    pendingCampaigns.forEach(campaign => {
        const campaignItem = document.createElement('div');
        campaignItem.className = 'pending-campaign';
        campaignItem.innerHTML = `
            <div class="campaign-info">
                <h3>${campaign.title}</h3>
                <p>${campaign.description}</p>
                <div class="campaign-meta">
                    <span>Category: ${campaign.category}</span>
                    <span>Goal: ${campaign.goal} ETH</span>
                    <span>Submitted by: ${campaign.submittedBy}</span>
                </div>
                <a href="assets/documents/${campaign.document}" target="_blank" class="view-document">View Document</a>
            </div>
            <div class="campaign-actions">
                <button class="btn-approve" data-id="${campaign.id}">Approve</button>
                <button class="btn-reject" data-id="${campaign.id}">Reject</button>
            </div>
        `;
        
        pendingContainer.appendChild(campaignItem);
    });
    
    // Add event listeners for approve/reject buttons
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', function() {
            const campaignId = parseInt(this.getAttribute('data-id'));
            approveCampaign(campaignId);
        });
    });
    
    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function() {
            const campaignId = parseInt(this.getAttribute('data-id'));
            rejectCampaign(campaignId);
        });
    });
}

// Approve a campaign
function approveCampaign(id) {
    // In a real app, this would call a smart contract function
    console.log(`Approving campaign ${id}`);
    alert(`Campaign ${id} approved!`);
    // Remove from pending list
    const index = pendingCampaigns.findIndex(c => c.id === id);
    if (index !== -1) {
        pendingCampaigns.splice(index, 1);
        displayPendingCampaigns();
    }
}

// Reject a campaign
function rejectCampaign(id) {
    // In a real app, this would call a smart contract function
    console.log(`Rejecting campaign ${id}`);
    alert(`Campaign ${id} rejected.`);
    // Remove from pending list
    const index = pendingCampaigns.findIndex(c => c.id === id);
    if (index !== -1) {
        pendingCampaigns.splice(index, 1);
        displayPendingCampaigns();
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    displayPendingCampaigns();
});