// 阅读记录管理应用
class ReadingRecordApp {
    constructor() {
        this.books = [];
        this.currentEditingBook = null;
        this.currentBookForRecord = null;
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.renderBooks();
        this.updateStats();
    }

    // 数据存储相关
    loadData() {
        const data = localStorage.getItem('readingRecords');
        if (data) {
            this.books = JSON.parse(data);
        }
    }

    saveData() {
        localStorage.setItem('readingRecords', JSON.stringify(this.books));
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 事件绑定
    bindEvents() {
        // 添加书籍表单
        document.getElementById('addBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
        });

        // 编辑书籍表单
        document.getElementById('editBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBook();
        });

        // 添加阅读记录表单
        document.getElementById('addRecordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRecord();
        });

        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // 书籍管理
    addBook() {
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const status = document.getElementById('bookStatus').value;
        const description = document.getElementById('bookDescription').value.trim();

        if (!title || !author) {
            alert('请填写书名和作者');
            return;
        }

        const book = {
            id: this.generateId(),
            title,
            author,
            status,
            description,
            records: [],
            createdAt: new Date().toISOString()
        };

        this.books.push(book);
        this.saveData();
        this.renderBooks();
        this.updateStats();
        this.closeModal('addBookModal');
        this.resetForm('addBookForm');
        this.showMessage('书籍添加成功！', 'success');
    }

    updateBook() {
        if (!this.currentEditingBook) return;

        const title = document.getElementById('editBookTitle').value.trim();
        const author = document.getElementById('editBookAuthor').value.trim();
        const status = document.getElementById('editBookStatus').value;
        const description = document.getElementById('editBookDescription').value.trim();

        if (!title || !author) {
            alert('请填写书名和作者');
            return;
        }

        const book = this.books.find(b => b.id === this.currentEditingBook);
        if (book) {
            book.title = title;
            book.author = author;
            book.status = status;
            book.description = description;
            book.updatedAt = new Date().toISOString();

            this.saveData();
            this.renderBooks();
            this.updateStats();
            this.closeModal('editBookModal');
            this.showMessage('书籍更新成功！', 'success');
        }
    }

    deleteBook(bookId) {
        if (confirm('确定要删除这本书吗？删除后无法恢复。')) {
            this.books = this.books.filter(book => book.id !== bookId);
            this.saveData();
            this.renderBooks();
            this.updateStats();
            this.showMessage('书籍删除成功！', 'success');
        }
    }

    // 阅读记录管理
    addRecord() {
        if (!this.currentBookForRecord) return;

        const progress = document.getElementById('recordProgress').value.trim();
        const note = document.getElementById('recordNote').value.trim();

        if (!progress) {
            alert('请填写阅读进度');
            return;
        }

        const book = this.books.find(b => b.id === this.currentBookForRecord);
        if (book) {
            const record = {
                id: this.generateId(),
                progress,
                note,
                date: new Date().toISOString()
            };

            book.records.push(record);
            book.updatedAt = new Date().toISOString();

            this.saveData();
            this.renderBooks();
            this.closeModal('addRecordModal');
            this.resetForm('addRecordForm');
            this.showMessage('阅读记录添加成功！', 'success');
        }
    }

    deleteRecord(bookId, recordId) {
        if (confirm('确定要删除这条记录吗？')) {
            const book = this.books.find(b => b.id === bookId);
            if (book) {
                book.records = book.records.filter(r => r.id !== recordId);
                book.updatedAt = new Date().toISOString();
                this.saveData();
                this.renderBooks();
                this.showRecords(bookId); // 刷新记录列表
                this.showMessage('记录删除成功！', 'success');
            }
        }
    }

    // 渲染相关
    renderBooks() {
        const grid = document.getElementById('booksGrid');
        const filter = document.getElementById('statusFilter').value;
        
        let filteredBooks = this.books;
        if (filter !== 'all') {
            filteredBooks = this.books.filter(book => book.status === filter);
        }

        if (filteredBooks.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📖</div>
                    <p>${filter === 'all' ? '还没有添加任何书籍' : '没有找到符合条件的书籍'}</p>
                    <p>点击"添加书籍"开始记录你的阅读之旅吧！</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredBooks.map(book => `
            <div class="book-card">
                <div class="book-status ${this.getStatusClass(book.status)}">
                    ${this.getStatusText(book.status)}
                </div>
                <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                <p class="book-author">作者：${this.escapeHtml(book.author)}</p>
                ${book.description ? `<p class="book-description">${this.escapeHtml(book.description)}</p>` : ''}
                <div class="book-actions">
                    <button class="btn btn-primary btn-small" onclick="app.openEditBookModal('${book.id}')">
                        ✏️ 编辑
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.showRecords('${book.id}')">
                        📝 记录 (${book.records.length})
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.openAddRecordModal('${book.id}')">
                        ➕ 添加记录
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.deleteBook('${book.id}')" style="color: #ff4d4f;">
                        🗑️ 删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    showRecords(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        const content = document.getElementById('recordsContent');
        
        if (book.records.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>还没有阅读记录</p>
                    <button class="btn btn-primary" onclick="app.openAddRecordModal('${bookId}')">
                        添加第一条记录
                    </button>
                </div>
            `;
        } else {
            const sortedRecords = book.records.sort((a, b) => new Date(b.date) - new Date(a.date));
            content.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <h4>${this.escapeHtml(book.title)} - 阅读记录</h4>
                    <button class="btn btn-primary btn-small" onclick="app.openAddRecordModal('${bookId}')">
                        ➕ 添加记录
                    </button>
                </div>
                <div class="records-list">
                    ${sortedRecords.map(record => `
                        <div class="record-item">
                            <div class="record-info">
                                <div class="record-date">${this.formatDate(record.date)}</div>
                                <div class="record-progress">${this.escapeHtml(record.progress)}</div>
                                ${record.note ? `<div class="record-note">${this.escapeHtml(record.note)}</div>` : ''}
                            </div>
                            <div class="record-actions">
                                <button class="btn btn-secondary btn-small" onclick="app.deleteRecord('${bookId}', '${record.id}')" style="color: #ff4d4f;">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.openModal('recordsModal');
    }

    // 模态框管理
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    openAddBookModal() {
        this.resetForm('addBookForm');
        this.openModal('addBookModal');
    }

    openEditBookModal(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        this.currentEditingBook = bookId;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author;
        document.getElementById('editBookStatus').value = book.status;
        document.getElementById('editBookDescription').value = book.description || '';
        this.openModal('editBookModal');
    }

    openAddRecordModal(bookId) {
        this.currentBookForRecord = bookId;
        this.resetForm('addRecordForm');
        this.openModal('addRecordModal');
    }

    // 工具函数
    resetForm(formId) {
        document.getElementById(formId).reset();
    }

    getStatusClass(status) {
        const classes = {
            'unread': 'status-unread',
            'reading': 'status-reading',
            'finished': 'status-finished'
        };
        return classes[status] || 'status-unread';
    }

    getStatusText(status) {
        const texts = {
            'unread': '未读',
            'reading': '在读',
            'finished': '已读'
        };
        return texts[status] || '未读';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateStats() {
        const total = this.books.length;
        const reading = this.books.filter(book => book.status === 'reading').length;
        const finished = this.books.filter(book => book.status === 'finished').length;

        document.getElementById('totalBooks').textContent = total;
        document.getElementById('readingBooks').textContent = reading;
        document.getElementById('finishedBooks').textContent = finished;
    }

    // 数据导入导出
    exportData() {
        const data = {
            books: this.books,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reading-records-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('数据导出成功！', 'success');
    }

    importData() {
        document.getElementById('importFile').click();
    }

    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.books && Array.isArray(data.books)) {
                    if (confirm('导入数据将覆盖现有数据，确定继续吗？')) {
                        this.books = data.books;
                        this.saveData();
                        this.renderBooks();
                        this.updateStats();
                        this.showMessage('数据导入成功！', 'success');
                    }
                } else {
                    alert('文件格式不正确');
                }
            } catch (error) {
                alert('文件解析失败，请检查文件格式');
            }
        };
        reader.readAsText(file);
        
        // 清空文件输入
        event.target.value = '';
    }

    // 筛选功能
    filterBooks() {
        this.renderBooks();
    }

    // 消息提示
    showMessage(message, type = 'info') {
        // 简单的消息提示实现
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#52c41a' : '#1890ff'};
            color: white;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
            messageEl.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
}

// 全局函数，供HTML调用
function openAddBookModal() {
    app.openAddBookModal();
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function filterBooks() {
    app.filterBooks();
}

function exportData() {
    app.exportData();
}

function importData() {
    app.importData();
}

function handleImport(event) {
    app.handleImport(event);
}

// 初始化应用
const app = new ReadingRecordApp();

// PWA 支持
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 