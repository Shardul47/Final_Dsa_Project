let player;
let currentUser = null;
const users = {}; // In-memory user storage

// Sample videos that are publicly embeddable
const sampleVideos = [
    { id : 'xuP4g7IDgDM', title: 'Beautiful Sunset' },
    { id : 'nqye02H_H6I', title: 'River video' },
    { id : '9iDXWx7GtZQ', title: 'Soothing nature' },
    { id : '-oOoTIuoL8M', title: 'Mountain'},
    { id : 'NSAOrGb9orM', title: 'Beautiful  Landscape' },


];

class VideoStack {
  constructor() {
    this.videos = [];
    this.capacity = 10;
    this.currentIndex = 0;
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
    return this.videos.length === 0 ? null : this.videos[this.videos.length - 1];
  }
  size() {
    return this.videos.length;
  }
  getCurrent() {
    if (this.videos.length === 0) return null;
    return this.videos[this.currentIndex % this.videos.length];
  }
  next() {
    if (this.videos.length === 0) return null;
    this.currentIndex = (this.currentIndex + 1) % this.videos.length;
    return this.getCurrent();
  }
}

const stack = new VideoStack();

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
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

let skipTimer = null;

function onPlayerReady(event) {
  if (stack.size() > 0) {
    playCurrentVideo();
  }
}

function onPlayerStateChange(event) {
  // When video starts playing, start 5 sec skip timer
  if (event.data == YT.PlayerState.PLAYING) {
    if (skipTimer) clearTimeout(skipTimer);
    skipTimer = setTimeout(() => {
      // Skip to next video after 5 seconds
      playNextVideo();
    }, 5000);
  } else {
    if (skipTimer) {
      clearTimeout(skipTimer);
      skipTimer = null;
    }
  }
}

function onPlayerError(event) {
  console.warn('Error in playback. Skipping video. Error code:', event.data);
  playNextVideo();
}

function playCurrentVideo() {
  const current = stack.getCurrent();
  if (!current) return;
  player.loadVideoById(current.id);
  updateStackInfo();
}

function playNextVideo() {
  const next = stack.next();
  if (!next) {
    player.stopVideo();
    return;
  }
  player.loadVideoById(next.id);
  updateStackInfo();
}

function updateStackDisplay() {
  const stackItems = document.getElementById('stackItems');
  stackItems.innerHTML = '';
  if (stack.size() === 0) {
    stackItems.innerHTML = '<p>Stack is empty</p>';
    return;
  }
  for (let i = stack.videos.length - 1; i >= 0; i--) {
    const v = stack.videos[i];
    const item = document.createElement('div');
    item.className = 'stack-item';
    item.textContent = v.title;
    stackItems.appendChild(item);
  }
}

function updateStackInfo() {
  const stackSize = document.getElementById('stackSize');
  const topElement = document.getElementById('topElement');
  stackSize.textContent = stack.size();
  const current = stack.getCurrent();
  topElement.textContent = current ? current.title : 'None';
}

document.addEventListener('DOMContentLoaded', () => {
  const loginModal = document.getElementById('loginModal');
  const signupModal = document.getElementById('signupModal');
  const authBtn = document.getElementById('authBtn');
  const loginClose = loginModal.querySelector('.close');
  const signupClose = signupModal.querySelector('.close');
  const switchToSignup = document.getElementById('switchToSignup');
  const switchToLogin = document.getElementById('switchToLogin');
  const loginForm = document.getElementById('authForm');
  const signupForm = document.getElementById('signupForm');
  const mainContent = document.getElementById('mainContent');

  function showLogin() {
    loginModal.style.display = 'block';
  }
  function showSignup() {
    signupModal.style.display = 'block';
  }
  function hideModals() {
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
  }

  authBtn.addEventListener('click', () => {
    if (!currentUser) {
      showLogin();
    }
  });
  loginClose.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });
  signupClose.addEventListener('click', () => {
    signupModal.style.display = 'none';
  });

  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    hideModals();
    showSignup();
  });
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    hideModals();
    showLogin();
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;
    if (users[username] && users[username] === password) {
      currentUser = username;
      updateAuthUI();
      hideModals();
      loginForm.reset();
      mainContent.style.display = 'grid';
      if (stack.size() > 0) playCurrentVideo();
    } else {
      alert('Invalid username or password!');
    }
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = signupForm.signupUsername.value;
    const password = signupForm.signupPassword.value;
    const confirmPassword = signupForm.confirmPassword.value;
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
    hideModals();
    signupForm.reset();
    mainContent.style.display = 'grid';

    // Add demo videos on signup
    sampleVideos.forEach((vid) => stack.push(vid));
    if (stack.size() > 0) playCurrentVideo();
  });

  function updateAuthUI() {
    if (currentUser) {
      authBtn.innerHTML = `Logged in as ${currentUser}`;
      authBtn.disabled = true;
    } else {
      authBtn.innerHTML = 'Login / Sign Up';
      authBtn.disabled = false;
      mainContent.style.display = 'none';
    }
  }

  // Buttons to manually control video playback and stack
  document.getElementById('playBtn').onclick = () => {
    const current = stack.getCurrent();
    if (current) player.playVideo();
  };
  document.getElementById('pauseBtn').onclick = () => {
    player.pauseVideo();
  };
  document.getElementById('pushBtn').onclick = () => {
    // Push a random video from sample list
    const v = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
    stack.push(v);
    playCurrentVideo();
  };
  document.getElementById('popBtn').onclick = () => {
    stack.pop();
    const current = stack.getCurrent();
    if (current) playCurrentVideo();
    else player.stopVideo();
  };
  document.getElementById('traverseBtn').onclick = () => {
    const current = stack.getCurrent();
    if (current) playCurrentVideo();
  };

  updateAuthUI();
});
