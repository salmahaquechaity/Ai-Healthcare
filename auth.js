// Authentication functions for the Medical History Management System

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Logout function
function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userEmail');
  window.location.href = 'login.html';
}

// Auto-check authentication when script loads
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
});