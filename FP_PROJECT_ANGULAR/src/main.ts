import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule, Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import 'zone.js';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{title}}</h1>
    <nav>
      <a routerLink="/dashboard">Dashboard</a>
      <a routerLink="/search">Search</a>
      <a routerLink="/history">History</a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title = 'GitHub User Search';
}

@Component({
  selector: 'app-dashboard',
  template: `<h2>Dashboard</h2>`,
})
export class DashboardComponent {}

@Component({
  selector: 'app-search',
  template: `
    <h2>Search</h2>
    <input [(ngModel)]="searchTerm" (keyup.enter)="search()">
    <button (click)="search()">Search</button>
    <div *ngIf="searchResults.length > 0; else emptyArrayBlock">
      <div class="user-card" *ngFor="let user of searchResults">
        <div><img class="user-img" [src]="user.avatar_url"></div>
        <div class="user-details-section">
        <p>{{user.login}}</p>
        <button (click)="viewProfile(user)">View Profile</button>
        </div>
      </div>
    </div>
    <ng-template #emptyArrayBlock>
      <div class="user-card" >
          Empty Search Results
       </div>
    </ng-template>
  `,
})
export class SearchComponent {
  searchTerm: string;
  searchResults: any[];

  constructor(private http: HttpClient) {
    (this.searchTerm = ''), (this.searchResults = []);
  }

  search() {
    this.http
      .get(`https://api.github.com/search/users?q=${this.searchTerm}`)
      .subscribe((data: any) => {
        this.searchResults = data.items;

        let hdata = localStorage.getItem('historyData');

        const historyData = hdata ? JSON.parse(hdata) : [];

        historyData.push({
          searchTerm: this.searchTerm,
          searchResults: this.searchResults,
        });

        if (historyData.length > 5) {
          historyData.shift();
        }

        localStorage.setItem('historyData', JSON.stringify(historyData));
      });
  }

  viewProfile(user: any) {
    // Navigate to user profile page
    window.open(user.html_url, '_blank');
  }
}

@Component({
  selector: 'app-history',
  template: `<h2>History</h2>
  <div *ngIf="historyData.length > 0; else emptyHistoryBlock">
  <div *ngFor="let history of historyData">
  <h1>{{history.searchTerm}}</h1>
  <div *ngIf="history.searchResults.length > 0; else emptyArrayBlock">
    <div class="user-card" *ngFor="let user of history.searchResults">
      <div><img class="user-img" [src]="user.avatar_url"></div>
      <div class="user-details-section">
      <p>{{user.login}}</p>
      <button (click)="viewProfile(user)">View Profile</button>
      </div>
    </div>
</div>
<ng-template #emptyArrayBlock>
  <div class="user-card" >
    No Results found      
  </div>
</ng-template>
  </div>
</div>
<ng-template #emptyHistoryBlock>
  <div class="user-card" >
    No Search History       
  </div>
</ng-template>`,
})
export class HistoryComponent {
  historyData: any;

  constructor() {
    let hdata = localStorage.getItem('historyData');
    this.historyData = hdata ? JSON.parse(hdata) : [];
  }

  viewProfile(user: any) {
    // Navigate to user profile page
    window.open(user.html_url, '_blank');
  }
}

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'search', component: SearchComponent },
  { path: 'history', component: HistoryComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SearchComponent,
    HistoryComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
