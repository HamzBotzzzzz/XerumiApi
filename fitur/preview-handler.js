// fitur/preview-handler.js

/**
 * Preview handler untuk berbagai tipe konten
 */

const PreviewHandler = {
    /**
     * Handle binary image response
     */
    async handleImagePreview(blob, responseTime, dailyUsage, dailyLimit) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onloadend = function() {
                const base64data = reader.result;
                const imageSize = (blob.size / 1024).toFixed(2);
                const mimeType = blob.type || 'image/png';
                
                const html = `
                    <div class="flex justify-between items-center mb-2 text-xs">
                        <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                        <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
                    </div>
                    
                    <div class="mb-3 p-3 bg-green-900/20 border border-green-700/30 rounded">
                        <div class="flex items-center">
                            <span class="material-icons text-green-400 text-sm mr-2">check_circle</span>
                            <div>
                                <span class="text-green-300 font-bold text-xs">Image Loaded Successfully</span>
                                <div class="text-gray-400 text-xs mt-1">
                                    Size: ${imageSize} KB | Type: ${mimeType}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 p-4 border border-gray-700 rounded-lg mb-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center">
                                <span class="material-icons text-amber-400 text-sm mr-2">image</span>
                                <span class="text-gray-300 text-sm font-sans">Image Preview</span>
                            </div>
                            <span class="text-xs text-gray-500 font-sans">Click to enlarge</span>
                        </div>
                        
                        <div class="text-center">
                            <img src="${base64data}" 
                                 alt="Image Preview" 
                                 class="max-w-full h-auto rounded-lg border border-gray-600 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                                 style="max-height: 280px;"
                                 onclick="PreviewUtils.enlargeImage(this)">
                        </div>
                        
                        <div class="mt-4 flex flex-wrap gap-2 justify-center">
                            <button onclick="PreviewUtils.downloadImage('${base64data}', 'image-${Date.now()}.png')" 
                                    class="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-sans flex items-center">
                                <span class="material-icons text-xs mr-1">download</span>
                                Download Image
                            </button>
                            
                            <button onclick="PreviewUtils.copyToClipboard('${base64data}')" 
                                    class="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 text-xs rounded font-sans flex items-center">
                                <span class="material-icons text-xs mr-1">content_copy</span>
                                Copy Base64
                            </button>
                            
                            <button onclick="PreviewUtils.openInNewTab('${base64data}')" 
                                    class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-sans flex items-center">
                                <span class="material-icons text-xs mr-1">open_in_new</span>
                                Open in New Tab
                            </button>
                        </div>
                    </div>
                    
                    <details class="mt-4">
                        <summary class="text-gray-400 cursor-pointer hover:text-gray-300 text-xs font-sans flex items-center">
                            <span class="material-icons text-xs mr-1">code</span>
                            View Base64 Data (truncated)
                        </summary>
                        <div class="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
                            <div class="text-gray-500 text-xs mb-1">First 200 characters:</div>
                            <div class="font-mono text-xs text-gray-300 break-all bg-gray-900 p-2 rounded">
                                ${base64data.substring(0, 200)}...
                            </div>
                            <div class="text-gray-500 text-xs mt-2">Full length: ${base64data.length} characters</div>
                        </div>
                    </details>
                `;
                
                resolve(html);
            };
            
            reader.readAsDataURL(blob);
        });
    },

    /**
     * Handle Base64 image dari JSON response
     */
    async handleBase64Image(base64Data, responseTime, dailyUsage, dailyLimit, metaData = {}) {
        const html = `
            <div class="flex justify-between items-center mb-2 text-xs">
                <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
            </div>
            
            <div class="mb-3 p-3 bg-green-900/20 border border-green-700/30 rounded">
                <div class="flex items-center">
                    <span class="material-icons text-green-400 text-sm mr-2">check_circle</span>
                    <div>
                        <span class="text-green-300 font-bold text-xs">Image Loaded Successfully</span>
                        ${metaData.message ? `<div class="text-gray-400 text-xs mt-1">${metaData.message}</div>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-900 p-4 border border-gray-700 rounded-lg mb-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                        <span class="material-icons text-amber-400 text-sm mr-2">image</span>
                        <span class="text-gray-300 text-sm font-sans">Image Preview</span>
                    </div>
                    <span class="text-xs text-gray-500 font-sans">Click to enlarge</span>
                </div>
                
                <div class="text-center">
                    <img src="${base64Data}" 
                         alt="Image Preview" 
                         class="max-w-full h-auto rounded-lg border border-gray-600 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                         style="max-height: 280px;"
                         onclick="PreviewUtils.enlargeImage(this)">
                </div>
                
                <div class="mt-4 flex flex-wrap gap-2 justify-center">
                    <button onclick="PreviewUtils.downloadImage('${base64Data}', 'image-${Date.now()}.png')" 
                            class="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-sans flex items-center">
                        <span class="material-icons text-xs mr-1">download</span>
                        Download Image
                    </button>
                    
                    <button onclick="PreviewUtils.copyToClipboard('${base64Data}')" 
                            class="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 text-xs rounded font-sans flex items-center">
                        <span class="material-icons text-xs mr-1">content_copy</span>
                        Copy Base64
                    </button>
                </div>
            </div>
            
            <details class="mt-4">
                <summary class="text-gray-400 cursor-pointer hover:text-gray-300 text-xs font-sans flex items-center">
                    <span class="material-icons text-xs mr-1">code</span>
                    View Base64 Data (truncated)
                </summary>
                <div class="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
                    <div class="text-gray-500 text-xs mb-1">First 200 characters:</div>
                    <div class="font-mono text-xs text-gray-300 break-all bg-gray-900 p-2 rounded">
                        ${base64Data.substring(0, 200)}...
                    </div>
                    <div class="text-gray-500 text-xs mt-2">Full length: ${base64Data.length} characters</div>
                </div>
            </details>
        `;
        
        return html;
    },

    /**
     * Handle HTML response
     */
    async handleHtmlPreview(htmlContent, responseTime, dailyUsage, dailyLimit) {
        const html = `
            <div class="flex justify-between items-center mb-2 text-xs">
                <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
            </div>
            
            <div class="mb-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded">
                <div class="flex items-center">
                    <span class="material-icons text-blue-400 text-sm mr-2">html</span>
                    <span class="text-blue-300 font-bold text-xs">HTML Content</span>
                </div>
            </div>
            
            <div class="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                <div class="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                    <span class="text-gray-300 text-xs font-sans">HTML Preview</span>
                    <button onclick="PreviewUtils.openHtmlInNewTab(\`${htmlContent.replace(/`/g, '\\`')}\`)" 
                            class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded text-xs">
                        Open in New Tab
                    </button>
                </div>
                <div class="p-4">
                    <iframe 
                        srcdoc="${htmlContent.replace(/"/g, '&quot;')}"
                        class="w-full h-64 border border-gray-600 rounded bg-white"
                        sandbox="allow-same-origin"
                    ></iframe>
                </div>
            </div>
            
            <details class="mt-4">
                <summary class="text-gray-400 cursor-pointer hover:text-gray-300 text-xs font-sans flex items-center">
                    <span class="material-icons text-xs mr-1">code</span>
                    View HTML Source
                </summary>
                <div class="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
                    <pre class="font-mono text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-64">${htmlContent}</pre>
                </div>
            </details>
        `;
        
        return html;
    },

    /**
     * Handle PDF response
     */
    async handlePdfPreview(blob, responseTime, dailyUsage, dailyLimit) {
        const base64data = await PreviewUtils.blobToBase64(blob);
        
        const html = `
            <div class="flex justify-between items-center mb-2 text-xs">
                <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
            </div>
            
            <div class="mb-3 p-3 bg-red-900/20 border border-red-700/30 rounded">
                <div class="flex items-center">
                    <span class="material-icons text-red-400 text-sm mr-2">picture_as_pdf</span>
                    <span class="text-red-300 font-bold text-xs">PDF Document</span>
                    <span class="text-gray-400 text-xs ml-2">Size: ${(blob.size / 1024).toFixed(2)} KB</span>
                </div>
            </div>
            
            <div class="bg-gray-900 p-4 border border-gray-700 rounded-lg">
                <div class="flex flex-wrap gap-2 justify-center">
                    <button onclick="PreviewUtils.downloadImage('${base64data}', 'document-${Date.now()}.pdf')" 
                            class="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-sans flex items-center">
                        <span class="material-icons text-xs mr-1">download</span>
                        Download PDF
                    </button>
                    
                    <button onclick="PreviewUtils.openPdfInNewTab('${base64data}')" 
                            class="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs rounded font-sans flex items-center">
                        <span class="material-icons text-xs mr-1">open_in_new</span>
                        Open PDF
                    </button>
                    
                    <button onclick="PreviewUtils.copyToClipboard('${base64data}')" 
                            class="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 text-xs rounded font-sans flex items-center">
                        <span class="material-icons text-xs mr-1">content_copy</span>
                        Copy Base64
                    </button>
                </div>
                
                <div class="mt-4 text-center text-gray-500 text-xs">
                    <span class="material-icons text-lg">picture_as_pdf</span>
                    <p class="mt-2">PDF preview is not available inline.<br>Click "Open PDF" to view the document.</p>
                </div>
            </div>
        `;
        
        return html;
    },

    /**
     * Handle audio response
     */
    async handleAudioPreview(blob, responseTime, dailyUsage, dailyLimit) {
        const base64data = await PreviewUtils.blobToBase64(blob);
        const audioType = blob.type || 'audio/mpeg';
        
        const html = `
            <div class="flex justify-between items-center mb-2 text-xs">
                <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
            </div>
            
            <div class="mb-3 p-3 bg-purple-900/20 border border-purple-700/30 rounded">
                <div class="flex items-center">
                    <span class="material-icons text-purple-400 text-sm mr-2">audiotrack</span>
                    <span class="text-purple-300 font-bold text-xs">Audio File</span>
                    <span class="text-gray-400 text-xs ml-2">Size: ${(blob.size / 1024).toFixed(2)} KB | Type: ${audioType}</span>
                </div>
            </div>
            
            <div class="bg-gray-900 p-4 border border-gray-700 rounded-lg">
                <div class="flex flex-col items-center">
                    <audio controls class="w-full max-w-md">
                        <source src="${base64data}" type="${audioType}">
                        Your browser does not support the audio element.
                    </audio>
                    
                    <div class="mt-4 flex flex-wrap gap-2 justify-center">
                        <button onclick="PreviewUtils.downloadImage('${base64data}', 'audio-${Date.now()}.${audioType.split('/')[1] || 'mp3'}')" 
                                class="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-sans flex items-center">
                            <span class="material-icons text-xs mr-1">download</span>
                            Download Audio
                        </button>
                        
                        <button onclick="PreviewUtils.copyToClipboard('${base64data}')" 
                                class="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 text-xs rounded font-sans flex items-center">
                            <span class="material-icons text-xs mr-1">content_copy</span>
                            Copy Base64
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    },

    /**
     * Main handler - auto detect content type
     */
    async handleResponse(response, responseTime, dailyUsage, dailyLimit) {
        const contentType = response.headers.get('content-type') || '';
        const isError = response.status >= 400;
        
        if (isError) {
            const text = await response.text();
            return `
                <div class="p-4 bg-red-900/30 border border-red-700/50 rounded">
                    <div class="flex items-center">
                        <span class="material-icons text-red-400 mr-2">error</span>
                        <span class="text-red-300 font-bold">HTTP ${response.status}</span>
                    </div>
                    <pre class="text-gray-300 text-xs mt-2 whitespace-pre-wrap">${text}</pre>
                </div>
            `;
        }
        
        // Check content type
        if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            return await this.handleImagePreview(blob, responseTime, dailyUsage, dailyLimit);
        }
        else if (contentType.includes('application/json')) {
            const data = await response.json();
            
            // Check if JSON contains base64 image
            if (data.image && data.image.startsWith('data:image')) {
                return await this.handleBase64Image(
                    data.image, 
                    responseTime, 
                    dailyUsage, 
                    dailyLimit,
                    { message: data.message }
                );
            }
            
            // Regular JSON response
            return `
                <div class="flex justify-between items-center mb-2 text-xs">
                    <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                    <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
                </div>
                <pre class="font-code text-sm bg-gray-800 p-4 rounded border border-gray-700 overflow-auto max-h-96">${JSON.stringify(data, null, 2)}</pre>
            `;
        }
        else if (contentType.includes('text/html')) {
            const htmlContent = await response.text();
            return await this.handleHtmlPreview(htmlContent, responseTime, dailyUsage, dailyLimit);
        }
        else if (contentType.includes('application/pdf')) {
            const blob = await response.blob();
            return await this.handlePdfPreview(blob, responseTime, dailyUsage, dailyLimit);
        }
        else if (contentType.startsWith('audio/')) {
            const blob = await response.blob();
            return await this.handleAudioPreview(blob, responseTime, dailyUsage, dailyLimit);
        }
        else if (contentType.includes('text/')) {
            const text = await response.text();
            return `
                <div class="flex justify-between items-center mb-2 text-xs">
                    <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                    <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
                </div>
                <pre class="font-code text-sm bg-gray-800 p-4 rounded border border-gray-700 overflow-auto max-h-96 whitespace-pre-wrap">${text}</pre>
            `;
        }
        else {
            // Default: try as binary
            const blob = await response.blob();
            return `
                <div class="flex justify-between items-center mb-2 text-xs">
                    <span class="text-gray-400 font-sans">Response time: ${responseTime}ms</span>
                    <span class="text-amber-300 font-sans">Remaining today: ${dailyLimit - dailyUsage}/${dailyLimit}</span>
                </div>
                <div class="p-4 bg-gray-800 border border-gray-700 rounded">
                    <div class="text-center">
                        <span class="material-icons text-gray-400 text-4xl">insert_drive_file</span>
                        <p class="text-gray-400 text-xs mt-2">Binary File</p>
                        <p class="text-gray-500 text-xs">Size: ${(blob.size / 1024).toFixed(2)} KB | Type: ${contentType}</p>
                        <button onclick="PreviewUtils.downloadBlob(${JSON.stringify(await PreviewUtils.blobToBase64(blob))}, 'file-${Date.now()}.bin')" 
                                class="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded">
                            Download File
                        </button>
                    </div>
                </div>
            `;
        }
    }
};

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreviewHandler;
} else {
    window.PreviewHandler = PreviewHandler;
}