// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const foodInput = document.getElementById('food-input');
    const predictBtn = document.getElementById('predict-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const predictBtnText = document.getElementById('predict-btn-text');
    const predictionResults = document.getElementById('prediction-results');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat-btn');
    const chatMessages = document.getElementById('chat-messages');
    const historyList = document.getElementById('history-list');
    const noHistory = document.getElementById('no-history');
    const chatHistoryList = document.getElementById('chat-history-list');
    const noChatHistory = document.getElementById('no-chat-history');
    
    // MoodMotion elements
    const cyclePhaseSelect = document.getElementById('cycle-phase');
    const stressLevelSelect = document.getElementById('stress-level');
    const emotionSelect = document.getElementById('emotion');
    const additionalFactorsInput = document.getElementById('additional-factors');
    const recommendBtn = document.getElementById('recommend-btn');
    const moodmotionResults = document.getElementById('moodmotion-results');
    const moodmotionLoading = document.getElementById('moodmotion-loading');
    const moodmotionHistoryList = document.getElementById('moodmotion-history-list');
    const noMoodmotionHistory = document.getElementById('no-moodmotion-history');
    
    // Auth elements
    const authStatusLoggedOut = document.getElementById('auth-status-logged-out');
    const authStatusLoggedIn = document.getElementById('auth-status-logged-in');
    const welcomeUser = document.getElementById('welcome-user');
    const logoutBtn = document.getElementById('logout-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Bootstrap modals
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    
    // Initialize section visibility - FIXED to use display block/none directly
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        if (section.id === 'hero-section') {
            section.style.display = 'block';
            section.classList.add('active-section');
        } else {
            section.style.display = 'none';
            section.classList.remove('active-section');
        }
    });

    // Check authentication status
    checkAuth();

    // Navigation handling with section visibility and animations - FIXED
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            console.log("Clicked on link to:", targetId);
            console.log("Target element exists:", !!targetElement);
            
            if (targetElement) {
                // Hide all sections
                sections.forEach(section => {
                    section.style.display = 'none';
                    section.classList.remove('active-section');
                    console.log("Hiding section:", section.id);
                });

                // Remove all animation classes
                targetElement.classList.remove('animate__fadeIn', 'animate__fadeInUp', 'animate__fadeInLeft', 'animate__fadeInRight');
                
                // Add appropriate animation class based on section
                let animationClass = 'animate__fadeIn';
                switch(targetId) {
                    case '#predictor':
                        animationClass = 'animate__fadeInRight';
                        break;
                    case '#chatbot':
                        animationClass = 'animate__fadeInUp';
                        break;
                    case '#history':
                        animationClass = 'animate__fadeInLeft';
                        break;
                    case '#about':
                        animationClass = 'animate__fadeInUp';
                        break;
                    case '#moodmotion':
                        animationClass = 'animate__fadeInRight';
                        break;
                }
                
                targetElement.classList.add(animationClass);
                console.log("Added animation class to:", targetId, animationClass);

                // Show the target section
                targetElement.style.display = 'block';
                targetElement.classList.add('active-section');
                console.log("Made section visible:", targetId);
                
                // Smooth scroll to the section with improved positioning
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Update active nav item
                document.querySelectorAll('.main-nav a').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                this.classList.add('active');
            } else {
                console.error("Could not find target element:", targetId);
            }
        });
    });

    // Handle Get Started button click with animation - FIXED
    const getStartedBtn = document.querySelector('.hero-section .btn-primary');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const predictorSection = document.getElementById('predictor');
            const heroSection = document.getElementById('hero-section');
            
            if (predictorSection) {
                // Hide all sections
                sections.forEach(section => {
                    section.style.display = 'none';
                    section.classList.remove('active-section');
                });

                // Prepare animation
                predictorSection.classList.remove('animate__fadeIn', 'animate__fadeInUp', 'animate__fadeInLeft', 'animate__fadeInRight');
                predictorSection.classList.add('animate__fadeInUp');

                // Show the predictor section
                predictorSection.style.display = 'block';
                predictorSection.classList.add('active-section');

                // Smooth scroll to the section
                window.scrollTo({
                    top: predictorSection.offsetTop - 100,
                    behavior: 'smooth'
                });

                // Update active nav item
                document.querySelectorAll('.main-nav a').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                document.querySelector('.main-nav a[href="#predictor"]').classList.add('active');
            }
        });
    }
    
    // Food prediction
    if (predictBtn) {
        predictBtn.addEventListener('click', function() {
            predictFood();
        });
    }
    
    if (foodInput) {
        foodInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                predictFood();
            }
        });
    }
    
    function predictFood() {
        const foodName = foodInput.value.trim();
        const quantity = "100g/100ml"; // Default quantity
        
        if (!foodName) {
            showToast('Please enter a food name', 'warning');
            return;
        }
        
        // Show loading state
        loadingSpinner.classList.remove('d-none');
        predictBtnText.textContent = 'Analyzing...';
        predictBtn.disabled = true;
        
        console.log("Making prediction request for food:", foodName, "quantity:", quantity);
        
        // Make API request
        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                food_name: foodName,
                quantity: quantity
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Prediction data received:", data);
            
            // Reset button state
            loadingSpinner.classList.add('d-none');
            predictBtnText.textContent = 'Predict';
            predictBtn.disabled = false;
            
            // Add quantity to the data if not already there
            if (data.food_data && !data.food_data.quantity) {
                data.food_data.quantity = quantity;
            }
            
            // Additional spelling correction for common foods
            const spellingCorrections = {
               
                'bna': 'dna'
            };
            
            // Apply manual corrections if the AI didn't fix it properly
            if (spellingCorrections[foodName.toLowerCase()]) {
                foodName = spellingCorrections[foodName.toLowerCase()];
                console.log("Manual correction applied: ", foodName);
                // Update the food name in the data object to ensure consistency
                data.food_data.food_name = foodName;
            }
            
            // Display results - AI-corrected food name will be shown from data.food_data.food_name
            displayPredictionResults(data);
            
            // Refresh history
            fetchHistory();
        })
        .catch(error => {
            console.error('Error:', error);
            loadingSpinner.classList.add('d-none');
            predictBtnText.textContent = 'Predict';
            predictBtn.disabled = false;
            showToast('Error: ' + error.message, 'error');
        });
    }
    
    function displayPredictionResults(data) {
        try {
            console.log("Displaying prediction results:", data);
            
            // Check if this is a non-edible item response
            if (data.non_edible_message || (data.food_data && data.food_data.is_non_edible)) {
                // Show non-edible item message
                const foodData = data.food_data;
                let foodName = foodData.name || "Unknown Item";
                const quantity = foodData.quantity || "100g/100ml";
                
                // Format as "Item Name 100g/100ml"
                document.getElementById('result-food-name-with-quantity').textContent = `${foodName} ${quantity}`;
                document.getElementById('result-food-category').textContent = foodData.category || "None";
                document.getElementById('result-category').textContent = foodData.category || "None";
                document.getElementById('result-subcategory').textContent = foodData.subcategory || "None";
                document.getElementById('result-processing').textContent = foodData.processing_level || "None";
                document.getElementById('result-calories').textContent = foodData.calories || "Unknown";
                document.getElementById('result-glycemic').textContent = foodData.glycemic_index || "Unknown";
                document.getElementById('result-inflammatory').textContent = foodData.inflammatory_index || "1/10";
                document.getElementById('result-allergens').textContent = foodData.allergens || "None";
                
                // For non-edible items, set all impacts to neutral
                const impactIds = [
                    'impact-cramps', 'impact-bloating', 'impact-headache',
                    'impact-mood', 'impact-fatigue', 'impact-acne'
                ];
                
                impactIds.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = "N/A";
                        element.classList.remove('beneficial', 'harmful');
                        element.classList.add('neutral');
                    }
                });
                
                // Show non-edible message as a toast
                if (data.non_edible_message) {
                    showToast(data.non_edible_message, 'warning');
                } else {
                    showToast(`${foodName} is not a food item. Please enter a valid food name.`, 'warning');
                }
                
                // Show results with animation
                const resultsElement = document.getElementById('prediction-results');
                resultsElement.classList.remove('d-none');
                resultsElement.classList.add('animate__animated', 'animate__fadeIn');
                
                // Hide the AI explanation section for non-edible items
                document.getElementById('ai-explanation-section').classList.add('d-none');
                
                return;
            }
            
            // Ensure we have the necessary data for regular food items
            if (!data || !data.food_data || !data.prediction_results) {
                console.error("Invalid prediction data format:", data);
                showToast("Error: Invalid prediction data received", "error");
                return;
            }
            
            // Safely set food information with fallbacks
            const foodData = data.food_data;
            let foodName = foodData.food_name || "Unknown Food";
            
            // Additional spelling correction for common foods
            const spellingCorrections = {
                'bna': 'dna'
            };
            
            // Apply manual corrections if the AI didn't fix it properly
            if (spellingCorrections[foodName.toLowerCase()]) {
                foodName = spellingCorrections[foodName.toLowerCase()];
                console.log("Manual correction applied: ", foodName);
                // Update the food name in the data object to ensure consistency
                data.food_data.food_name = foodName;
            }
            
            const quantity = foodData.quantity || "100g/100ml";
            
            console.log("Corrected food name from AI:", foodName);
            console.log("Original input field value:", foodInput.value);
            
            // Force update input field with corrected name from AI
            setTimeout(() => {
                foodInput.value = foodName;
                console.log("Input field updated to:", foodInput.value);
            }, 100);
            
            // Format as "Food Name 100g/100ml"
            document.getElementById('result-food-name-with-quantity').textContent = `${foodName} ${quantity}`;
            document.getElementById('result-food-category').textContent = foodData.food_category || "Unknown";
            document.getElementById('result-category').textContent = foodData.food_category || "Unknown";
            document.getElementById('result-subcategory').textContent = foodData.food_subcategory || "Unknown";
            document.getElementById('result-processing').textContent = foodData.processing_level || "Unknown";
            document.getElementById('result-calories').textContent = (foodData.calories_kcal ? foodData.calories_kcal + ' kcal' : "Unknown");
            document.getElementById('result-glycemic').textContent = foodData.glycemic_index || "Unknown";
            document.getElementById('result-inflammatory').textContent = (foodData.inflammatory_index ? foodData.inflammatory_index + '/10' : "Unknown");
            document.getElementById('result-allergens').textContent = foodData.common_allergens || "None";
            
            // Fill in impact values with color-coding
            const predictions = data.prediction_results;
            const impacts = {
                'impact-cramps': predictions.impact_on_cramps,
                'impact-bloating': predictions.impact_on_bloating,
                'impact-headache': predictions.impact_on_headache,
                'impact-mood': predictions.impact_on_mood_swings,
                'impact-fatigue': predictions.impact_on_fatigue,
                'impact-acne': predictions.impact_on_acne
            };
            
            for (const [elementId, value] of Object.entries(impacts)) {
                const element = document.getElementById(elementId);
                if (!element) {
                    console.warn(`Element with ID ${elementId} not found`);
                    continue;
                }
                
                element.textContent = value || "Neutral";
                
                // Remove existing classes
                element.classList.remove('beneficial', 'harmful', 'neutral');
                
                // Add appropriate class
                if (!value) {
                    element.classList.add('neutral');
                } else if (value === 'Beneficial') {
                    element.classList.add('beneficial');
                } else if (value === 'Harmful') {
                    element.classList.add('harmful');
                } else {
                    element.classList.add('neutral');
                }
            }
            
            // Show results with animation
            const resultsElement = document.getElementById('prediction-results');
            resultsElement.classList.remove('d-none');
            resultsElement.classList.add('animate__animated', 'animate__fadeIn');
            
            // Scroll to results
            resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Remove animation class after animation completes
            setTimeout(() => {
                resultsElement.classList.remove('animate__animated', 'animate__fadeIn');
            }, 1000);
            
            // Also show the explanation section
            document.getElementById('ai-explanation-section').classList.remove('d-none');
        } catch (error) {
            console.error("Error displaying prediction results:", error);
            showToast("Error displaying prediction results", "error");
        }
    }
    
    // Chatbot functionality
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', function() {
            sendChatMessage();
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
    
    function sendChatMessage() {
        const message = chatInput.value.trim();
        
        if (!message) {
            return;
        }
        
        // Add user message to chat
        addChatMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Add typing indicator
        const typingIndicator = addTypingIndicator();
        
        // Send message to API
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add bot response
            if (data.response) {
                addChatMessage(data.response, 'bot');
            } else if (data.error) {
                addChatMessage('Sorry, I encountered an error: ' + data.error, 'bot');
            }
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Refresh chat history
            fetchChatHistory();
        })
        .catch(error => {
            console.error('Error:', error);
            typingIndicator.remove();
            addChatMessage('Sorry, I encountered an error. Please try again later.', 'bot');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }
    
    function addChatMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message animate__animated animate__fadeIn`;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        
        const textElement = document.createElement('p');
        textElement.textContent = message;
        
        contentElement.appendChild(textElement);
        messageElement.appendChild(contentElement);
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            messageElement.classList.remove('animate__animated', 'animate__fadeIn');
        }, 1000);
    }
    
    function addTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-indicator animate__animated animate__fadeIn';
        
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        
        const dotsElement = document.createElement('div');
        dotsElement.className = 'typing-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dotsElement.appendChild(dot);
        }
        
        contentElement.appendChild(dotsElement);
        typingElement.appendChild(contentElement);
        
        chatMessages.appendChild(typingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return typingElement;
    }
    
    // Fetch prediction history
    function fetchHistory() {
        fetch('/history')
            .then(response => response.json())
            .then(data => {
                console.log("History data received:", data);
                if (data.history && data.history.length > 0) {
                    displayHistory(data.history);
                    noHistory.style.display = 'none';
                } else {
                    noHistory.style.display = 'block';
                    historyList.innerHTML = '';
                    historyList.appendChild(noHistory);
                }
            })
            .catch(error => {
                console.error('Error fetching history:', error);
                showToast('Error loading history', 'error');
            });
    }
    
    // Fetch chat history
    function fetchChatHistory() {
        fetch('/chat-history')
            .then(response => response.json())
            .then(data => {
                console.log("Chat history data received:", data);
                if (data.history && data.history.length > 0) {
                    displayChatHistory(data.history);
                    noChatHistory.style.display = 'none';
                } else {
                    noChatHistory.style.display = 'block';
                    chatHistoryList.innerHTML = '';
                    chatHistoryList.appendChild(noChatHistory);
                }
            })
            .catch(error => {
                console.error('Error fetching chat history:', error);
                showToast('Error loading chat history', 'error');
            });
    }
    
    function displayHistory(historyItems) {
        // Clear existing content
        historyList.innerHTML = '';
        
        console.log("Displaying history items:", historyItems.length);
        
        // Hide no-history message
        if (noHistory) {
            noHistory.style.display = 'none';
        }
        
        // Add each history item
        historyItems.forEach((item, index) => {
            console.log(`Processing history item ${index}:`, item);
            
            try {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item animate__animated animate__fadeIn';
                
                const header = document.createElement('div');
                header.className = 'history-item-header';
                
                const foodName = document.createElement('h3');
                foodName.textContent = item.food_name || "Unknown Food";
                
                const timestamp = document.createElement('span');
                timestamp.className = 'timestamp';
                timestamp.textContent = formatDate(item.timestamp);
                
                header.appendChild(foodName);
                header.appendChild(timestamp);
                
                const impactSummary = document.createElement('div');
                impactSummary.className = 'impact-summary';
                
                // Add impact summaries if results exist
                if (item.results && typeof item.results === 'object') {
                    Object.entries(item.results).forEach(([symptom, impact]) => {
                        const impactItem = document.createElement('div');
                        const impactClass = impact ? impact.toLowerCase() : 'neutral';
                        impactItem.className = `impact-badge ${impactClass}`;
                        
                        // Format symptom name
                        const symptomName = symptom.replace('impact_on_', '').replace('_', ' ');
                        impactItem.textContent = `${symptomName.charAt(0).toUpperCase() + symptomName.slice(1)}: ${impact || 'Neutral'}`;
                        
                        impactSummary.appendChild(impactItem);
                    });
                } else {
                    console.warn(`Item ${index} has invalid results:`, item.results);
                    const errorItem = document.createElement('div');
                    errorItem.className = 'impact-badge neutral';
                    errorItem.textContent = "No impact data available";
                    impactSummary.appendChild(errorItem);
                }
                
                historyItem.appendChild(header);
                historyItem.appendChild(impactSummary);
                
                historyList.appendChild(historyItem);
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    historyItem.classList.remove('animate__animated', 'animate__fadeIn');
                }, 1000);
            } catch (error) {
                console.error("Error displaying history item:", error, item);
            }
        });
    }
    
    function displayChatHistory(historyItems) {
        // Clear existing content
        chatHistoryList.innerHTML = '';
        
        console.log("Displaying chat history items:", historyItems.length);
        
        // Hide no-history message
        if (noChatHistory) {
            noChatHistory.style.display = 'none';
        }
        
        // Add each history item
        historyItems.forEach((item, index) => {
            console.log(`Processing chat history item ${index}:`, item);
            
            try {
                const historyItem = document.createElement('div');
                historyItem.className = 'chat-history-item animate__animated animate__fadeIn';
                
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.textContent = formatDate(item.timestamp);
                
                const userMessage = document.createElement('div');
                userMessage.className = 'user-message';
                userMessage.textContent = item.user_message || "No user message";
                
                const botMessage = document.createElement('div');
                botMessage.className = 'bot-message';
                botMessage.textContent = item.bot_response || "No response";
                
                historyItem.appendChild(timestamp);
                historyItem.appendChild(userMessage);
                historyItem.appendChild(botMessage);
                
                chatHistoryList.appendChild(historyItem);
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    historyItem.classList.remove('animate__animated', 'animate__fadeIn');
                }, 1000);
            } catch (error) {
                console.error("Error displaying chat history item:", error, item);
            }
        });
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
    
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type} animate__animated animate__fadeIn`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('animate__fadeIn');
            toast.classList.add('animate__fadeOut');
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 3000);
    }
    
    // Authentication functions
    function checkAuth() {
        fetch('/check-auth')
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    // User is logged in
                    authStatusLoggedOut.classList.remove('active');
                    authStatusLoggedOut.classList.add('d-none');
                    authStatusLoggedIn.classList.add('active');
                    authStatusLoggedIn.classList.remove('d-none');
                    welcomeUser.textContent = `${data.username}`;
                    
                    // Fetch user-specific data
                    fetchHistory();
                    fetchChatHistory();
                } else {
                    // User is not logged in
                    authStatusLoggedOut.classList.add('active');
                    authStatusLoggedOut.classList.remove('d-none');
                    authStatusLoggedIn.classList.remove('active');
                    authStatusLoggedIn.classList.add('d-none');
                    
                    // Fetch session-based data
                    fetchHistory();
                    fetchChatHistory();
                }
            })
            .catch(error => {
                console.error('Auth check error:', error);
                showToast('Error checking authentication status', 'error');
            });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            
            if (!username || !password) {
                showLoginError('Username and password are required');
                return;
            }
            
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Login successful
                    loginModal.hide();
                    showToast(`Welcome back, ${data.username}!`, 'success');
                    checkAuth();
                    loginForm.reset();
                    hideLoginError();
                } else {
                    // Login failed
                    showLoginError(data.error || 'Login failed');
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showLoginError('An error occurred. Please try again.');
            });
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value.trim();
            const confirmPassword = document.getElementById('register-confirm-password').value.trim();
            
            if (!username || !email || !password || !confirmPassword) {
                showRegisterError('All fields are required');
                return;
            }
            
            if (password !== confirmPassword) {
                showRegisterError('Passwords do not match');
                return;
            }
            
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Registration successful
                    registerModal.hide();
                    showToast(`Welcome, ${data.username}! Your account has been created.`, 'success');
                    checkAuth();
                    registerForm.reset();
                    hideRegisterError();
                } else {
                    // Registration failed
                    showRegisterError(data.error || 'Registration failed');
                }
            })
            .catch(error => {
                console.error('Registration error:', error);
                showRegisterError('An error occurred. Please try again.');
            });
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            fetch('/logout', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('You have been logged out', 'info');
                    checkAuth();
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
                showToast('Error logging out', 'error');
            });
        });
    }
    
    // Switch between login and register modals
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.hide();
            setTimeout(() => {
                registerModal.show();
            }, 500);
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.hide();
            setTimeout(() => {
                loginModal.show();
            }, 500);
        });
    }
    
    function showLoginError(message) {
        loginError.textContent = message;
        loginError.classList.remove('d-none');
    }
    
    function hideLoginError() {
        loginError.classList.add('d-none');
    }
    
    function showRegisterError(message) {
        registerError.textContent = message;
        registerError.classList.remove('d-none');
    }
    
    function hideRegisterError() {
        registerError.classList.add('d-none');
    }
    
    // Add clear history functionality
    const clearPredictionsBtn = document.getElementById('clear-predictions');
    const clearChatsBtn = document.getElementById('clear-chats');

    if (clearPredictionsBtn) {
        clearPredictionsBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your prediction history?')) {
                clearPredictionHistory();
            }
        });
    }

    if (clearChatsBtn) {
        clearChatsBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear your chat history?')) {
                clearChatHistory();
            }
        });
    }

    function clearPredictionHistory() {
        fetch('/clear-predictions', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Prediction history cleared', 'success');
                // Clear the display
                historyList.innerHTML = '';
                historyList.appendChild(noHistory);
                noHistory.style.display = 'block';
            } else {
                showToast('Error clearing history', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error clearing history', 'error');
        });
    }

    function clearChatHistory() {
        fetch('/clear-chats', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Chat history cleared', 'success');
                // Clear the display
                chatHistoryList.innerHTML = '';
                chatHistoryList.appendChild(noChatHistory);
                noChatHistory.style.display = 'block';
            } else {
                showToast('Error clearing chat history', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error clearing chat history', 'error');
        });
    }
    
    // Mobile bottom navigation handling
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
        bottomNav.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                
                // Update active nav items in both top and bottom navigation
                bottomNav.querySelectorAll('.bottom-nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                this.classList.add('active');
                
                document.querySelectorAll('.main-nav a').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                document.querySelector(`.main-nav a[href="#${sectionId}"]`)?.classList.add('active');
                
                // Show the selected section
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    sections.forEach(section => {
                        section.style.display = 'none';
                        section.classList.remove('active-section');
                    });
                    
                    // Add animation
                    let animationClass = 'animate__fadeIn';
                    switch(sectionId) {
                        case 'predictor':
                            animationClass = 'animate__fadeInRight';
                            break;
                        case 'chatbot':
                            animationClass = 'animate__fadeInUp';
                            break;
                        case 'history':
                            animationClass = 'animate__fadeInLeft';
                            break;
                        case 'about':
                            animationClass = 'animate__fadeInUp';
                            break;
                        case 'moodmotion':
                            animationClass = 'animate__fadeInRight';
                            break;
                    }
                    
                    targetSection.classList.remove('animate__fadeIn', 'animate__fadeInUp', 'animate__fadeInLeft', 'animate__fadeInRight');
                    targetSection.classList.add(animationClass);
                    
                    // Display section and scroll to it
                    targetSection.style.display = 'block';
                    targetSection.classList.add('active-section');
                    
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // MoodMotion recommend activity
    if (recommendBtn) {
        recommendBtn.addEventListener('click', function() {
            recommendActivity();
        });
    }

    // Initialize by fetching history for all features
    fetchHistory();
    fetchChatHistory();
    fetchMoodMotionHistory();

    // MoodMotion functions
    function recommendActivity() {
        // Check if required fields are filled
        const cyclePhase = cyclePhaseSelect.value;
        const stressLevel = stressLevelSelect.value;
        const emotion = emotionSelect.value;
        const additionalFactors = additionalFactorsInput.value;
        
        if (!cyclePhase || !stressLevel || !emotion) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        // Show loading state
        moodmotionLoading.style.display = 'flex';
        recommendBtn.disabled = true;
        
        // Prepare data
        const data = {
            cycle_phase: cyclePhase,
            stress_level: stressLevel,
            emotion: emotion,
            additional_factors: additionalFactors
        };
        
        // Make API request
        fetch('/moodmotion-recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            displayActivityRecommendation(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('There was an error getting your recommendation. Please try again.', 'danger');
        })
        .finally(() => {
            // Hide loading state
            moodmotionLoading.style.display = 'none';
            recommendBtn.disabled = false;
        });
    }
    
    function displayActivityRecommendation(data) {
        if (data.error) {
            showToast(data.error, 'danger');
            return;
        }
        
        const recommendation = data.recommendation;
        
        // Clear previous results
        moodmotionResults.innerHTML = '';
        
        // Create result card
        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-4 animate__animated animate__fadeIn';
        
        // Determine card color based on emotion/stress level
        let cardColor = 'border-primary';
        if (stressLevelSelect.value > 7) {
            cardColor = 'border-danger';
        } else if (emotionSelect.value.toLowerCase().includes('sad') || 
                   emotionSelect.value.toLowerCase().includes('angry') ||
                   emotionSelect.value.toLowerCase().includes('anxious')) {
            cardColor = 'border-warning';
        } else if (emotionSelect.value.toLowerCase().includes('happy') ||
                   emotionSelect.value.toLowerCase().includes('calm')) {
            cardColor = 'border-success';
        }
        
        card.classList.add(cardColor);
        
        // Format extras and benefits for display
        let extrasText = '';
        let benefitsHtml = '';
        
        // Process "What you'll need" section
        if (typeof recommendation.extras === 'string') {
            extrasText = recommendation.extras;
        } else if (recommendation.extras) {
            try {
                // If it's already an object
                const extrasObj = (typeof recommendation.extras === 'object') 
                    ? recommendation.extras 
                    : JSON.parse(recommendation.extras);
                
                // Create a formatted list from the object properties
                extrasText = '<ul class="needs-list">';
                for (const [key, value] of Object.entries(extrasObj)) {
                    const formattedKey = key.replace(/_/g, ' ')
                                          .split(' ')
                                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                          .join(' ');
                    extrasText += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
                }
                extrasText += '</ul>';
            } catch (e) {
                console.error("Error parsing extras:", e);
                extrasText = String(recommendation.extras);
            }
        } else {
            extrasText = 'None specified';
        }
        
        // Process "Benefits" section
        if (typeof recommendation.benefits === 'string') {
            benefitsHtml = recommendation.benefits;
        } else if (recommendation.benefits) {
            try {
                // If it's already an object
                const benefitsObj = (typeof recommendation.benefits === 'object') 
                    ? recommendation.benefits 
                    : JSON.parse(recommendation.benefits);
                
                // Create a formatted list from the object properties
                benefitsHtml = '<ul class="benefits-list">';
                for (const [key, value] of Object.entries(benefitsObj)) {
                    const formattedKey = key.replace(/_/g, ' ')
                                           .split(' ')
                                           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                           .join(' ');
                    benefitsHtml += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
                }
                benefitsHtml += '</ul>';
            } catch (e) {
                console.error("Error parsing benefits:", e);
                benefitsHtml = String(recommendation.benefits);
            }
        } else {
            benefitsHtml = 'None specified';
        }
        
        // Create card HTML content
        card.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${recommendation.activity_name}</h5>
                <button class="btn btn-sm btn-outline-secondary explain-activity">
                    <i class="fas fa-info-circle"></i> Explain with NutriGain
                </button>
            </div>
            <div class="card-body">
                <p class="card-text">${recommendation.description}</p>
                <h6 class="mt-4 mb-3">How to do it:</h6>
                <ol class="step-list">
                    ${recommendation.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
                <div class="extras-container mt-4">
                    <h6 class="mb-3">What you'll need:</h6>
                    <div>${extrasText}</div>
                </div>
                <div class="benefits-container mt-4">
                    <h6 class="mb-2">Benefits:</h6>
                    <div>${benefitsHtml}</div>
                </div>
                <div class="explanation-container mt-4 d-none">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="card-subtitle mb-3 text-muted">Why this works for you:</h6>
                            <div class="explanation-text">
                                <div class="spinner-border spinner-border-sm" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div> Loading explanation...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add card to results container
        moodmotionResults.appendChild(card);
        
        // Add event listener to explain button
        card.querySelector('.explain-activity').addEventListener('click', function() {
            const explanationContainer = card.querySelector('.explanation-container');
            explanationContainer.classList.remove('d-none');
            
            // Get explanation text container
            const explanationText = card.querySelector('.explanation-text');
            
            // Get data for explanation
            const data = {
                activity_name: recommendation.activity_name,
                cycle_phase: cyclePhaseSelect.value,
                emotion: emotionSelect.value
            };
            
            // Make API request for explanation
            fetch('/moodmotion-explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    explanationText.innerHTML = `<p class="text-danger">${data.error}</p>`;
                    return;
                }
                
                // Create explanation points
                let explanationHTML = '<ul class="explanation-list">';
                data.explanation.forEach(point => {
                    explanationHTML += `<li>${point}</li>`;
                });
                explanationHTML += '</ul>';
                
                explanationText.innerHTML = explanationHTML;
            })
            .catch(error => {
                console.error('Error:', error);
                explanationText.innerHTML = '<p class="text-danger">Error loading explanation. Please try again.</p>';
            });
        });
        
        // Smooth scroll to results
        moodmotionResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function fetchMoodMotionHistory() {
        fetch('/moodmotion-history')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showToast(data.error, 'danger');
                    return;
                }
                
                displayMoodMotionHistory(data.history);
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error fetching MoodMotion history', 'danger');
            });
    }
    
    function displayMoodMotionHistory(historyItems) {
        if (!moodmotionHistoryList) return;
        
        // Clear current history
        moodmotionHistoryList.innerHTML = '';
        
        if (historyItems.length === 0) {
            if (noMoodmotionHistory) {
                noMoodmotionHistory.style.display = 'block';
            }
            return;
        }
        
        if (noMoodmotionHistory) {
            noMoodmotionHistory.style.display = 'none';
        }
        
        // Add each history item
        historyItems.forEach((item, index) => {
            const historyCard = document.createElement('div');
            historyCard.className = 'card shadow-sm mb-3 animate__animated animate__fadeIn';
            historyCard.style.animationDelay = `${index * 0.1}s`;
            
            // Determine card color based on emotion
            let cardBorder = 'border-primary';
            if (item.emotion.toLowerCase().includes('sad') || 
                item.emotion.toLowerCase().includes('angry') ||
                item.emotion.toLowerCase().includes('anxious')) {
                cardBorder = 'border-warning';
            } else if (item.emotion.toLowerCase().includes('happy') ||
                      item.emotion.toLowerCase().includes('calm')) {
                cardBorder = 'border-success';
            }
            
            historyCard.classList.add(cardBorder);
            
            // Format extras and benefits for display
            let extrasText = '';
            let benefitsHtml = '';
            
            // Process "What you'll need" section
            if (typeof item.extras === 'string') {
                extrasText = item.extras;
            } else if (item.extras) {
                try {
                    // If it's already an object
                    const extrasObj = (typeof item.extras === 'object') 
                        ? item.extras 
                        : JSON.parse(item.extras);
                    
                    // Create a formatted list from the object properties
                    extrasText = '<ul class="needs-list">';
                    for (const [key, value] of Object.entries(extrasObj)) {
                        const formattedKey = key.replace(/_/g, ' ')
                                              .split(' ')
                                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                              .join(' ');
                        extrasText += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
                    }
                    extrasText += '</ul>';
                } catch (e) {
                    console.error("Error parsing extras:", e);
                    extrasText = String(item.extras);
                }
            } else {
                extrasText = 'None specified';
            }
            
            // Process "Benefits" section
            if (typeof item.benefits === 'string') {
                benefitsHtml = item.benefits;
            } else if (item.benefits) {
                try {
                    // If it's already an object
                    const benefitsObj = (typeof item.benefits === 'object') 
                        ? item.benefits 
                        : JSON.parse(item.benefits);
                    
                    // Create a formatted list from the object properties
                    benefitsHtml = '<ul class="benefits-list">';
                    for (const [key, value] of Object.entries(benefitsObj)) {
                        const formattedKey = key.replace(/_/g, ' ')
                                               .split(' ')
                                               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                               .join(' ');
                        benefitsHtml += `<li><strong>${formattedKey}:</strong> ${value}</li>`;
                    }
                    benefitsHtml += '</ul>';
                } catch (e) {
                    console.error("Error parsing benefits:", e);
                    benefitsHtml = String(item.benefits);
                }
            } else {
                benefitsHtml = 'None specified';
            }
            
            // Create card HTML
            historyCard.innerHTML = `
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${item.activity_name}</h6>
                        <small class="text-muted">${formatDate(item.timestamp)}</small>
                    </div>
                </div>
                <div class="card-body">
                    <div class="d-flex mb-2">
                        <span class="badge bg-info me-2">Phase: ${item.cycle_phase}</span>
                        <span class="badge bg-secondary me-2">Stress: ${item.stress_level}/10</span>
                        <span class="badge bg-primary">Feeling: ${item.emotion}</span>
                    </div>
                    <p class="card-text mb-0">${item.description}</p>
                    <button class="btn btn-sm btn-outline-primary mt-2 view-details-btn">View Details</button>
                    <div class="activity-details mt-3 d-none">
                        <h6 class="mb-2">How to do it:</h6>
                        <ol class="step-list small">
                            ${item.steps.map(step => `<li>${step}</li>`).join('')}
                        </ol>
                        <div class="extras-container mt-3">
                            <h6 class="mb-1 small">What you'll need:</h6>
                            <div class="small">${extrasText}</div>
                        </div>
                        <div class="benefits-container mt-2">
                            <h6 class="mb-1 small">Benefits:</h6>
                            <div class="small">${benefitsHtml}</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add to history list
            moodmotionHistoryList.appendChild(historyCard);
            
            // Add event listener for view details button
            const detailsBtn = historyCard.querySelector('.view-details-btn');
            const detailsContainer = historyCard.querySelector('.activity-details');
            
            detailsBtn.addEventListener('click', function() {
                if (detailsContainer.classList.contains('d-none')) {
                    detailsContainer.classList.remove('d-none');
                    detailsBtn.textContent = 'Hide Details';
                } else {
                    detailsContainer.classList.add('d-none');
                    detailsBtn.textContent = 'View Details';
                }
            });
        });
    }
    
    function clearMoodMotionHistory() {
        if (!confirm('Are you sure you want to clear your MoodMotion history?')) {
            return;
        }
        
        fetch('/clear-moodmotion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('MoodMotion history cleared', 'success');
                fetchMoodMotionHistory(); // Refresh history
            } else {
                showToast(data.error || 'Error clearing history', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error clearing history', 'danger');
        });
    }

    // Swipe Gesture Support
    let touchStartX = 0;
    let touchEndX = 0;
    let minSwipeDistance = 50;

    function setupSwipeGestures() {
        const appMain = document.querySelector('.app-main');
        if (!appMain) return;

        appMain.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        }, { passive: true });

        appMain.addEventListener('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) < minSwipeDistance) return;
        
        const sections = ['home', 'activities', 'history', 'settings'];
        const currentPageIndex = sections.findIndex(section => 
            document.getElementById(section + '-section').classList.contains('active-section')
        );
        
        if (currentPageIndex === -1) return;
        
        let newPageIndex;
        
        if (swipeDistance > 0) {
            // Swipe right - go to previous page
            newPageIndex = currentPageIndex - 1;
            if (newPageIndex < 0) newPageIndex = 0;
        } else {
            // Swipe left - go to next page
            newPageIndex = currentPageIndex + 1;
            if (newPageIndex >= sections.length) newPageIndex = sections.length - 1;
        }
        
        if (newPageIndex !== currentPageIndex) {
            // Add animation classes
            const currentSection = document.getElementById(sections[currentPageIndex] + '-section');
            const newSection = document.getElementById(sections[newPageIndex] + '-section');
            
            if (swipeDistance > 0) {
                // Going back/left
                currentSection.classList.add('next-enter');
                setTimeout(() => {
                    changePage(sections[newPageIndex]);
                    currentSection.classList.remove('next-enter');
                }, 300);
            } else {
                // Going forward/right
                currentSection.classList.add('prev-exit');
                setTimeout(() => {
                    changePage(sections[newPageIndex]);
                    currentSection.classList.remove('prev-exit');
                }, 300);
            }
        }
    }

    function changePage(page) {
        // Hide all sections
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active-section');
        });
        
        // Show selected section
        document.getElementById(page + '-section').classList.add('active-section');
        
        // Update top navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // Update bottom navigation
        document.querySelectorAll('.bottom-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeBottomNavItem = document.querySelector(`.bottom-nav-item[data-page="${page}"]`);
        if (activeBottomNavItem) {
            activeBottomNavItem.classList.add('active');
        }
    }

    // Setup swipe gestures
    setupSwipeGestures();

    // Fix theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    const mainCss = document.getElementById('main-css');
    const lightThemeCss = document.getElementById('light-theme-css');
    const darkThemeCss = document.getElementById('dark-theme-css');
    
    if (themeToggle) {
        // Check saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            bodyElement.classList.add('dark-mode');
            themeToggle.checked = true;
            if (lightThemeCss) lightThemeCss.disabled = true;
            if (darkThemeCss) darkThemeCss.disabled = false;
        }
        
        // Theme toggle event listener
        themeToggle.addEventListener('change', function() {
            bodyElement.classList.toggle('dark-mode');
            bodyElement.classList.add('theme-transition');
            
            setTimeout(() => {
                bodyElement.classList.remove('theme-transition');
            }, 600);
            
            if (this.checked) {
                // Switch to dark theme
                if (lightThemeCss) lightThemeCss.disabled = true;
                if (darkThemeCss) darkThemeCss.disabled = false;
                localStorage.setItem('theme', 'dark');
            } else {
                // Switch to light theme
                if (lightThemeCss) lightThemeCss.disabled = false;
                if (darkThemeCss) darkThemeCss.disabled = true;
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // Fix bottom navigation to include "about" section
    const aboutNavItem = document.querySelector('.bottom-nav-item[data-section="about"]');
    if (aboutNavItem) {
        aboutNavItem.addEventListener('click', function() {
            const sections = document.querySelectorAll('.page-section');
            sections.forEach(section => {
                section.classList.remove('active-section');
                section.style.display = 'none';
            });
            
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.classList.add('active-section');
                aboutSection.style.display = 'block';
                
                // Update active nav items
                document.querySelectorAll('.bottom-nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                this.classList.add('active');
                
                document.querySelectorAll('.main-nav a').forEach(item => {
                    item.classList.remove('active');
                });
                document.querySelector('.main-nav a[href="#about"]')?.classList.add('active');
            }
        });
    }
});