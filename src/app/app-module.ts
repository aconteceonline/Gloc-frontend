import { NgModule, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Login } from './login/login';
import { authInterceptor } from './auth-interceptor';
import { MatDialogModule } from '@angular/material/dialog';




@NgModule({
  declarations: [
    App,
    Login,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,




  ],
  providers: [

      {
      provide: LOCALE_ID,
      useValue: 'pt-BR',

    },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideHttpClient(withInterceptors([authInterceptor])),

  ],
  bootstrap: [App]
})
export class AppModule { }
