import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // ================= UI =================
  isSignup = false;

  // 🌗 THEME
  darkMode: boolean = true;

  // ================= LOGIN =================
  loginEmail = '';
  loginPassword = '';
  loginRole = 'patient';

  // ================= SIGNUP =================
  signupEmail = '';
  signupPassword = '';
  confirmPassword = '';
  signupRole = 'patient';

  // ================= ERRORS =================
  loginError: any = {};
  signupError: any = {};

  @Output() loginSuccess = new EventEmitter<string>();

  // ================= INIT =================
  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      this.darkMode = false;
    }

    this.applyTheme();
  }

  // ================= THEME =================
  toggleTheme() {
    this.darkMode = !this.darkMode;

    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');

    this.applyTheme();
  }

  applyTheme() {
    const body = document.body;

    // REMOVE BOTH FIRST
    body.classList.remove('dark-theme', 'light-theme');

    // APPLY ONE
    if (this.darkMode) {
      body.classList.add('dark-theme');
    } else {
      body.classList.add('light-theme');
    }
  }

  // ================= MODE SWITCH =================
  toggleMode() {
    this.isSignup = !this.isSignup;
    this.clearErrors();
  }

  clearErrors() {
    this.loginError = {};
    this.signupError = {};
  }

  // ================= LOGIN =================
  login() {
    this.clearErrors();

    if (!this.validateEmail(this.loginEmail)) {
      this.loginError.email = 'Invalid email format';
    }

    if (!this.loginPassword) {
      this.loginError.password = 'Password required';
    }

    if (Object.keys(this.loginError).length > 0) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const user = users.find(
      (u: any) =>
        u.email === this.loginEmail &&
        u.password === this.loginPassword &&
        u.role === this.loginRole
    );

    if (!user) {
      alert('Invalid credentials ❌');
      return;
    }

    alert('Login successful ✅');
    this.loginSuccess.emit(this.loginRole);
  }

  // ================= SIGNUP =================
  signup() {
    this.clearErrors();

    if (!this.validateEmail(this.signupEmail)) {
      this.signupError.email = 'Enter valid email';
    }

    if (this.signupPassword.length < 6) {
      this.signupError.password = 'Min 6 characters';
    }

    if (this.signupPassword !== this.confirmPassword) {
      this.signupError.confirm = 'Passwords do not match';
    }

    if (Object.keys(this.signupError).length > 0) return;

    let users = JSON.parse(localStorage.getItem('users') || '[]');

    const exists = users.find((u: any) => u.email === this.signupEmail);

    if (exists) {
      alert('User already exists ⚠');
      return;
    }

    users.push({
      email: this.signupEmail,
      password: this.signupPassword,
      role: this.signupRole
    });

    localStorage.setItem('users', JSON.stringify(users));

    alert('Signup successful 🎉');
    this.toggleMode();
  }

  // ================= VALIDATION =================
  validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
