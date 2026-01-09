// fitur/utils.js

/**
 * Utility functions for preview handling
 */

const PreviewUtils = {
    /**
     * Convert blob to base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    /**
     * Download file from base64
     */
    downloadImage(base64Data, filename) {
        const link = document.createElement('a');
        link.href = base64Data;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('File downloaded successfully!', 'success');
    },

    /**
     * Download blob
     */
    downloadBlob(base64Data, filename) {
        this.downloadImage(base64Data, filename);
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.showToast('Failed to copy', 'error');
        }
    },

    /**
     * Open URL in new tab
     */
    openInNewTab(url) {
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head><title>Preview</title></head>
                <body style="margin:0;background:#1f2937;">
                    <div style="display:flex;justify-content:center;align-items:center;height:100vh;">
                        <img src="${url}" style="max-width:90%;max-height:90%;border:1px solid #374151;border-radius:8px;">
                    </div>
                </body>
            </html>
        `);
    },

    /**
     * Open HTML in new tab
     */
    openHtmlInNewTab(htmlContent) {
        const newWindow = window.open();
        newWindow.document.write(htmlContent);
    },

    /**
     * Open PDF in new tab
     */
    openPdfInNewTab(base64Data) {
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head><title>PDF Preview</title></head>
                <body style="margin:0;">
                    <iframe 
                        src="${base64Data}" 
                        style="width:100%;height:100vh;border:none;"
                    ></iframe>
                </body>
            </html>
        `);
    },

    /**
     * Enlarge image
     */
    enlargeImage(imgElement) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-zoom-out';
        
        const enlargedImg = document.createElement('img');
        enlargedImg.src = imgElement.src;
        enlargedImg.className = 'max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl';
        
        overlay.appendChild(enlargedImg);
        overlay.onclick = () => document.body.removeChild(overlay);
        document.body.appendChild(overlay);
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-amber-600',
            warning: 'bg-yellow-600'
        };

        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-sans z-50`;
        toast.textContent = message;
        toast.style.animation = 'fadeIn 0.3s ease-out';

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    },

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Detect file type from content type
     */
    getFileType(contentType) {
        const types = {
            'image/': 'Image',
            'audio/': 'Audio',
            'video/': 'Video',
            'application/pdf': 'PDF',
            'text/html': 'HTML',
            'application/json': 'JSON',
            'text/plain': 'Text'
        };

        for (const [key, value] of Object.entries(types)) {
            if (contentType.includes(key)) {
                return value;
            }
        }
        return 'File';
    }
};

// Add CSS animations for toast
if (!document.querySelector('#preview-styles')) {
    const style = document.createElement('style');
    style.id = 'preview-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(10px); }
        }
    `;
    document.head.appendChild(style);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreviewUtils;
} else {
    window.PreviewUtils = PreviewUtils;
}