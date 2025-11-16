let player;
let currentUser = null;
const users = {}; // In-memory user storage

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '300',
        width: '100%',
        videoId: '',
        playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            playsinline: 1
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const authBtn = document.getElementById('authBtn');
    const authContainer = document.getElementById('authContainer');
    const loginClose = loginModal.querySelector('.close');
    const signupClose = signupModal.querySelector('.close');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginForm = document.getElementById('authForm');
    const signupForm = document.getElementById('signupForm');

    // Open login modal
    authBtn.addEventListener('click', () => {
        if (!currentUser) {
            loginModal.style.display = 'block';
        }
    });

    // Close modals
    loginClose.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    signupClose.addEventListener('click', () => {
        signupModal.style.display = 'none';
    });

    // Switch between login and signup
    switchToSignup.addEventListener('click', () => {
        loginModal.style.display = 'none';
        signupModal.style.display = 'block';
    });
    switchToLogin.addEventListener('click', () => {
        signupModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Handle login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (users[username] && users[username] === password) {
            currentUser = username;
            updateAuthUI();
            loginModal.style.display = 'none';
            loginForm.reset();
        } else {
            alert('Invalid username or password!');
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (users[username]) {
            alert('Username already exists!');
            return;
        }

        users[username] = password;
        currentUser = username;
        updateAuthUI();
        signupModal.style.display = 'none';
        signupForm.reset();
    });

    function updateAuthUI() {
        if (currentUser) {
            authBtn.innerHTML = `<span>Logged in as </span><span class="welcome-user">${currentUser}</span>`;
        } else {
            authBtn.innerHTML = 'Login / Sign Up';
        }
    }

    const sampleVideos = [
        { id: 'w6uX9jamcwQ', title: 'Waterfall video' },
        { id: 'xuP4g7IDgDM', title: 'Beautiful sunset' },
        { id: 'nqye02H_H6I', title: 'Calm River' },
        { id: '9iDXWx7GtZQ', title: 'Soothing nature' },
        { id: 'ppR_QhxqgEE', title: 'Forest view' },
        { id: 'NSAOrGb9orM', title: 'Beautiful landscape' },
        { id: '-oOoTIuoL8M', title: 'Mountain' }
    ];

    class VideoStack {
        constructor() {
            this.videos = [];
            this.capacity = 10;
        }
        push(video) {
            if (this.videos.length >= this.capacity) return;
            this.videos.push(video);
            updateStackDisplay();
            updateStackInfo();
        }
        pop() {
            if (this.videos.length === 0) return null;
            const v = this.videos.pop();
            updateStackDisplay();
            updateStackInfo();
            return v;
        }
        peek() {
            return this.videos.length === 0
                ? null
                : this.videos[this.videos.length - 1];
        }
        size() {
            return this.videos.length;
        }
    }

    const stack = new VideoStack();

    const stackItems = document.getElementById('stackItems');
    const stackSize = document.getElementById('stackSize');
    const topElement = document.getElementById('topElement');

    function playVideo(id) {
        player.loadVideoById(id);
    }

    function updateStackDisplay() {
        stackItems.innerHTML = "";
        if (stack.size() === 0) {
            stackItems.innerHTML = "<p style='color:#d4af37'>Stack is empty</p>";
            return;
        }

        for (let i = stack.videos.length - 1; i >= 0; i--) {
            const v = stack.videos[i];
            const item = document.createElement("div");
            item.className = "stack-item";
            item.innerHTML = `
                <span class="video-icon">▶️</span>
                <span class="video-title">${v.title}</span>
            `;
            stackItems.appendChild(item);
        }
    }

    function updateStackInfo() {
        stackSize.textContent = stack.size();
        const top = stack.peek();
        topElement.textContent = top ? top.title : "None";
    }

    document.getElementById('pushBtn').onclick = () => {
        const v = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
        stack.push(v);
        playVideo(v.id);
    };

    document.getElementById('popBtn').onclick = () => {
        stack.pop();
        const top = stack.peek();
        if (top) playVideo(top.id);
        else player.stopVideo();
    };

    document.getElementById('traverseBtn').onclick = () => {
        const top = stack.peek();
        if (top) playVideo(top.id);
    };

    document.getElementById('playBtn').onclick = () => {
        const top = stack.peek();
        if (top) playVideo(top.id);
    };

    document.getElementById('pauseBtn').onclick = () => {
        player.pauseVideo();
    };

    const first = sampleVideos[0];
    stack.push(first);
    playVideo(first.id);

    updateAuthUI();
});
