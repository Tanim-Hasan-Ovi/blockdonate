document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn-view-document').forEach(btn => {
        btn.addEventListener('click', function() {
            this.nextElementSibling.style.display = 'block';
        });
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.document-modal').style.display = 'none';
        });
    });

    document.querySelectorAll('.document-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const isRealVote = this.classList.contains('vote-real');
            const campaignCard = this.closest('.campaign-card');

            console.log(`Voted campaign as ${isRealVote ? 'REAL' : 'FAKE'}`);

            const realVotes = campaignCard.querySelector('.real-votes');
            const fakeVotes = campaignCard.querySelector('.fake-votes');

            if (isRealVote) {
                realVotes.textContent = '86% Real';
                fakeVotes.textContent = '14% Fake';
            } else {
                realVotes.textContent = '84% Real';
                fakeVotes.textContent = '16% Fake';
            }

            this.closest('.document-modal').style.display = 'none';

            alert(`Thank you for voting! Your vote has been recorded on the BlockDonate.`);
        });
    });
});

// campaign.js
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const categoryFilter = document.getElementById('category-filter');
    const sortBy = document.getElementById('sort-by');
    const campaignsGrid = document.getElementById('all-campaigns');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Sample campaign data (in a real app, this would come from an API)
    const allCampaigns = Array.from(document.querySelectorAll('.campaign-card')).map(card => {
        return {
            element: card,
            category: card.querySelector('.campaign-category').classList[1], // Gets 'medical', 'education', etc.
            daysLeft: parseInt(card.querySelector('.campaign-deadline').textContent),
            fundedPercent: parseInt(card.querySelector('.progress-fill').style.width),
            dateAdded: new Date() // In a real app, this would come from data
        };
    });

    // Current page state
    let currentPage = 1;
    const campaignsPerPage = 6;
    let filteredCampaigns = [...allCampaigns];

    // Filter campaigns by category
    function filterCampaigns() {
        const selectedCategory = categoryFilter.value;
        
        if (selectedCategory === 'all') {
            filteredCampaigns = [...allCampaigns];
        } else {
            filteredCampaigns = allCampaigns.filter(campaign => 
                campaign.category === selectedCategory
            );
        }
        
        // Reset to first page when filtering
        currentPage = 1;
        sortCampaigns();
        updateCampaignDisplay();
        updatePagination();
    }

    // Sort campaigns
    function sortCampaigns() {
        const sortValue = sortBy.value;
        
        switch(sortValue) {
            case 'newest':
                filteredCampaigns.sort((a, b) => b.dateAdded - a.dateAdded);
                break;
            case 'ending':
                filteredCampaigns.sort((a, b) => a.daysLeft - b.daysLeft);
                break;
            case 'popular':
                filteredCampaigns.sort((a, b) => b.fundedPercent - a.fundedPercent);
                break;
            default:
                // Default sorting (newest first)
                filteredCampaigns.sort((a, b) => b.dateAdded - a.dateAdded);
        }
    }

    // Update campaign display
    function updateCampaignDisplay() {
        // Hide all campaigns first
        allCampaigns.forEach(campaign => {
            campaign.element.style.display = 'none';
        });
        
        // Calculate pagination
        const startIdx = (currentPage - 1) * campaignsPerPage;
        const endIdx = startIdx + campaignsPerPage;
        const campaignsToShow = filteredCampaigns.slice(startIdx, endIdx);
        
        // Show only the filtered and paginated campaigns
        campaignsToShow.forEach(campaign => {
            campaign.element.style.display = 'block';
        });
    }

    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
        
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    // Event listeners
    categoryFilter.addEventListener('change', filterCampaigns);
    sortBy.addEventListener('change', filterCampaigns);
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateCampaignDisplay();
            updatePagination();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateCampaignDisplay();
            updatePagination();
        }
    });

    // Initialize
    filterCampaigns();

    // Document viewer and voting functionality (from previous implementation)
    document.querySelectorAll('.btn-view-document').forEach(btn => {
        btn.addEventListener('click', function() {
            this.nextElementSibling.style.display = 'block';
        });
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.document-modal').style.display = 'none';
        });
    });
    
    document.querySelectorAll('.document-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const isRealVote = this.classList.contains('vote-real');
            const campaignCard = this.closest('.campaign-card');
            
            // In a real app, this would call a smart contract function
            console.log(`Voted campaign as ${isRealVote ? 'REAL' : 'FAKE'}`);
            
            // Update UI
            const realVotes = campaignCard.querySelector('.real-votes');
            const fakeVotes = campaignCard.querySelector('.fake-votes');
            
            // This would come from blockchain data in a real app
            if (isRealVote) {
                realVotes.textContent = `${Math.min(100, parseInt(realVotes.textContent) + 5)}% Real`;
                fakeVotes.textContent = `${Math.max(0, parseInt(fakeVotes.textContent) - 5)}% Fake`;
            } else {
                realVotes.textContent = `${Math.max(0, parseInt(realVotes.textContent) - 5)}% Real`;
                fakeVotes.textContent = `${Math.min(100, parseInt(fakeVotes.textContent) + 5)}% Fake`;
            }
            
            // Close modal after voting
            this.closest('.document-modal').style.display = 'none';
            
            // Show confirmation
            alert(`Thank you for voting! Your vote has been recorded.`);
        });
    });
});