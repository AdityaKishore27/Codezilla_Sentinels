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
        
        // Read and process the actual CSV file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const processedData = this.processCSVData(csvText);
                
                if (processedData.transactions.length === 0) {
                    this.showUploadStatus(statusElement, 'No valid transactions found in CSV file', 'error');
                    this.showLoading(false);
                    return;
                }
                
                // Add new transactions
                this.currentTransactions = [...this.currentTransactions, ...processedData.transactions];
                
                // Create new user profiles for unique users
                const newProfiles = this.createUserProfilesFromTransactions(processedData.transactions);
                this.data.userProfiles = [...this.data.userProfiles, ...newProfiles];
                
                // Update displays
                this.populateHistoricalTable();
                this.displayUserProfiles();
                
                const message = `Successfully processed ${processedData.transactions.length} transactions. Created ${newProfiles.length} new user profiles.`;
                this.showUploadStatus(statusElement, message, 'success');
                this.showLoading(false);
                
            } catch (error) {
                console.error('Error processing CSV:', error);
                this.showUploadStatus(statusElement, 'Error processing CSV file. Please check the format.', 'error');
                this.showLoading(false);
            }
        };
        
        reader.onerror = () => {
            this.showUploadStatus(statusElement, 'Error reading file', 'error');
            this.showLoading(false);
        };
        
        reader.readAsText(file);
    }

    processCSVData(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const transactions = [];
        const rawUserData = {};
        
        // Expected column mappings (flexible)
        const columnMap = {
            'user_id': ['user_id', 'userid', 'user id', 'id'],
            'transaction_type': ['transaction_type', 'transactiontype', 'transaction type', 'type'],
            'login_attempts': ['login_attempts', 'loginattempts', 'login attempts', 'attempts'],
            'transaction_count': ['transaction_count', 'transactioncount', 'transaction count', 'count'],
            'transaction_velocity': ['transaction_velocity', 'transactionvelocity', 'transaction velocity', 'velocity'],
            'location': ['location', 'city', 'place'],
            'timestamp': ['timestamp', 'time', 'datetime', 'date'],
            'fraud': ['fraud', 'is_fraud', 'fraudulent']
        };
        
        // Find column indices
        const indices = {};
        for (const [key, variants] of Object.entries(columnMap)) {
            const index = headers.findIndex(h => variants.includes(h));
            if (index !== -1) {
                indices[key] = index;
            }
        }
        
        // Process data rows
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length) continue;
            
            try {
                const transaction = {
                    id: `TXN_CSV_${Date.now()}_${i}`,
                    userId: values[indices.user_id] || `USER_${Math.floor(Math.random() * 9000) + 1000}`,
                    transactionType: values[indices.transaction_type] || 'Credit Card',
                    loginAttempts: parseInt(values[indices.login_attempts]) || Math.floor(Math.random() * 5) + 1,
                    transactionCount: parseInt(values[indices.transaction_count]) || Math.floor(Math.random() * 10) + 1,
                    transactionVelocity: parseFloat(values[indices.transaction_velocity]) || (Math.random() * 2).toFixed(3),
                    location: values[indices.location] || 'Mumbai',
                    timestamp: values[indices.timestamp] || new Date().toISOString(),
                    fraud: values[indices.fraud] ? (values[indices.fraud].toLowerCase() === 'true' || values[indices.fraud] === '1') : undefined
                };
                
                // Calculate risk score
                const riskData = this.calculateRiskScore(transaction);
                transaction.riskScore = riskData.score;
                transaction.riskCategory = riskData.category;
                transaction.isAnomaly = riskData.isAnomaly;
                
                // Use provided fraud value or calculated one
                if (transaction.fraud === undefined) {
                    transaction.fraud = riskData.fraud;
                }
                
                transactions.push(transaction);
                
                // Collect user data for profile creation
                if (!rawUserData[transaction.userId]) {
                    rawUserData[transaction.userId] = [];
                }
                rawUserData[transaction.userId].push(transaction);
                
            } catch (error) {
                console.warn(`Skipping invalid row ${i}:`, error);
            }
        }
        
        return { transactions, rawUserData };
    }

    createUserProfilesFromTransactions(transactions) {
        const newProfiles = [];
        const userTransactions = {};
        
        // Group transactions by user
        transactions.forEach(transaction => {
            if (!userTransactions[transaction.userId]) {
                userTransactions[transaction.userId] = [];
            }
            userTransactions[transaction.userId].push(transaction);
        });
        
        // Create profiles for new users
        for (const [userId, userTxns] of Object.entries(userTransactions)) {
            // Check if user profile already exists
            const existingProfile = this.data.userProfiles.find(p => p.userId === userId);
            if (existingProfile) continue;
            
            if (userTxns.length >= 2) { // Need at least 2 transactions for meaningful profile
                const profile = this.calculateUserProfile(userId, userTxns);
                newProfiles.push(profile);
            }
        }
        
        return newProfiles;
    }

    calculateUserProfile(userId, transactions) {
        const loginAttempts = transactions.map(t => t.loginAttempts);
        const transactionCounts = transactions.map(t => t.transactionCount);
        const velocities = transactions.map(t => parseFloat(t.transactionVelocity));
        const locations = transactions.map(t => t.location);
        const fraudCount = transactions.filter(t => t.fraud === 1).length;
        
        // Calculate statistics
        const avgLoginAttempts = loginAttempts.reduce((a, b) => a + b, 0) / loginAttempts.length;
        const avgTransactionCount = transactionCounts.reduce((a, b) => a + b, 0) / transactionCounts.length;
        const avgTransactionVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        
        // Find most common location
        const locationCounts = {};
        locations.forEach(loc => {
            locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });
        const preferredLocation = Object.keys(locationCounts).reduce((a, b) => 
            locationCounts[a] > locationCounts[b] ? a : b
        );
        
        // Calculate anomaly score (simplified)
        let anomalyScore = 0;
        if (avgLoginAttempts > 3) anomalyScore -= 0.1;
        if (avgTransactionVelocity > 2) anomalyScore -= 0.15;
        if (avgTransactionCount > 10) anomalyScore -= 0.1;
        
        // Add some randomness for variability
        anomalyScore += (Math.random() - 0.5) * 0.2;
        
        const isAnomalous = anomalyScore < -0.05;
        const fraudRate = fraudCount / transactions.length;
        
        return {
            userId,
            avgLoginAttempts: parseFloat(avgLoginAttempts.toFixed(2)),
            avgTransactionCount: parseFloat(avgTransactionCount.toFixed(2)),
            avgTransactionVelocity: parseFloat(avgTransactionVelocity.toFixed(2)),
            preferredLocation,
            transactionFrequency: parseFloat((transactions.length / 30).toFixed(1)), // Assuming 30-day period
            anomalyScore: parseFloat(anomalyScore.toFixed(3)),
            isAnomalous,
            fraudRate: parseFloat(fraudRate.toFixed(3))
        };
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
            isAnomaly = Math.random() < 0.4;
            // Moderate risk has higher fraud probability
            fraud = Math.random() < 0.4 ? 1 : 0;
        } else {
            category = 'High';
            isAnomaly = Math.random() < 0.8;
            // High risk has much higher fraud probability
            fraud = Math.random() < 0.85 ? 1 : 0;
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
        const riskReasons = this.getRiskReasons(transaction);
        const reasonsText = riskReasons.length > 0 ? riskReasons.slice(0, 2).join(', ') + (riskReasons.length > 2 ? '...' : '') : 'Normal patterns';
        
        row.innerHTML = `
            <td class="font-mono">${transaction.id}</td>
            <td class="font-mono">${transaction.userId}</td>
            <td>${transaction.transactionType}</td>
            <td class="font-mono">${transaction.riskScore}</td>
            <td><span class="risk-badge ${transaction.riskCategory.toLowerCase()}">${transaction.riskCategory}</span></td>
            <td><span class="anomaly-indicator ${transaction.isAnomaly ? 'yes' : 'no'}">${transaction.isAnomaly ? 'Yes' : 'No'}</span></td>
            <td class="risk-reasons" title="${riskReasons.join('; ')}" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <small>${reasonsText}</small>
            </td>
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

    getRiskReasons(transaction) {
        const reasons = [];
        
        // High login attempts
        if (transaction.loginAttempts > 5) {
            reasons.push('Excessive login attempts (>5)');
        } else if (transaction.loginAttempts > 3) {
            reasons.push('High login attempts (>3)');
        }
        
        // High transaction count
        if (transaction.transactionCount > 15) {
            reasons.push('Very high transaction count (>15)');
        } else if (transaction.transactionCount > 10) {
            reasons.push('High transaction count (>10)');
        }
        
        // High velocity
        if (transaction.transactionVelocity > 3) {
            reasons.push('Extremely high velocity (>3)');
        } else if (transaction.transactionVelocity > 2) {
            reasons.push('High transaction velocity (>2)');
        }
        
        // Time-based patterns
        const hour = new Date(transaction.timestamp).getHours();
        if (hour >= 0 && hour <= 5) {
            reasons.push('Late night activity (suspicious timing)');
        }
        
        // User behavior anomaly
        if (transaction.isAnomaly) {
            reasons.push('Behavioral anomaly detected');
        }
        
        // Location-based risk (simplified)
        const riskyCities = ['Unknown', 'International'];
        if (riskyCities.includes(transaction.location)) {
            reasons.push('High-risk location');
        }
        
        // Transaction type risk
        if (transaction.transactionType === 'UPI' && transaction.transactionVelocity > 1.5) {
            reasons.push('UPI with high velocity');
        }
        
        return reasons;
    }

    // Live Feed
    startLiveFeed() {
        // Initialize empty state
        this.initializeLiveFeedEmptyState();
        
        // Simulate live transactions every 10 seconds
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                const mockTransaction = this.generateSyntheticTransactions(1)[0];
                this.addToLiveFeed(mockTransaction);
            }
        }, 10000);
    }

    initializeLiveFeedEmptyState() {
        const feedContainer = document.getElementById('live-feed');
        if (!feedContainer) return;
        
        let feedContent = feedContainer.querySelector('.feed-content');
        if (!feedContent) {
            feedContent = document.createElement('div');
            feedContent.className = 'feed-content';
            feedContainer.appendChild(feedContent);
        }
        
        if (feedContent.children.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'feed-empty';
            emptyMessage.innerHTML = `
                <div style="text-align: center; padding: var(--space-32);">
                    <div style="font-size: 48px; margin-bottom: var(--space-16); opacity: 0.5;">📡</div>
                    <h4 style="margin: 0 0 var(--space-8) 0; color: var(--color-text-secondary);">Monitoring Live Transactions</h4>
                    <p style="margin: 0; color: var(--color-text-secondary);">New transactions will appear here in real-time</p>
                </div>
            `;
            feedContent.appendChild(emptyMessage);
        }
    }

    addToLiveFeed(transaction) {
        const feedContainer = document.getElementById('live-feed');
        if (!feedContainer) return;
        
        // Check if feed-content exists, if not create it
        let feedContent = feedContainer.querySelector('.feed-content');
        if (!feedContent) {
            feedContent = document.createElement('div');
            feedContent.className = 'feed-content';
            feedContainer.appendChild(feedContent);
        }
        
        const feedItem = document.createElement('div');
        feedItem.className = `feed-item ${transaction.riskCategory.toLowerCase()}-risk`;
        
        const riskReasons = this.getRiskReasons(transaction);
        
        feedItem.innerHTML = `
            <div class="feed-item-content">
                <div class="feed-item-header">
                    <div>
                        <div class="feed-item-user">${transaction.userId}</div>
                        <div class="feed-item-type">${transaction.transactionType}</div>
                    </div>
                    <div class="feed-item-risk">
                        <span class="feed-item-score" style="color: ${this.getRiskColor(transaction.riskScore)};">
                            ${transaction.riskScore}
                        </span>
                        <span class="risk-badge ${transaction.riskCategory.toLowerCase()}">
                            ${transaction.riskCategory}
                        </span>
                    </div>
                </div>
                <div class="feed-item-details">
                    <span>Logins: ${transaction.loginAttempts}</span>
                    <span>Velocity: ${transaction.transactionVelocity}</span>
                    <span>Location: ${transaction.location}</span>
                    ${transaction.isAnomaly ? '<span style="color: var(--color-error);">⚠️ Anomaly</span>' : ''}
                </div>
                ${riskReasons.length > 0 ? `
                    <div class="feed-item-reasons">
                        <small><strong>Risk Factors:</strong> ${riskReasons.join(', ')}</small>
                    </div>
                ` : ''}
            </div>
            <div class="feed-time">${new Date(transaction.timestamp).toLocaleTimeString()}</div>
        `;
        
        // Add click handler
        feedItem.addEventListener('click', () => this.showTransactionDetails(transaction));
        
        // Check if there's an empty state message and remove it
        const emptyMessage = feedContent.querySelector('.feed-empty');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        feedContent.insertBefore(feedItem, feedContent.firstChild);
        
        // Keep only last 15 items
        while (feedContent.children.length > 15) {
            feedContent.removeChild(feedContent.lastChild);
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
        const riskReasons = this.getRiskReasons(transaction);
        const userProfile = this.getUserProfile(transaction.userId);
        
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
                        <span style="color: ${this.getRiskColor(transaction.riskScore)}; font-weight: var(--font-weight-bold);">${transaction.riskScore}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Category:</span>
                        <span class="risk-badge ${transaction.riskCategory.toLowerCase()}">${transaction.riskCategory}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Fraud Prediction:</span>
                        <span class="status ${transaction.fraud ? 'status--error' : 'status--success'}">
                            ${transaction.fraud ? 'Fraudulent' : 'Legitimate'}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Anomaly Detected:</span>
                        <span style="color: ${transaction.isAnomaly ? 'var(--color-error)' : 'var(--color-success)'};">
                            ${transaction.isAnomaly ? '⚠️ Yes' : '✅ No'}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Login Attempts:</span>
                        <span style="color: ${transaction.loginAttempts > 3 ? 'var(--color-warning)' : 'var(--color-text)'};">
                            ${transaction.loginAttempts} ${userProfile ? `(avg: ${userProfile.avgLoginAttempts.toFixed(1)})` : ''}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Transaction Count:</span>
                        <span style="color: ${transaction.transactionCount > 10 ? 'var(--color-warning)' : 'var(--color-text)'};">
                            ${transaction.transactionCount} ${userProfile ? `(avg: ${userProfile.avgTransactionCount.toFixed(1)})` : ''}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Velocity:</span>
                        <span style="color: ${transaction.transactionVelocity > 2 ? 'var(--color-warning)' : 'var(--color-text)'};">
                            ${transaction.transactionVelocity} ${userProfile ? `(avg: ${userProfile.avgTransactionVelocity.toFixed(2)})` : ''}
                        </span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Location:</span>
                        <span>${transaction.location}</span>
                    </div>
                    <div class="risk-detail-item">
                        <span>Timestamp:</span>
                        <span>${new Date(transaction.timestamp).toLocaleString()}</span>
                    </div>
                    ${riskReasons.length > 0 ? `
                        <div style="margin-top: var(--space-16); padding: var(--space-16); background: var(--color-bg-4); border-radius: var(--radius-base); border-left: 4px solid var(--color-error);">
                            <h4 style="margin: 0 0 var(--space-8) 0; color: var(--color-error);">🚨 Risk Factors Identified:</h4>
                            <ul style="margin: 0; padding-left: var(--space-20);">
                                ${riskReasons.map(reason => `<li style="margin-bottom: var(--space-4);">${reason}</li>`).join('')}
                            </ul>
                        </div>
                    ` : `
                        <div style="margin-top: var(--space-16); padding: var(--space-16); background: var(--color-bg-3); border-radius: var(--radius-base); border-left: 4px solid var(--color-success);">
                            <h4 style="margin: 0; color: var(--color-success);">✅ No significant risk factors detected</h4>
                            <p style="margin: var(--space-8) 0 0 0; font-size: var(--font-size-sm);">This transaction follows normal patterns.</p>
                        </div>
                    `}
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
        const data = this.currentTransactions.map(t => {
            const riskReasons = this.getRiskReasons(t);
            return {
                'Transaction ID': t.id,
                'User ID': t.userId,
                'Transaction Type': t.transactionType,
                'Risk Score': t.riskScore,
                'Risk Category': t.riskCategory,
                'Anomaly': t.isAnomaly ? 'Yes' : 'No',
                'Fraud': t.fraud ? 'Yes' : 'No',
                'Risk Reasons': riskReasons.join('; '),
                'Login Attempts': t.loginAttempts,
                'Transaction Count': t.transactionCount,
                'Transaction Velocity': t.transactionVelocity,
                'Location': t.location,
                'Timestamp': t.timestamp
            };
        });
        
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
