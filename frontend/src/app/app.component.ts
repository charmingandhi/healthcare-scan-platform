import { Component, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { UploadComponent } from './components/upload/upload.component';
import { AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, UploadComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

  // 🔐 AUTH
  isLoggedIn = false;
  role: string = '';

  // 📊 UI STATE
  activeTab: string = 'dashboard';

  // 🌗 THEME
  darkMode: boolean = true;

  constructor(private renderer: Renderer2) {}

  // ================= INIT =================
  ngOnInit() {
    // 🔥 Load theme from storage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      this.darkMode = false;
    }

    this.applyTheme();

    // 🔥 Restore user (optional)
    const savedUser = localStorage.getItem('userRole');
    if (savedUser) {
      this.role = savedUser;
      this.isLoggedIn = true;
    }
  }
  ngAfterViewInit() {
  setTimeout(() => {
    this.loadCharts();
  }, 300);
}

loadCharts() {
  setTimeout(() => {

    const doughnut = document.getElementById('doughnutChart') as HTMLCanvasElement;
    const line = document.getElementById('lineChart') as HTMLCanvasElement;
    const bar = document.getElementById('barChart') as HTMLCanvasElement;

    if (doughnut) {
      new Chart(doughnut, {
        type: 'doughnut',
        data: {
          labels: ['Normal', 'Disease'],
          datasets: [{ data: [65, 35] }]
        }
      });
    }

    if (line) {
      new Chart(line, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr'],
          datasets: [{ label: 'Scans', data: [10, 30, 50, 40] }]
        }
      });
    }

    if (bar) {
      new Chart(bar, {
        type: 'bar',
        data: {
          labels: ['SVM', 'VGG16', 'MobileNetV2'],
          datasets: [{ label: 'Accuracy %', data: [75, 88, 93] }]
        }
      });
    }

  }, 500);
}
  // ================= LOGIN =================
  onLogin(role: string) {
    this.role = role;
    this.isLoggedIn = true;

    // 💾 Save user session
    localStorage.setItem('userRole', role);
  }

  logout() {
    this.isLoggedIn = false;
    this.role = '';
    localStorage.removeItem('userRole');
  }

  // ================= NAV =================
  setTab(tab: string) {
    this.activeTab = tab;
  }

  // ================= THEME =================
  toggleTheme() {
    this.darkMode = !this.darkMode;

    // 💾 Save preference
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');

    this.applyTheme();
  }

  applyTheme() {
  const body = document.body;

  // REMOVE BOTH
  body.classList.remove('dark-theme', 'light-theme');

  // APPLY CORRECT CLASS
  if (this.darkMode) {
    body.classList.add('dark-theme');
  } else {
    body.classList.add('light-theme');
  }
}

  // ================= HISTORY =================
  getHistory() {
    const data = localStorage.getItem('scanHistory');
    return data ? JSON.parse(data) : [];
  }

  deleteHistory(index: number) {
    const history = this.getHistory();
    history.splice(index, 1);
    localStorage.setItem('scanHistory', JSON.stringify(history));
  }

  clearHistory() {
    localStorage.removeItem('scanHistory');
  }

}
