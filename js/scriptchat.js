document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const fileInput = document.getElementById('fileInput');
    const storageKey = 'chatMessages';
    const likesKey = 'messageLikes';
    let messageLikes = getLikesFromStorage();


    loadMessages();

    sendButton.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        const file = fileInput.files[0];


        if(messageText || file) {
            sendMessage(messageText, file);
            messageInput.value = '';
            fileInput.value = '';
        }
    });


    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const messageText = messageInput.value.trim();
            const file = fileInput.files[0];

            if(messageText || file){
                sendMessage(messageText, file);
                messageInput.value = '';
                fileInput.value = '';
            }
        }
    });


   function sendMessage(messageText, file) {
    const now = new Date();
    const dateString = now.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
        let message = {id: Date.now(), text: messageText, date: dateString, isOwn: true};
        if(file){
            const reader = new FileReader();
            reader.onload = (e) => {
                message.file = {
                    name: file.name,
                    type: file.type,
                    content: e.target.result
                }
                saveMessage(message);
                addMessageToChat(message);
            }
            reader.readAsDataURL(file);
        }
        else{
            saveMessage(message)
            addMessageToChat(message);
        }
    }
    function saveMessage(message){
        let messages = getMessagesFromStorage();
        messages.push(message);
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }
     function saveLikesToStorage() {
        localStorage.setItem(likesKey, JSON.stringify(messageLikes));
    }
    function getLikesFromStorage(){
        const storedLikes = localStorage.getItem(likesKey);
        return storedLikes ? JSON.parse(storedLikes) : {};
    }
    function getMessagesFromStorage(){
        const storedMessages = localStorage.getItem(storageKey);
        return storedMessages ? JSON.parse(storedMessages) : [];
    }
    function addMessageToChat(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.dataset.messageId = message.id;
        if(message.isOwn)
            messageDiv.classList.add('own-message');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteMessage(message.id, messageDiv);
        });
        const likeContainer = document.createElement('div');
        likeContainer.classList.add('like-button-container');
        const likeButton = document.createElement('button');
        likeButton.classList.add('like-button');
        likeButton.innerHTML = '♥';
        const likeCount = document.createElement('span');
        likeCount.classList.add('like-count')
        likeCount.textContent = messageLikes[message.id] ? messageLikes[message.id].count : 0;
        if(messageLikes[message.id] && messageLikes[message.id].liked )
            likeButton.classList.add('liked');
        likeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(message.id, likeButton, likeCount);
        });
        likeContainer.appendChild(likeButton)
        likeContainer.appendChild(likeCount)
        const dateDiv = document.createElement('div')
        dateDiv.classList.add('message-date');
        dateDiv.textContent = message.date;
        if(message.text) {
            const textElement = document.createElement('p');
            textElement.textContent = message.text;
            messageDiv.appendChild(textElement);
        }
        if (message.file) {
            const fileType = message.file.type;
            if(fileType.startsWith('image')){
                const image = document.createElement('img');
                image.src = message.file.content
                image.classList.add('file-image');
                messageDiv.appendChild(image);
            }
            else{
                const fileLink = document.createElement('a');
                fileLink.href = message.file.content;
                fileLink.target = '_blank'
                fileLink.textContent = message.file.name;
                fileLink.classList.add('file-link')
                messageDiv.appendChild(fileLink);
            }
        }
        messageDiv.appendChild(likeContainer);
        messageDiv.appendChild(deleteButton);
        messageDiv.appendChild(dateDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    function toggleLike(messageId, likeButton, likeCount) {
        if(!messageLikes[messageId])
            messageLikes[messageId] = {liked: false, count: 0};
        if (messageLikes[messageId].liked) {
            messageLikes[messageId].liked = false;
            messageLikes[messageId].count--;
            likeButton.classList.remove('liked');
        } else {
            messageLikes[messageId].liked = true;
            messageLikes[messageId].count++;
            likeButton.classList.add('liked');
        }
        likeCount.textContent = messageLikes[messageId].count;
        saveLikesToStorage();
    }
    function deleteMessage(messageId, messageDiv) {
        let messages = getMessagesFromStorage();
        messages = messages.filter(message => message.id !== messageId);
        localStorage.setItem(storageKey, JSON.stringify(messages));
        delete messageLikes[messageId];
        saveLikesToStorage();
        messageDiv.remove();
    }
    function loadMessages() {
        const messages = getMessagesFromStorage();
        messages.forEach(message => {
            addMessageToChat(message)
        });
    }
});