import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { Navbar } from './layout/navbar/navbar';
import { ToastContainer } from './shared/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Startar ThemeService direkt så att sparat tema används från början.
  private readonly theme = inject(ThemeService);

  protected readonly year = new Date().getFullYear();
}
