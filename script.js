 // Add these variables at the top of your script section
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLOLoT3w83iJSL0QfVxqB5XtrXeE156f_4lXklpCP6OnPrrH6QB9AZfKxawPDziNAI/exec';
let currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);
let currentSessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

    const chatData = {
     'quaf dhdc': {
        name: 'QUAF DHDC',
        status: 'online',
        lastSeen: '',
        isOnline: true,
        avatar: 'pic/logo.png',
        color: '#f9ca24',
        messages: [
            { type: 'received', content: 'hi', time: '3:30', date: 'today' },
            { type: 'sent', content: 'hello', time: '3:32', date: 'today' },
            { type: 'received', content: 'any help?', time: '3:33', date: 'today' }
        ]
    }, 
    'nasik kv': {
        name: 'Nasik KV',
        status: 'last seen 1 hour ago',
        lastSeen: '1 hour ago',
        isOnline: false,
        avatar: 'pic/nasik.png',
        color: '#f0932b',
        messages: [
            { type: 'received', content: 'Thanks for all your support!', time: '15:45', date: 'today' },
            { type: 'sent', content: 'Always happy to help!', time: '15:47', date: 'today' },
            { type: 'received', content: 'great', time: '15:48', date: 'today' }
        ]
    }
};

    let currentChatId = null;
    let isTyping = false;

    function initializeApp() {
        renderChatList();
        setupEventListeners();
        setupEmojiPicker();
        setupSearch();
        setupMobileEnhancements();
        handleResize();
    }

    function setupMobile() {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('mobile-active');
        }
    }

    function setupMobileEnhancements() {
        // Prevent zoom on input focus (iOS)
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (window.innerWidth <= 768) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            });
            
            input.addEventListener('blur', () => {
                if (window.innerWidth <= 768) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            });
        });
        
        // Handle swipe gestures for mobile navigation
        let startX = 0;
        let currentX = 0;
        let isSwipeActive = false;
        
        const sidebar = document.getElementById('sidebar');
        
        document.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) {
                startX = e.touches[0].clientX;
                isSwipeActive = true;
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isSwipeActive || window.innerWidth > 768) return;
            
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            // Swipe right to open sidebar
            if (diffX > 50 && !sidebar.classList.contains('mobile-active')) {
                sidebar.classList.add('mobile-active');
            }
            
            // Swipe left to close sidebar
            if (diffX < -50 && sidebar.classList.contains('mobile-active')) {
                sidebar.classList.remove('mobile-active');
            }
        });
        
        document.addEventListener('touchend', () => {
            isSwipeActive = false;
        });
    }

    function renderChatList() {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';

    Object.entries(chatData).forEach(([chatId, chat]) => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chatId;
        
        const unreadCount = Math.floor(Math.random() * 5);
        
        chatItem.innerHTML = `
            <div class="profile-pic contact-pic" style="background: ${chat.color};">
                <img src="${chat.avatar}" alt="${chat.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <span style="display: none;">${chat.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
                ${chat.isOnline ? '<div class="online-indicator"></div>' : ''}
            </div>
            <div class="chat-info">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-preview">${lastMessage.content}</div>
            </div>
            <div class="chat-meta">
                <div class="chat-time">${lastMessage.time}</div>
                ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
            </div>
        `;
        
        chatItem.addEventListener('click', () => openChat(chatId));
        chatList.appendChild(chatItem);
    });
}

    function openChat(chatId) {
    currentChatId = chatId;
    const chat = chatData[chatId];
    
    // Update active chat item
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('active');
    
    // Update chat header
    const contactPic = document.getElementById('currentContactPic');
    contactPic.style.background = chat.color;
    contactPic.innerHTML = `
        <img src="${chat.avatar}" alt="${chat.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span style="display: none;">${chat.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</span>
        ${chat.isOnline ? '<div class="online-indicator"></div>' : ''}
    `;
    
    document.getElementById('currentContactName').textContent = chat.name;
    document.getElementById('currentContactStatus').textContent = chat.status;
    
    // Show chat area
    document.getElementById('noChatSelected').style.display = 'none';
    document.getElementById('chatArea').style.display = 'flex';
    
    // Render messages
    renderMessages(chat.messages);
    
    // Hide sidebar on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('mobile-active');
    }
}

    function renderMessages(messages) {
        const container = document.getElementById('messagesContainer');
        const typingIndicator = document.getElementById('typingIndicator');
        container.innerHTML = '';
        container.appendChild(typingIndicator);
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.type}`;
            
            messageElement.innerHTML = `
                <div class="message-content">${message.content}</div>
                <div class="message-time">
                    ${message.time}
                    ${message.type === 'sent' ? '<i class="fas fa-check-double read-receipt"></i>' : ''}
                </div>
            `;
            
            container.appendChild(messageElement);
        });
        
        container.scrollTop = container.scrollHeight;
    }

    function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (messageText && currentChatId) {
        const currentTime = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        const newMessage = {
            type: 'sent',
            content: messageText,
            time: currentTime,
            date: 'today'
        };
        
        chatData[currentChatId].messages.push(newMessage);
        renderMessages(chatData[currentChatId].messages);
        messageInput.value = '';
        
        // Send message data to Google Sheets
        sendMessageToGoogleSheets({
            contactName: chatData[currentChatId].name,
            content: messageText,
            type: 'sent',
            timestamp: new Date().toISOString(),
            chatId: currentChatId
        });
        
        // Simulate typing and auto-reply
        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                simulateReply();
            }, 2000);
        }, 500);
        
        // Update chat list
        renderChatList();
        document.querySelector(`[data-chat-id="${currentChatId}"]`).classList.add('active');
    }
}

    function simulateReply() {
    if (currentChatId) {
        const replies = [
            "Thanks for the message! 😊",
            "Got it! 👍",
            "Sounds good to me!",
            "I'll get back to you soon",
            "Perfect! 🎉",
            "Let me check and let you know",
            "That's awesome! 🔥",
            "I agree with you",
            "Thanks for letting me know!",
            "Sure thing! 💪"
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const currentTime = new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        const replyMessage = {
            type: 'received',
            content: randomReply,
            time: currentTime,
            date: 'today'
        };
        
        chatData[currentChatId].messages.push(replyMessage);
        renderMessages(chatData[currentChatId].messages);
        
        // Send reply data to Google Sheets
        sendMessageToGoogleSheets({
            contactName: chatData[currentChatId].name,
            content: randomReply,
            type: 'received',
            timestamp: new Date().toISOString(),
            chatId: currentChatId
        });
        
        renderChatList();
        document.querySelector(`[data-chat-id="${currentChatId}"]`).classList.add('active');
    }
}

    function showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'block';
        document.getElementById('messagesContainer').scrollTop = document.getElementById('messagesContainer').scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'none';
    }

    function setupEventListeners() {
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const mobileBack = document.getElementById('mobileBack');
    const attachButton = document.getElementById('attachButton'); // NEW: Add this
    const fileInput = document.getElementById('fileInput'); // NEW: Add this
    
    // Existing event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', (e) => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });
    
    mobileBack.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('mobile-active');
            document.getElementById('chatArea').style.display = 'none';
            document.getElementById('noChatSelected').style.display = 'flex';
            currentChatId = null;
            
            // Clear active chat
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // Enhanced window resize handler
    window.addEventListener('resize', handleResize);
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
    });
    
    // NEW: File upload event listeners
    attachButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && currentChatId) {
            const maxSize = 10 * 1024 * 1024; // 10MB limit
            if (file.size > maxSize) {
                alert('File size must be less than 10MB');
                return;
            }
            
            handleFileUpload(file, currentChatId, chatData[currentChatId].name);
        }
        e.target.value = ''; // Reset file input
    });
}

    function handleResize() {
        const sidebar = document.getElementById('sidebar');
        const chatArea = document.getElementById('chatArea');
        const noChatSelected = document.getElementById('noChatSelected');
        
        if (window.innerWidth > 768) {
            // Desktop view
            sidebar.classList.remove('mobile-active');
            if (currentChatId) {
                chatArea.style.display = 'flex';
                noChatSelected.style.display = 'none';
            } else {
                chatArea.style.display = 'none';
                noChatSelected.style.display = 'flex';
            }
        } else {
            // Mobile view
            if (currentChatId) {
                sidebar.classList.remove('mobile-active');
                chatArea.style.display = 'flex';
                noChatSelected.style.display = 'none';
            } else {
                sidebar.classList.add('mobile-active');
                chatArea.style.display = 'none';
                noChatSelected.style.display = 'flex';
            }
        }
    }

    function setupEmojiPicker() {
        const emojiButton = document.getElementById('emojiButton');
        const emojiPicker = document.getElementById('emojiPicker');
        const messageInput = document.getElementById('messageInput');
        
        emojiButton.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
        });  
        
        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
                emojiPicker.style.display = 'none';
            }
        });
        
        emojiPicker.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji')) {
                messageInput.value += e.target.textContent;
                messageInput.focus();
            }
        });
    }

    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const chatItems = document.querySelectorAll('.chat-item');
            
            chatItems.forEach(item => {
                const name = item.querySelector('.chat-name').textContent.toLowerCase();
                const preview = item.querySelector('.chat-preview').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || preview.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }); 
    }

    // Initialize the app when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initializeApp();
        setupMobile();
    });
    
    // Function to send message data to Google Sheets
function sendMessageToGoogleSheets(messageData) {
    const formData = new FormData();
    formData.append('action', 'whatsapp_message');
    formData.append('userId', currentUserId);
    formData.append('contactName', messageData.contactName);
    formData.append('messageContent', messageData.content);
    formData.append('messageType', messageData.type);
    formData.append('timestamp', messageData.timestamp);
    formData.append('sessionId', currentSessionId);
    formData.append('chatId', messageData.chatId);
    formData.append('ipAddress', 'Unknown'); // You can get this from a service if needed
    formData.append('userAgent', navigator.userAgent);

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Message logged to Google Sheets:', data);
    })
    .catch(error => {
        console.error('Error logging message:', error);
    });
}

// Function to handle file uploads
function handleFileUpload(file, chatId, contactName) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        const formData = new FormData();
        formData.append('action', 'file_upload');
        formData.append('name', currentUserId);
        formData.append('email', currentUserId + '@whatsapp.local');
        formData.append('fileName', file.name);
        formData.append('base64Data', base64Data);
        formData.append('fileSize', file.size + ' bytes');
        formData.append('fileType', file.type);
        formData.append('uploadContext', 'WhatsApp');
        formData.append('chatId', chatId);
        formData.append('sessionId', currentSessionId);

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('File uploaded successfully:', data);
            
            // Add file message to chat
            const fileMessage = {
                type: 'sent',
                content: `📎 ${file.name} (${formatFileSize(file.size)})`,
                time: new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                }),
                date: 'today',
                isFile: true,
                fileUrl: data.fileUrl,
                fileName: file.name
            };
            
            if (currentChatId) {
                chatData[currentChatId].messages.push(fileMessage);
                renderMessages(chatData[currentChatId].messages);
                
                // Log file upload as message
                sendMessageToGoogleSheets({
                    contactName: contactName,
                    content: `File uploaded: ${file.name}`,
                    type: 'sent',
                    timestamp: new Date().toISOString(),
                    chatId: currentChatId
                });
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        });
    };
    
    reader.readAsDataURL(file);
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
