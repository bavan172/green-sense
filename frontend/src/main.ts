import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthGuard } from './app/auth.guard';
import { LoginGuard } from './app/login.guard';
import { AuthInterceptor } from './app/core/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    LoginGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
}).catch(err => console.error(err));