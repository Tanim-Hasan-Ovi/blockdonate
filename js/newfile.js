document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('campaign-document');
    const filePreview = document.getElementById('file-preview');
    let filesArray = []; // Array to store our files
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        // Add new files to our array
        if (this.files && this.files.length > 0) {
            filesArray = [...filesArray, ...Array.from(this.files)];
            updateFilePreviews();
        }
    });
    
    // Update the preview container
    function updateFilePreviews() {
        filePreview.innerHTML = '';
        
        if (filesArray.length === 0) {
            // Reset the file input if all files are removed
            fileInput.value = '';
            return;
        }
        
        filesArray.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            fileItem.setAttribute('data-index', index);
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    fileItem.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${formatFileSize(file.size)}</div>
                        </div>
                        <div class="remove-file">×</div>
                    `;
                    addRemoveHandler(fileItem, index);
                };
                reader.readAsDataURL(file);
            } else {
                fileItem.classList.add('pdf');
                fileItem.innerHTML = `
                    <i class="fas fa-file-pdf"></i>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                    <div class="remove-file">×</div>
                `;
                addRemoveHandler(fileItem, index);
            }
            
            filePreview.appendChild(fileItem);
        });
        
        // Create a new DataTransfer object to update the files
        updateFileInput();
    }
    
    // Add click handler for remove buttons
    function addRemoveHandler(element, index) {
        element.querySelector('.remove-file').addEventListener('click', function(e) {
            e.stopPropagation();
            filesArray.splice(index, 1); // Remove file from array
            updateFilePreviews(); // Refresh previews
        });
    }
    
    // Update the actual file input with our files
    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        filesArray.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Add drag and drop functionality
    const dropArea = document.querySelector('.file-upload-label');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            filesArray = [...filesArray, ...Array.from(files)];
            updateFilePreviews();
        }
    }
});