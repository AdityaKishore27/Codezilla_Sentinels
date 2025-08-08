// Fraud Detection Dashboard JavaScript
class FraudDetectionDashboard {
    constructor() {
        this.data = {
            sampleTransactions: [
                {
                    id: "TXN_000001",
                    userId: "USER_2824",
                    transactionType: "Credit Card",
                    loginAttempts: 1,
                    transactionCount: 4,
                    transactionVelocity: 1.047,
                    location: "Mumbai",
                    timestamp: "2024-10-06T02:37:00",
                    riskScore: 0.12,
                    riskCategory: "Low",
                    isAnomaly: false,
                    fraud: 0
                },
                {
                    id: "TXN_000002",
                    userId: "USER_1434",
                    transactionType: "Debit Card",
                    loginAttempts: 3,
                    transactionCount: 9,
                    transactionVelocity: 0.925,
                    location: "Delhi",
                    timestamp: "2024-01-04T05:44:00",
                    riskScore: 0.23,
                    riskCategory: "Low",
                    isAnomaly: false,
                    fraud: 0
                },
                {
                    id: "TXN_000003",
                    userId: "USER_6462",
                    transactionType: "UPI",
                    loginAttempts: 5,
                    transactionCount: 12,
                    transactionVelocity: 2.68,
                    location: "Bangalore",
                    timestamp: "2024-03-04T12:05:00",
                    riskScore: 0.89,
                    riskCategory: "High",
                    isAnomaly: true,
                    fraud: 1
                }
            ],
            userProfiles: [
                {
                    userId: "USER_2824",
                    avgLoginAttempts: 1.8,
                    avgTransactionCount: 5.2,
                    avgTransactionVelocity: 0.85,
                    preferredLocation: "Mumbai",
                    transactionFrequency: 3.5,
                    anomalyScore: 0.12,
                    isAnomalous: false,
                    fraudRate: 0.02
                },
                {
                    userId: "USER_6462",
                    avgLoginAttempts: 5.3,
                    avgTransactionCount: 12.0,
                    avgTransactionVelocity: 2.69,
                    preferredLocation: "Bangalore",
                    transactionFrequency: 4.2,
                    anomalyScore: -0.135,
                    isAnomalous: true,
                    fraudRate: 0.67
                },
                {
                    userId: "USER_1434",
                    avgLoginAttempts: 2.1,
                    avgTransactionCount: 7.8,
                    avgTransactionVelocity: 0.92,
                    preferredLocation: "Delhi",
                    transactionFrequency: 4.1,
                    anomalyScore: 0.23,
                    isAnomalous: false,
                    fraudRate: 0.05
                }
            ]
        };
        
        this.charts = {};
        this.currentTransactions = [...this.data.sampleTransactions];
        this.liveFeedData = [];
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeApp();
            });
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        this.initNavigation();
        this.initCharts();
        this.initFileUpload();
        this.initRealtimeForm();
        this.initUserProfiles();
        this.initModal();
        this.initFilters();
        this.populateHistoricalTable();
        this.startLiveFeed();
    }

    // Navigation
    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const pages = document.querySelectorAll('.page');
        const pageTitle = document.getElementById('page-title');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetPage = btn.dataset.page;
                console.log('Navigating to:', targetPage); // Debug log
                
                // Update active nav button
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show target page
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                
                const targetElement = document.getElementById(`${targetPage}-page`);
                if (targetElement) {
                    targetElement.classList.add('active');
                } else {
                    console.error('Target page not found:', `${targetPage}-page`);
                }

                // Update page title
                const titles = {
                    dashboard: 'Dashboard Overview',
                    historical: 'Historical Data Analysis',
                    realtime: 'Real-Time Transaction Monitor',
                    profiles: 'User Behavior Profiles'
                };
                if (pageTitle) {
                    pageTitle.textContent = titles[targetPage] || 'Dashboard';
                }
            });
        });
    }

    // Dashboard Charts
    initCharts() {
        // Wait a bit to ensure canvas elements are ready
        setTimeout(() => {
            this.initRiskChart();
            this.initTimeChart();
            this.initFactorsChart();
        }, 100);
    }

    initRiskChart() {
        const canvas = document.getElementById('riskChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        this.charts.risk = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Low Risk', 'Moderate Risk', 'High Risk'],
                datasets: [{
                    data: [1058, 158, 31],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initTimeChart() {
        const canvas = document.getElementById('timeChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        const transactionData = [45, 23, 67, 89, 156, 98];
        
        this.charts.time = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Transactions',
                    data: transactionData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initFactorsChart() {
        const canvas = document.getElementById('factorsChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        this.charts.factors = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['High Login Attempts', 'Unusual Location', 'High Velocity', 'Multiple Transactions', 'Suspicious Timing'],
                datasets: [{
                    data: [89, 67, 45, 34, 23],
                    backgroundColor: ['#B4413C', '#FFC185', '#1FB8CD', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // File Upload
    initFileUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('csv-file');
        const selectBtn = document.getElementById('file-select-btn');
        const uploadStatus = document.getElementById('upload-status');

        if (!uploadArea || !fileInput || !selectBtn) return;

        selectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0], uploadStatus);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0], uploadStatus);
            }
        });
    }

    handleFileUpload(file, statusElement) {
        if (!file.name.endsWith('.csv')) {
            this.showUploadStatus(statusElement, 'Please upload a CSV file', 'error');
            return;
        }

        this.showLoading(true);
        
        // Simulate file processing
        setTimeout(() => {
            const newTransactions = this.generateSyntheticTransactions(50);
            this.currentTransactions = [...this.currentTransactions, ...newTransactions];
            this.populateHistoricalTable();
            this.showUploadStatus(statusElement, `Successfully processed ${newTransactions.length} transactions`, 'success');
            this.showLoading(false);
        }, 2000);
    }

    showUploadStatus(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = `upload-status ${type}`;
        element.classList.remove('hidden');
    }

    generateSyntheticTransactions(count) {
        const transactions = [];
        const types = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'];
        const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
        
        for (let i = 0; i < count; i++) {
            const transaction = {
                id: `TXN_${String(Date.now() + i).padStart(6, '0')}`,
                userId: `USER_${Math.floor(Math.random() * 9000) + 1000}`,
                transactionType: types[Math.floor(Math.random() * types.length)],
                loginAttempts: Math.floor(Math.random() * 10) + 1,
                transactionCount: Math.floor(Math.random() * 20) + 1,
                transactionVelocity: (Math.random() * 3).toFixed(3),
                location: locations[Math.floor(Math.random() * locations.length)],
                timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                riskScore: 0,
                riskCategory: '',
                isAnomaly: false,
                fraud: 0
            };
            
            // Calculate risk score
            const riskFactors = this.calculateRiskScore(transaction);
            transaction.riskScore = riskFactors.score;
            transaction.riskCategory = riskFactors.category;
            transaction.isAnomaly = riskFactors.isAnomaly;
            transaction.fraud = riskFactors.fraud;
            
            transactions.push(transaction);
        }
        
        return transactions;
    }

    calculateRiskScore(transaction) {
        let score = 0.1; // Base score
        
        // High login attempts increase risk
        if (transaction.loginAttempts > 3) score += 0.2;
        if (transaction.loginAttempts > 5) score += 0.3;
        
        // High transaction count increases risk
        if (transaction.transactionCount > 10) score += 0.2;
        if (transaction.transactionCount > 15) score += 0.2;
        
        // High velocity increases risk
        if (transaction.transactionVelocity > 2) score += 0.3;
        if (transaction.transactionVelocity > 3) score += 0.2;
        
        // Random factor for variability
        score += (Math.random() - 0.5) * 0.2;
        
        // Ensure score is between 0 and 1
        score = Math.max(0, Math.min(1, score));
        
        let category, isAnomaly, fraud;
        if (score < 0.3) {
            category = 'Low';
            isAnomaly = false;
            fraud = 0;
        } else if (score < 0.7) {
            category = 'Moderate';
            isAnomaly = Math.random() < 0.3;
            fraud = Math.random() < 0.1 ? 1 : 0;
        } else {
            category = 'High';
            isAnomaly = Math.random() < 0.8;
            fraud = Math.random() < 0.6 ? 1 : 0;
        }
        
        return {
            score: parseFloat(score.toFixed(3)),
            category,
            isAnomaly,
            fraud
        };
    }

    // Historical Data Table
    populateHistoricalTable() {
        const tbody = document.getElementById('historical-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.currentTransactions.forEach(transaction => {
            const row = this.createTransactionRow(transaction);
            tbody.appendChild(row);
        });
    }

    createTransactionRow(transaction) {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <td class="font-mono">${transaction.id}</td>
            <td class="font-mono">${transaction.userId}</td>
            <td>${transaction.transactionType}</td>
            <td class="font-mono">${transaction.riskScore}</td>
            <td><span class="risk-badge ${transaction.riskCategory.toLowerCase()}">${transaction.riskCategory}</span></td>
            <td><span class="anomaly-indicator ${transaction.isAnomaly ? 'yes' : 'no'}">${transaction.isAnomaly ? 'Yes' : 'No'}</span></td>
            <td>${new Date(transaction.timestamp).toLocaleString()}</td>
        `;
        row.addEventListener('click', () => this.showTransactionDetails(transaction));
        return row;
    }

    // Real-time Transaction Form
    initRealtimeForm() {
        const form = document.getElementById('transaction-form');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processRealtimeTransaction();
        });
    }

    processRealtimeTransaction() {
        const userId = document.getElementById('user-id').value;
        const transactionType = document.getElementById('transaction-type').value;
        const loginAttempts = parseInt(document.getElementById('login-attempts').value);
        const transactionCount = parseInt(document.getElementById('transaction-count').value);
        const transactionVelocity = parseFloat(document.getElementById('transaction-velocity').value);
        const location = document.getElementById('location').value;

        const transaction = {
            id: `TXN_RT_${Date.now()}`,
            userId,
            transactionType,
            loginAttempts,
            transactionCount,
            transactionVelocity,
            location,
            timestamp: new Date().toISOString()
        };

        this.showLoading(true);

        setTimeout(() => {
            const riskData = this.calculateRiskScore(transaction);
            transaction.riskScore = riskData.score;
            transaction.riskCategory = riskData.category;
            transaction.isAnomaly = riskData.isAnomaly;
            transaction.fraud = riskData.fraud;

            this.displayRiskAssessment(transaction);
            this.addToLiveFeed(transaction);
            this.showLoading(false);
            
            // Reset form
            document.getElementById('transaction-form').reset();
        }, 1500);
    }

    displayRiskAssessment(transaction) {
        const assessmentContent = document.getElementById('assessment-content');
        if (!assessmentContent) return;
        
        const userProfile = this.getUserProfile(transaction.userId);
        
        assessmentContent.innerHTML = `
            <div class="risk-assessment">
                <div class="risk-score-display" style="background: ${this.getRiskColor(transaction.riskScore, 0.1)};">
                    <div class="risk-score-value" style="color: ${this.getRiskColor(transaction.riskScore)};">${transaction.riskScore}</div>
                    <div class="risk-score-label">Risk Score</div>
                    <span class="risk-badge ${transaction.riskCategory.toLowerCase()}">${transaction.riskCategory} Risk</span>
                </div>
                
                <div class="risk-details">
                    <div class="risk-detail-item">
                        <span>Prediction:</span>
                        <span class="status ${transaction.fraud ? 'status--error' : 'status--success'}">
                            ${transaction.fraud ? 'Fraud' : 'Genuine'}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Anomaly Detected:</span>
                        <span style="color: ${transaction.isAnomaly ? 'var(--color-error)' : 'var(--color-success)'}">
                            ${transaction.isAnomaly ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>User Behavior:</span>
                        <span>${userProfile ? (userProfile.isAnomalous ? 'Anomalous' : 'Normal') : 'Unknown'}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Login Attempts:</span>
                        <span style="color: ${transaction.loginAttempts > 3 ? 'var(--color-warning)' : 'var(--color-text)'}">
                            ${transaction.loginAttempts} ${userProfile ? `(avg: ${userProfile.avgLoginAttempts})` : ''}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Transaction Velocity:</span>
                        <span style="color: ${transaction.transactionVelocity > 2 ? 'var(--color-warning)' : 'var(--color-text)'}">
                            ${transaction.transactionVelocity} ${userProfile ? `(avg: ${userProfile.avgTransactionVelocity.toFixed(2)})` : ''}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    getRiskColor(score, opacity = 1) {
        if (score < 0.3) return opacity < 1 ? `rgba(31, 184, 205, ${opacity})` : '#1FB8CD';
        if (score < 0.7) return opacity < 1 ? `rgba(255, 193, 133, ${opacity})` : '#FFC185';
        return opacity < 1 ? `rgba(180, 65, 60, ${opacity})` : '#B4413C';
    }

    getUserProfile(userId) {
        return this.data.userProfiles.find(profile => profile.userId === userId);
    }

    // Live Feed
    startLiveFeed() {
        // Simulate live transactions every 10 seconds
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                const mockTransaction = this.generateSyntheticTransactions(1)[0];
                this.addToLiveFeed(mockTransaction);
            }
        }, 10000);
    }

    addToLiveFeed(transaction) {
        const feedContainer = document.getElementById('live-feed');
        if (!feedContainer) return;
        
        const feedItem = document.createElement('div');
        feedItem.className = `feed-item ${transaction.riskCategory.toLowerCase()}-risk`;
        
        feedItem.innerHTML = `
            <div>
                <strong>${transaction.userId}</strong> - ${transaction.transactionType}
                <br>
                <small>Risk: ${transaction.riskScore} (${transaction.riskCategory})</small>
            </div>
            <div class="feed-time">${new Date(transaction.timestamp).toLocaleTimeString()}</div>
        `;
        
        feedContainer.insertBefore(feedItem, feedContainer.firstChild);
        
        // Keep only last 10 items
        while (feedContainer.children.length > 10) {
            feedContainer.removeChild(feedContainer.lastChild);
        }
        
        // Add to transactions list
        this.currentTransactions.unshift(transaction);
        this.populateHistoricalTable();
    }

    // User Profiles
    initUserProfiles() {
        this.displayUserProfiles();
        
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('user-search');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchUsers());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchUsers();
            });
        }
    }

    displayUserProfiles(profiles = this.data.userProfiles) {
        const grid = document.getElementById('profiles-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        profiles.forEach(profile => {
            const card = this.createProfileCard(profile);
            grid.appendChild(card);
        });
    }

    createProfileCard(profile) {
        const card = document.createElement('div');
        card.className = `card profile-card ${profile.isAnomalous ? 'anomalous' : ''}`;
        card.style.cursor = 'pointer';
        
        card.innerHTML = `
            <div class="profile-header">
                <div class="profile-id">${profile.userId}</div>
                <span class="status ${profile.isAnomalous ? 'status--error' : 'status--success'}">
                    ${profile.isAnomalous ? 'Anomalous' : 'Normal'}
                </span>
            </div>
            <div class="profile-stats">
                <div class="profile-stat">
                    <div class="profile-stat-value">${profile.avgLoginAttempts}</div>
                    <div class="profile-stat-label">Avg Login Attempts</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value">${profile.avgTransactionCount}</div>
                    <div class="profile-stat-label">Avg Transactions</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value">${profile.avgTransactionVelocity.toFixed(2)}</div>
                    <div class="profile-stat-label">Avg Velocity</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value">${(profile.fraudRate * 100).toFixed(1)}%</div>
                    <div class="profile-stat-label">Fraud Rate</div>
                </div>
            </div>
            <div style="margin-top: var(--space-12);">
                <small><strong>Location:</strong> ${profile.preferredLocation}</small><br>
                <small><strong>Frequency:</strong> ${profile.transactionFrequency} trans/day</small>
            </div>
        `;
        
        card.addEventListener('click', () => this.showUserDetails(profile));
        return card;
    }

    searchUsers() {
        const searchInput = document.getElementById('user-search');
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            this.displayUserProfiles();
            return;
        }
        
        const filtered = this.data.userProfiles.filter(profile => 
            profile.userId.toLowerCase().includes(searchTerm)
        );
        this.displayUserProfiles(filtered);
    }

    // Modal functionality
    initModal() {
        const modal = document.getElementById('detail-modal');
        const closeBtn = document.getElementById('modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal();
            });
        }
    }

    showModal(title, content) {
        const modal = document.getElementById('detail-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.remove('hidden');
    }

    hideModal() {
        const modal = document.getElementById('detail-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showTransactionDetails(transaction) {
        const content = `
            <div class="transaction-details">
                <div style="display: grid; gap: var(--space-12);">
                    <div class="risk-detail-item">
                        <span>Transaction ID:</span>
                        <span class="font-mono">${transaction.id}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>User ID:</span>
                        <span class="font-mono">${transaction.userId}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Type:</span>
                        <span>${transaction.transactionType}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Risk Score:</span>
                        <span style="color: ${this.getRiskColor(transaction.riskScore)};">${transaction.riskScore}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Category:</span>
                        <span class="risk-badge ${transaction.riskCategory.toLowerCase()}">${transaction.riskCategory}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Login Attempts:</span>
                        <span>${transaction.loginAttempts}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Transaction Count:</span>
                        <span>${transaction.transactionCount}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Velocity:</span>
                        <span>${transaction.transactionVelocity}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Location:</span>
                        <span>${transaction.location}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Timestamp:</span>
                        <span>${new Date(transaction.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
        this.showModal('Transaction Details', content);
    }

    showUserDetails(profile) {
        const content = `
            <div class="user-details">
                <div style="display: grid; gap: var(--space-12);">
                    <div class="risk-detail-item">
                        <span>User ID:</span>
                        <span class="font-mono">${profile.userId}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Status:</span>
                        <span class="status ${profile.isAnomalous ? 'status--error' : 'status--success'}">
                            ${profile.isAnomalous ? 'Anomalous' : 'Normal'}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Average Login Attempts:</span>
                        <span>${profile.avgLoginAttempts}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Average Transaction Count:</span>
                        <span>${profile.avgTransactionCount}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Average Velocity:</span>
                        <span>${profile.avgTransactionVelocity.toFixed(2)}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Preferred Location:</span>
                        <span>${profile.preferredLocation}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Transaction Frequency:</span>
                        <span>${profile.transactionFrequency} per day</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Anomaly Score:</span>
                        <span>${profile.anomalyScore}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Fraud Rate:</span>
                        <span style="color: ${profile.fraudRate > 0.3 ? 'var(--color-error)' : 'var(--color-success)'};">
                            ${(profile.fraudRate * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        `;
        this.showModal('User Profile Details', content);
    }

    // Filters
    initFilters() {
        const riskFilter = document.getElementById('risk-filter');
        const exportBtn = document.getElementById('export-btn');
        
        if (riskFilter) {
            riskFilter.addEventListener('change', () => this.filterTransactions());
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
    }

    filterTransactions() {
        const riskFilter = document.getElementById('risk-filter');
        if (!riskFilter) return;
        
        const filterValue = riskFilter.value;
        let filteredTransactions = this.currentTransactions;
        
        if (filterValue) {
            filteredTransactions = this.currentTransactions.filter(t => 
                t.riskCategory === filterValue
            );
        }
        
        const tbody = document.getElementById('historical-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        filteredTransactions.forEach(transaction => {
            const row = this.createTransactionRow(transaction);
            tbody.appendChild(row);
        });
    }

    exportData() {
        const data = this.currentTransactions.map(t => ({
            'Transaction ID': t.id,
            'User ID': t.userId,
            'Transaction Type': t.transactionType,
            'Risk Score': t.riskScore,
            'Risk Category': t.riskCategory,
            'Anomaly': t.isAnomaly ? 'Yes' : 'No',
            'Fraud': t.fraud ? 'Yes' : 'No',
            'Login Attempts': t.loginAttempts,
            'Transaction Count': t.transactionCount,
            'Transaction Velocity': t.transactionVelocity,
            'Location': t.location,
            'Timestamp': t.timestamp
        }));
        
        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, 'fraud_detection_results.csv');
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row => 
            headers.map(header => `"${row[header]}"`).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (!loading) return;
        
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FraudDetectionDashboard();
});
