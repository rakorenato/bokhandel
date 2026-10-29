import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="card mx-auto" style="max-width: 32rem">
      <div class="card-body empty-state">
        <span class="empty-icon"><i class="fa-solid fa-book-skull"></i></span>
        <h1 class="h3">Sidan finns inte</h1>
        <p class="text-body-secondary mb-4">Den här sidan verkar ha lånats ut och aldrig kommit tillbaka.</p>
        <a routerLink="/" class="btn btn-primary">
          <i class="fa-solid fa-house me-2"></i>Till startsidan
        </a>
      </div>
    </div>
  `,
})
export class NotFound {}
