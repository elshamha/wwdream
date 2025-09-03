/**
 * Editor Performance Optimizations
 * Handles fast copy/paste operations and text processing
 */

class EditorPerformance {
    constructor(editorElement) {
        this.editor = editorElement;
        this.debounceTimeout = null;
        this.processingQueue = [];
        this.isProcessing = false;
        this.virtualBuffer = '';
        this.lastKnownPosition = 0;
        
        this.init();
    }
    
    init() {
        this.setupClipboardHandlers();
        this.setupKeyboardHandlers();
        this.setupTextProcessing();
        this.optimizeRendering();
    }
    
    /**
     * Setup optimized clipboard handlers for fast copy/paste
     */
    setupClipboardHandlers() {
        // Optimized paste handler
        this.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            this.handleOptimizedPaste(e);
        });
        
        // Optimized copy handler
        this.editor.addEventListener('copy', (e) => {
            this.handleOptimizedCopy(e);
        });
        
        // Optimized cut handler
        this.editor.addEventListener('cut', (e) => {
            e.preventDefault();
            this.handleOptimizedCut(e);
        });
    }
    
    /**
     * Handle large paste operations efficiently
     */
    async handleOptimizedPaste(event) {
        const clipboardData = event.clipboardData || window.clipboardData;
        let pastedText = '';
        
        // Try different clipboard data formats
        if (clipboardData.types.includes('text/html')) {
            pastedText = clipboardData.getData('text/html');
            pastedText = this.sanitizeHTML(pastedText);
        } else if (clipboardData.types.includes('text/plain')) {
            pastedText = clipboardData.getData('text/plain');
        } else {
            return;
        }
        
        // Show loading indicator for large pastes
        if (pastedText.length > 10000) {
            this.showProcessingIndicator('Processing large paste...');
        }
        
        try {
            // Process text in chunks for better performance
            await this.insertTextOptimized(pastedText);
        } catch (error) {
            console.error('Paste operation failed:', error);
            this.showError('Paste operation failed. Please try again.');
        } finally {
            this.hideProcessingIndicator();
        }
    }
    
    /**
     * Handle copy operations with formatting preservation
     */
    handleOptimizedCopy(event) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        const selectedContent = range.cloneContents();
        
        // Create both HTML and plain text versions
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(selectedContent.cloneNode(true));
        
        const htmlContent = tempDiv.innerHTML;
        const plainText = tempDiv.textContent || tempDiv.innerText;
        
        // Set clipboard data with both formats
        event.clipboardData.setData('text/html', htmlContent);
        event.clipboardData.setData('text/plain', plainText);
        
        // Provide visual feedback
        this.showCopyFeedback();
    }
    
    /**
     * Handle cut operations efficiently
     */
    handleOptimizedCut(event) {
        this.handleOptimizedCopy(event);
        
        // Delete selected content
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            selection.deleteFromDocument();
            this.triggerChangeEvent();
        }
    }
    
    /**
     * Insert text with chunked processing for large content
     */
    async insertTextOptimized(text) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // For small text, insert directly
        if (text.length < 5000) {
            this.insertTextDirect(text, range);
            return;
        }
        
        // For large text, use chunked insertion
        await this.insertTextChunked(text, range);
    }
    
    /**
     * Direct text insertion for small content
     */
    insertTextDirect(text, range) {
        // Delete existing selection
        range.deleteContents();
        
        // Create text node or document fragment
        if (text.includes('<') && text.includes('>')) {
            // HTML content
            const fragment = this.createDocumentFragment(text);
            range.insertNode(fragment);
        } else {
            // Plain text
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
        }
        
        // Move cursor to end of inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        this.triggerChangeEvent();
    }
    
    /**
     * Chunked text insertion for large content
     */
    async insertTextChunked(text, range) {
        const chunkSize = 1000;
        const chunks = this.splitTextIntoChunks(text, chunkSize);
        
        // Delete existing selection first
        range.deleteContents();
        
        // Insert chunks with yielding to prevent UI blocking
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            if (chunk.includes('<') && chunk.includes('>')) {
                const fragment = this.createDocumentFragment(chunk);
                range.insertNode(fragment);
            } else {
                const textNode = document.createTextNode(chunk);
                range.insertNode(textNode);
            }
            
            // Move range to end of inserted content
            range.collapse(false);
            
            // Update progress
            if (chunks.length > 5) {
                this.updateProcessingProgress((i + 1) / chunks.length * 100);
            }
            
            // Yield control to prevent blocking UI
            if (i % 5 === 0) {
                await this.yieldToEventLoop();
            }
        }
        
        // Final cleanup
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        this.triggerChangeEvent();
    }
    
    /**
     * Split text into manageable chunks
     */
    splitTextIntoChunks(text, chunkSize) {
        const chunks = [];
        
        // Try to split at natural boundaries (sentences, paragraphs)
        const paragraphs = text.split('\n\n');
        let currentChunk = '';
        
        for (const paragraph of paragraphs) {
            if (currentChunk.length + paragraph.length > chunkSize && currentChunk) {
                chunks.push(currentChunk);
                currentChunk = paragraph;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    }
    
    /**
     * Create document fragment from HTML string
     */
    createDocumentFragment(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString;
        return template.content;
    }
    
    /**
     * Sanitize HTML content for security
     */
    sanitizeHTML(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Remove potentially dangerous elements and attributes
        const dangerousElements = tempDiv.querySelectorAll('script, iframe, object, embed, form');
        dangerousElements.forEach(el => el.remove());
        
        // Remove dangerous attributes
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(el => {
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('on') || attr.name === 'style' && attr.value.includes('javascript:')) {
                    el.removeAttribute(attr.name);
                }
            });
        });
        
        return tempDiv.innerHTML;
    }
    
    /**
     * Setup keyboard handlers for performance
     */
    setupKeyboardHandlers() {
        // Debounced input handler to avoid excessive processing
        this.editor.addEventListener('input', (e) => {
            this.debounceInput(e);
        });
        
        // Handle keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'v':
                        // Paste is handled by clipboard handler
                        break;
                    case 'c':
                        // Copy is handled by clipboard handler
                        break;
                    case 'x':
                        // Cut is handled by clipboard handler
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            this.handleRedo();
                        } else {
                            this.handleUndo();
                        }
                        e.preventDefault();
                        break;
                    case 'y':
                        this.handleRedo();
                        e.preventDefault();
                        break;
                }
            }
        });
    }
    
    /**
     * Debounced input processing
     */
    debounceInput(event) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.processInput(event);
        }, 150); // Reduced from typical 300ms for better responsiveness
    }
    
    /**
     * Process input changes efficiently
     */
    processInput(event) {
        // Add to processing queue to avoid overwhelming the system
        this.processingQueue.push({
            type: 'input',
            data: event.data,
            timestamp: Date.now()
        });
        
        this.processQueue();
    }
    
    /**
     * Process queued operations
     */
    async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0) {
            return;
        }
        
        this.isProcessing = true;
        
        try {
            while (this.processingQueue.length > 0) {
                const operation = this.processingQueue.shift();
                await this.processOperation(operation);
                
                // Yield occasionally to keep UI responsive
                if (this.processingQueue.length % 10 === 0) {
                    await this.yieldToEventLoop();
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Process individual operation
     */
    async processOperation(operation) {
        switch (operation.type) {
            case 'input':
                this.updateWordCount();
                this.checkForAutoCorrections();
                this.triggerAutosave();
                break;
            // Add more operation types as needed
        }
    }
    
    /**
     * Setup text processing optimizations
     */
    setupTextProcessing() {
        // Virtual scrolling for very large documents
        this.setupVirtualScrolling();
        
        // Optimize text selection and cursor positioning
        this.optimizeSelection();
        
        // Setup text analysis workers for background processing
        this.setupTextAnalysisWorker();
    }
    
    /**
     * Setup virtual scrolling for large documents
     */
    setupVirtualScrolling() {
        if (!this.editor.dataset.virtualScroll) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadTextChunk(entry.target);
                } else {
                    this.unloadTextChunk(entry.target);
                }
            });
        });
        
        // Observe text chunks
        this.editor.querySelectorAll('[data-text-chunk]').forEach(chunk => {
            observer.observe(chunk);
        });
    }
    
    /**
     * Optimize selection operations
     */
    optimizeSelection() {
        let selectionTimeout = null;
        
        document.addEventListener('selectionchange', () => {
            clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(() => {
                this.handleSelectionChange();
            }, 100);
        });
    }
    
    /**
     * Handle selection changes efficiently
     */
    handleSelectionChange() {
        const selection = window.getSelection();
        
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
            // Store selection for optimization
            this.lastSelection = {
                text: selection.toString(),
                range: selection.getRangeAt(0).cloneRange(),
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * Setup web worker for text analysis
     */
    setupTextAnalysisWorker() {
        if (typeof Worker === 'undefined') return;
        
        // Create worker for background text processing
        const workerCode = `
            self.onmessage = function(e) {
                const { text, operation } = e.data;
                
                switch (operation) {
                    case 'wordCount':
                        const words = text.trim().split(/\\s+/).filter(word => word.length > 0);
                        self.postMessage({ result: words.length, operation: 'wordCount' });
                        break;
                    
                    case 'spellCheck':
                        // Basic spell checking logic
                        const issues = [];
                        // Add spell checking logic here
                        self.postMessage({ result: issues, operation: 'spellCheck' });
                        break;
                    
                    case 'textAnalysis':
                        const analysis = {
                            characters: text.length,
                            sentences: text.split(/[.!?]+/).length - 1,
                            paragraphs: text.split(/\\n\\s*\\n/).length,
                            readingTime: Math.ceil(text.split(/\\s+/).length / 200)
                        };
                        self.postMessage({ result: analysis, operation: 'textAnalysis' });
                        break;
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.textWorker = new Worker(URL.createObjectURL(blob));
        
        this.textWorker.onmessage = (e) => {
            this.handleWorkerMessage(e.data);
        };
    }
    
    /**
     * Handle worker messages
     */
    handleWorkerMessage(data) {
        const { result, operation } = data;
        
        switch (operation) {
            case 'wordCount':
                this.updateWordCountDisplay(result);
                break;
            case 'textAnalysis':
                this.updateTextAnalysisDisplay(result);
                break;
            // Handle other operations
        }
    }
    
    /**
     * Optimize rendering performance
     */
    optimizeRendering() {
        // Use requestAnimationFrame for DOM updates
        this.renderingQueue = [];
        this.isRenderingQueued = false;
        
        // Batch DOM updates
        this.batchDOMUpdates();
    }
    
    /**
     * Batch DOM updates for better performance
     */
    batchDOMUpdates() {
        if (this.isRenderingQueued) return;
        
        this.isRenderingQueued = true;
        
        requestAnimationFrame(() => {
            // Process all queued rendering operations
            this.renderingQueue.forEach(operation => {
                operation();
            });
            
            this.renderingQueue = [];
            this.isRenderingQueued = false;
        });
    }
    
    /**
     * Queue rendering operation
     */
    queueRenderingOperation(operation) {
        this.renderingQueue.push(operation);
        this.batchDOMUpdates();
    }
    
    /**
     * Utility function to yield to event loop
     */
    yieldToEventLoop() {
        return new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
    
    /**
     * Update word count efficiently
     */
    updateWordCount() {
        if (this.textWorker) {
            this.textWorker.postMessage({
                text: this.editor.textContent,
                operation: 'wordCount'
            });
        } else {
            // Fallback for when worker is not available
            const words = this.editor.textContent.trim().split(/\s+/).filter(word => word.length > 0);
            this.updateWordCountDisplay(words.length);
        }
    }
    
    /**
     * Update word count display
     */
    updateWordCountDisplay(count) {
        this.queueRenderingOperation(() => {
            const wordCountElement = document.querySelector('.word-count, #word-count');
            if (wordCountElement) {
                wordCountElement.textContent = `${count} words`;
            }
        });
    }
    
    /**
     * Update text analysis display
     */
    updateTextAnalysisDisplay(analysis) {
        this.queueRenderingOperation(() => {
            const elements = {
                characters: document.querySelector('#character-count'),
                sentences: document.querySelector('#sentence-count'),
                paragraphs: document.querySelector('#paragraph-count'),
                readingTime: document.querySelector('#reading-time')
            };
            
            Object.keys(elements).forEach(key => {
                const element = elements[key];
                if (element && analysis[key] !== undefined) {
                    if (key === 'readingTime') {
                        element.textContent = `${analysis[key]} min read`;
                    } else {
                        element.textContent = `${analysis[key]} ${key}`;
                    }
                }
            });
        });
    }
    
    /**
     * Show processing indicator
     */
    showProcessingIndicator(message = 'Processing...') {
        const indicator = document.createElement('div');
        indicator.className = 'processing-indicator';
        indicator.innerHTML = `
            <div class="spinner"></div>
            <span>${message}</span>
        `;
        
        document.body.appendChild(indicator);
        
        // Add styles if not already present
        if (!document.querySelector('#processing-indicator-styles')) {
            const styles = document.createElement('style');
            styles.id = 'processing-indicator-styles';
            styles.textContent = `
                .processing-indicator {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 10000;
                }
                
                .processing-indicator .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .progress-bar {
                    width: 200px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 8px;
                }
                
                .progress-fill {
                    height: 100%;
                    background: #4CAF50;
                    transition: width 0.3s ease;
                }
            `;
            document.head.appendChild(styles);
        }
        
        this.processingIndicator = indicator;
    }
    
    /**
     * Update processing progress
     */
    updateProcessingProgress(percentage) {
        if (!this.processingIndicator) return;
        
        let progressBar = this.processingIndicator.querySelector('.progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.innerHTML = '<div class="progress-fill"></div>';
            this.processingIndicator.appendChild(progressBar);
        }
        
        const progressFill = progressBar.querySelector('.progress-fill');
        progressFill.style.width = `${percentage}%`;
    }
    
    /**
     * Hide processing indicator
     */
    hideProcessingIndicator() {
        if (this.processingIndicator) {
            this.processingIndicator.remove();
            this.processingIndicator = null;
        }
    }
    
    /**
     * Show copy feedback
     */
    showCopyFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'copy-feedback';
        feedback.textContent = '✓ Copied';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 1500);
    }
    
    /**
     * Show error message
     */
    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        error.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(244, 67, 54, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.remove();
        }, 3000);
    }
    
    /**
     * Trigger change event for integrations
     */
    triggerChangeEvent() {
        const event = new Event('editorchange', {
            bubbles: true,
            cancelable: true
        });
        
        this.editor.dispatchEvent(event);
    }
    
    /**
     * Trigger autosave
     */
    triggerAutosave() {
        const event = new Event('editorautosave', {
            bubbles: true,
            cancelable: true
        });
        
        this.editor.dispatchEvent(event);
    }
    
    /**
     * Handle undo operation
     */
    handleUndo() {
        document.execCommand('undo');
        this.triggerChangeEvent();
    }
    
    /**
     * Handle redo operation
     */
    handleRedo() {
        document.execCommand('redo');
        this.triggerChangeEvent();
    }
    
    /**
     * Check for auto-corrections
     */
    checkForAutoCorrections() {
        // Implement smart auto-corrections
        // This could include common typos, smart quotes, etc.
        const text = this.editor.textContent;
        
        // Example: Replace common typing patterns
        const corrections = {
            '...': '…',
            '--': '—',
            '"': '"', // Smart quotes would be more complex
            "'": '''   // Smart quotes would be more complex
        };
        
        // Apply corrections (simplified example)
        // In a real implementation, you'd need to be more careful about
        // cursor position and selection preservation
    }
    
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.textWorker) {
            this.textWorker.terminate();
        }
        
        clearTimeout(this.debounceTimeout);
        
        if (this.processingIndicator) {
            this.processingIndicator.remove();
        }
    }
}

// Auto-initialize for editors with the correct class
document.addEventListener('DOMContentLoaded', () => {
    const editors = document.querySelectorAll('[contenteditable="true"], .editor-content, #editor-content');
    
    editors.forEach(editor => {
        if (!editor.editorPerformance) {
            editor.editorPerformance = new EditorPerformance(editor);
        }
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditorPerformance;
}

// Global access
window.EditorPerformance = EditorPerformance;