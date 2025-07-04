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
        this.updateTagFilter();
    }

    // 数据存储相关
    loadData() {
        const data = localStorage.getItem('readingRecords');
        if (data) {
            this.books = JSON.parse(data);
            // 数据迁移：为旧数据添加新字段
            this.books = this.books.map(book => ({
                ...book,
                location: book.location || '',
                rating: book.rating || 0,
                startDate: book.startDate || '',
                finishDate: book.finishDate || '',
                isbn: book.isbn || '',
                publisher: book.publisher || '',
                publishDate: book.publishDate || '',
                pages: book.pages || '',
                coverUrl: book.coverUrl || '',
                quotes: book.quotes || [],
                tags: book.tags || []
            }));
            this.saveData(); // 保存迁移后的数据
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

        // 添加摘抄表单
        document.getElementById('addQuoteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addQuote();
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

        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderBooks();
            });
        }

        // 标签输入预览
        const tagsInput = document.getElementById('bookTags');
        if (tagsInput) {
            tagsInput.addEventListener('input', () => {
                this.updateTagsPreview('tagsPreview', tagsInput.value);
            });
        }

        const editTagsInput = document.getElementById('editBookTags');
        if (editTagsInput) {
            editTagsInput.addEventListener('input', () => {
                this.updateTagsPreview('editTagsPreview', editTagsInput.value);
            });
        }
    }

    // 书籍管理
    addBook() {
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const status = document.getElementById('bookStatus').value;
        const description = document.getElementById('bookDescription').value.trim();
        const location = document.getElementById('bookLocation')?.value.trim() || '';
        const isbn = document.getElementById('bookISBN')?.value.trim() || '';
        const publisher = document.getElementById('bookPublisher')?.value.trim() || '';
        const publishDate = document.getElementById('bookPublishDate')?.value || '';
        const pages = document.getElementById('bookPages')?.value || '';
        const coverUrl = document.getElementById('bookCoverUrl')?.value.trim() || '';
        const tagsInput = document.getElementById('bookTags')?.value.trim() || '';
        const tags = this.parseTags(tagsInput);

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
            location,
            isbn,
            publisher,
            publishDate,
            pages,
            coverUrl,
            rating: 0,
            startDate: '',
            finishDate: '',
            records: [],
            quotes: [],
            tags: tags,
            createdAt: new Date().toISOString()
        };

        // 自动设置日期
        const currentDate = new Date().toISOString().split('T')[0];
        if (status === 'reading' && !book.startDate) {
            book.startDate = currentDate;
        } else if (status === 'finished' && !book.finishDate) {
            book.finishDate = currentDate;
            if (!book.startDate) {
                book.startDate = currentDate;
            }
        }

        this.books.push(book);
        this.saveData();
        this.renderBooks();
        this.updateStats();
        this.updateTagFilter();
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
        const location = document.getElementById('editBookLocation')?.value.trim() || '';
        const rating = parseInt(document.getElementById('editBookRating')?.value) || 0;
        const isbn = document.getElementById('editBookISBN')?.value.trim() || '';
        const publisher = document.getElementById('editBookPublisher')?.value.trim() || '';
        const publishDate = document.getElementById('editBookPublishDate')?.value || '';
        const pages = document.getElementById('editBookPages')?.value || '';
        const coverUrl = document.getElementById('editBookCoverUrl')?.value.trim() || '';
        const tagsInput = document.getElementById('editBookTags')?.value.trim() || '';
        const tags = this.parseTags(tagsInput);

        if (!title || !author) {
            alert('请填写书名和作者');
            return;
        }

        const book = this.books.find(b => b.id === this.currentEditingBook);
        if (book) {
            const oldStatus = book.status;
            const currentDate = new Date().toISOString().split('T')[0];

            book.title = title;
            book.author = author;
            book.status = status;
            book.description = description;
            book.location = location;
            book.rating = rating;
            book.isbn = isbn;
            book.publisher = publisher;
            book.publishDate = publishDate;
            book.pages = pages;
            book.coverUrl = coverUrl;
            book.tags = tags;
            book.updatedAt = new Date().toISOString();

            // 自动更新日期
            if (oldStatus !== 'reading' && status === 'reading' && !book.startDate) {
                book.startDate = currentDate;
            } else if (oldStatus !== 'finished' && status === 'finished' && !book.finishDate) {
                book.finishDate = currentDate;
                if (!book.startDate) {
                    book.startDate = currentDate;
                }
            }

            this.saveData();
            this.renderBooks();
            this.updateStats();
            this.updateTagFilter();
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

    // 摘抄管理
    addQuote() {
        if (!this.currentBookForQuote) return;

        const content = document.getElementById('quoteContent').value.trim();
        const page = document.getElementById('quotePage').value.trim();

        if (!content) {
            alert('请填写摘抄内容');
            return;
        }

        const book = this.books.find(b => b.id === this.currentBookForQuote);
        if (book) {
            const quote = {
                id: this.generateId(),
                content,
                page,
                date: new Date().toISOString()
            };

            book.quotes.push(quote);
            book.updatedAt = new Date().toISOString();

            this.saveData();
            this.renderBooks();
            this.closeModal('addQuoteModal');
            this.resetForm('addQuoteForm');
            this.showMessage('摘抄添加成功！', 'success');
        }
    }

    deleteQuote(bookId, quoteId) {
        if (confirm('确定要删除这条摘抄吗？')) {
            const book = this.books.find(b => b.id === bookId);
            if (book) {
                book.quotes = book.quotes.filter(q => q.id !== quoteId);
                book.updatedAt = new Date().toISOString();
                this.saveData();
                this.renderBooks();
                this.showQuotes(bookId); // 刷新摘抄列表
                this.showMessage('摘抄删除成功！', 'success');
            }
        }
    }

    showQuotes(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        const content = document.getElementById('quotesContent');
        
        if (book.quotes.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💭</div>
                    <p>还没有摘抄</p>
                    <button class="btn btn-primary" onclick="app.openAddQuoteModal('${bookId}')">
                        添加第一条摘抄
                    </button>
                </div>
            `;
        } else {
            const sortedQuotes = book.quotes.sort((a, b) => new Date(b.date) - new Date(a.date));
            content.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <h4>${this.escapeHtml(book.title)} - 精彩摘抄</h4>
                    <button class="btn btn-primary btn-small" onclick="app.openAddQuoteModal('${bookId}')">
                        ➕ 添加摘抄
                    </button>
                </div>
                <div class="quotes-list">
                    ${sortedQuotes.map(quote => `
                        <div class="quote-item">
                            <div class="quote-info">
                                <div class="quote-content">"${this.escapeHtml(quote.content)}"</div>
                                ${quote.page ? `<div class="quote-page">第 ${this.escapeHtml(quote.page)} 页</div>` : ''}
                                <div class="quote-date">${this.formatDateTime(quote.date)}</div>
                            </div>
                            <div class="quote-actions">
                                <button class="btn btn-secondary btn-small" onclick="app.deleteQuote('${bookId}', '${quote.id}')" style="color: #ff4d4f;">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.openModal('quotesModal');
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

    // 搜索和筛选
    getFilteredBooks() {
        const filter = document.getElementById('statusFilter')?.value || 'all';
        const tagFilter = document.getElementById('tagFilter')?.value || 'all';
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';
        
        let filteredBooks = this.books;
        
        // 按状态筛选
        if (filter !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.status === filter);
        }
        
        // 按标签筛选
        if (tagFilter !== 'all') {
            filteredBooks = filteredBooks.filter(book => 
                book.tags && book.tags.includes(tagFilter)
            );
        }
        
        // 按搜索词筛选
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                (book.description && book.description.toLowerCase().includes(searchTerm)) ||
                (book.tags && book.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }
        
        return filteredBooks;
    }

    // 渲染相关
    renderBooks() {
        const grid = document.getElementById('booksGrid');
        const filteredBooks = this.getFilteredBooks();

        if (filteredBooks.length === 0) {
            const filter = document.getElementById('statusFilter')?.value || 'all';
            const searchTerm = document.getElementById('searchInput')?.value.trim() || '';
            
            let emptyMessage = '还没有添加任何书籍';
            if (searchTerm) {
                emptyMessage = `没有找到包含"${searchTerm}"的书籍`;
            } else if (filter !== 'all') {
                emptyMessage = '没有找到符合条件的书籍';
            }
            
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📖</div>
                    <h3>${emptyMessage}</h3>
                    <p>点击"添加书籍"开始记录你的阅读之旅吧！</p>
                    <button class="btn btn-primary" onclick="app.openAddBookModal()">
                        ➕ 立即添加
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredBooks.map(book => `
            <div class="book-card">
                <div class="book-status ${this.getStatusClass(book.status)}">
                    ${this.getStatusText(book.status)}
                </div>
                ${book.coverUrl ? `<img src="${book.coverUrl}" alt="${book.title}" class="book-cover" onerror="this.style.display='none'">` : ''}
                <h3 class="book-title">
                    <a href="book-detail.html?id=${book.id}" style="color: inherit; text-decoration: none;">
                        ${this.escapeHtml(book.title)}
                    </a>
                </h3>
                <p class="book-author">作者：${this.escapeHtml(book.author)}</p>
                ${book.location ? `<p class="book-location">📍 ${this.escapeHtml(book.location)}</p>` : ''}
                ${book.rating > 0 ? `<div class="book-rating">${this.renderStars(book.rating)}</div>` : ''}
                ${book.tags && book.tags.length > 0 ? `<div class="book-tags">${book.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                ${book.description ? `<p class="book-description">${this.escapeHtml(book.description)}</p>` : ''}
                <div class="book-meta">
                    ${book.startDate ? `<span class="meta-item">开始：${this.formatDate(book.startDate)}</span>` : ''}
                    ${book.finishDate ? `<span class="meta-item">完成：${this.formatDate(book.finishDate)}</span>` : ''}
                </div>
                <div class="book-actions">
                    <a href="book-detail.html?id=${book.id}" class="btn btn-primary btn-small">
                        👁️ 详情
                    </a>
                    <button class="btn btn-primary btn-small" onclick="app.openEditBookModal('${book.id}')">
                        ✏️ 编辑
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.showRecords('${book.id}')">
                        �� 记录 (${book.records.length})
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.showQuotes('${book.id}')">
                        💭 摘抄 (${book.quotes.length})
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.openAddRecordModal('${book.id}')">
                        ➕ 记录
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="app.deleteBook('${book.id}')" style="color: #ff4d4f;">
                        🗑️ 删除
                    </button>
                </div>
            </div>
        `).join('');
    }

    // 渲染星级评分
    renderStars(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push('⭐');
            } else {
                stars.push('☆');
            }
        }
        return stars.join('');
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
                                <div class="record-date">${this.formatDateTime(record.date)}</div>
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
        
        // 新增字段
        if (document.getElementById('editBookLocation')) {
            document.getElementById('editBookLocation').value = book.location || '';
        }
        if (document.getElementById('editBookRating')) {
            document.getElementById('editBookRating').value = book.rating || 0;
        }
        if (document.getElementById('editBookISBN')) {
            document.getElementById('editBookISBN').value = book.isbn || '';
        }
        if (document.getElementById('editBookPublisher')) {
            document.getElementById('editBookPublisher').value = book.publisher || '';
        }
        if (document.getElementById('editBookPublishDate')) {
            document.getElementById('editBookPublishDate').value = book.publishDate || '';
        }
        if (document.getElementById('editBookPages')) {
            document.getElementById('editBookPages').value = book.pages || '';
        }
        if (document.getElementById('editBookCoverUrl')) {
            document.getElementById('editBookCoverUrl').value = book.coverUrl || '';
        }
        if (document.getElementById('editBookTags')) {
            document.getElementById('editBookTags').value = book.tags ? book.tags.join(', ') : '';
            this.updateTagsPreview('editTagsPreview', book.tags ? book.tags.join(', ') : '');
        }
        
        this.openModal('editBookModal');
    }

    openAddRecordModal(bookId) {
        this.currentBookForRecord = bookId;
        this.resetForm('addRecordForm');
        this.openModal('addRecordModal');
    }

    openAddQuoteModal(bookId) {
        this.currentBookForQuote = bookId;
        this.resetForm('addQuoteForm');
        this.openModal('addQuoteModal');
    }

    // ISBN 自动获取功能
    async fetchBookByISBN() {
        const isbnInput = document.getElementById('bookISBN');
        const statusDiv = document.getElementById('isbnStatus');
        const fetchBtn = document.getElementById('fetchISBNBtn');
        
        const isbn = isbnInput.value.trim().replace(/[-\s]/g, ''); // 移除连字符和空格
        
        if (!isbn) {
            this.showISBNStatus('请输入ISBN号码', 'error');
            return;
        }

        // 验证ISBN格式
        if (!/^(97[89])?\d{9}[\dX]$/i.test(isbn)) {
            this.showISBNStatus('ISBN格式不正确', 'error');
            return;
        }

        fetchBtn.disabled = true;
        fetchBtn.textContent = '🔄 获取中...';
        this.showISBNStatus('正在获取书籍信息...', 'loading');

        try {
            // 首先尝试 OpenLibrary API
            let bookData = await this.fetchFromOpenLibrary(isbn);
            
            // 如果 OpenLibrary 没有找到，尝试 Google Books API
            if (!bookData) {
                bookData = await this.fetchFromGoogleBooks(isbn);
            }

            if (bookData) {
                this.fillBookForm(bookData);
                this.showISBNStatus('✅ 书籍信息获取成功！', 'success');
            } else {
                this.showISBNStatus('❌ 未找到该ISBN的书籍信息', 'error');
            }
        } catch (error) {
            console.error('获取书籍信息失败:', error);
            this.showISBNStatus('❌ 获取失败，请检查网络连接', 'error');
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.textContent = '🔍 获取信息';
        }
    }

    async fetchFromOpenLibrary(isbn) {
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            const data = await response.json();
            
            const bookKey = `ISBN:${isbn}`;
            if (data[bookKey]) {
                const book = data[bookKey];
                return {
                    title: book.title || '',
                    author: book.authors ? book.authors.map(a => a.name).join(', ') : '',
                    publisher: book.publishers ? book.publishers.map(p => p.name).join(', ') : '',
                    publishDate: book.publish_date || '',
                    pages: book.number_of_pages || '',
                    coverUrl: book.cover ? book.cover.large || book.cover.medium || book.cover.small : '',
                    description: book.excerpts ? book.excerpts[0].text : ''
                };
            }
            return null;
        } catch (error) {
            console.error('OpenLibrary API 错误:', error);
            return null;
        }
    }

    async fetchFromGoogleBooks(isbn) {
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const book = data.items[0].volumeInfo;
                return {
                    title: book.title || '',
                    author: book.authors ? book.authors.join(', ') : '',
                    publisher: book.publisher || '',
                    publishDate: book.publishedDate || '',
                    pages: book.pageCount || '',
                    coverUrl: book.imageLinks ? book.imageLinks.large || book.imageLinks.medium || book.imageLinks.small || book.imageLinks.thumbnail : '',
                    description: book.description || ''
                };
            }
            return null;
        } catch (error) {
            console.error('Google Books API 错误:', error);
            return null;
        }
    }

    fillBookForm(bookData) {
        // 只填充空的字段，不覆盖用户已输入的内容
        const titleInput = document.getElementById('bookTitle');
        const authorInput = document.getElementById('bookAuthor');
        const publisherInput = document.getElementById('bookPublisher');
        const publishDateInput = document.getElementById('bookPublishDate');
        const pagesInput = document.getElementById('bookPages');
        const coverUrlInput = document.getElementById('bookCoverUrl');
        const descriptionInput = document.getElementById('bookDescription');

        if (!titleInput.value && bookData.title) {
            titleInput.value = bookData.title;
        }
        if (!authorInput.value && bookData.author) {
            authorInput.value = bookData.author;
        }
        if (!publisherInput.value && bookData.publisher) {
            publisherInput.value = bookData.publisher;
        }
        if (!publishDateInput.value && bookData.publishDate) {
            // 尝试解析日期
            const date = new Date(bookData.publishDate);
            if (!isNaN(date.getTime())) {
                publishDateInput.value = date.toISOString().split('T')[0];
            }
        }
        if (!pagesInput.value && bookData.pages) {
            pagesInput.value = bookData.pages;
        }
        if (!coverUrlInput.value && bookData.coverUrl) {
            coverUrlInput.value = bookData.coverUrl;
        }
        if (!descriptionInput.value && bookData.description) {
            // 清理HTML标签
            const cleanDescription = bookData.description.replace(/<[^>]*>/g, '').substring(0, 500);
            descriptionInput.value = cleanDescription;
        }
    }

    showISBNStatus(message, type) {
        const statusDiv = document.getElementById('isbnStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.style.color = type === 'success' ? '#52c41a' : 
                                   type === 'error' ? '#ff4d4f' : 
                                   type === 'loading' ? '#1890ff' : '#666';
        }
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
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    formatDateTime(dateString) {
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

        const totalBooksEl = document.getElementById('totalBooks');
        const readingBooksEl = document.getElementById('readingBooks');
        const finishedBooksEl = document.getElementById('finishedBooks');

        if (totalBooksEl) totalBooksEl.textContent = total;
        if (readingBooksEl) readingBooksEl.textContent = reading;
        if (finishedBooksEl) finishedBooksEl.textContent = finished;
    }

    // 数据导入导出
    exportData() {
        const data = {
            books: this.books,
            exportDate: new Date().toISOString(),
            version: '2.0'
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
        this.updateTagFilter();
    }

    // 标签相关方法
    parseTags(tagsString) {
        if (!tagsString) return [];
        return tagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .map(tag => tag.substring(0, 20)); // 限制标签长度
    }

    updateTagsPreview(previewId, tagsString) {
        const preview = document.getElementById(previewId);
        if (!preview) return;

        const tags = this.parseTags(tagsString);
        preview.innerHTML = tags.map(tag => 
            `<span class="tag">${this.escapeHtml(tag)}</span>`
        ).join('');
    }

    getAllTags() {
        const allTags = new Set();
        this.books.forEach(book => {
            if (book.tags) {
                book.tags.forEach(tag => allTags.add(tag));
            }
        });
        return Array.from(allTags).sort();
    }

    updateTagFilter() {
        const tagFilter = document.getElementById('tagFilter');
        if (!tagFilter) return;

        const allTags = this.getAllTags();
        const currentValue = tagFilter.value;
        
        tagFilter.innerHTML = '<option value="all">全部标签</option>';
        allTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            if (tag === currentValue) {
                option.selected = true;
            }
            tagFilter.appendChild(option);
        });
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