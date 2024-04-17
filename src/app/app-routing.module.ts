import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactFormComponent } from './contact-form/contact-form.component';

export const routes: Routes = [
  { path: 'contact-list', component: ContactListComponent },
  { path: 'contact-form', component: ContactFormComponent },
  { path: '', redirectTo: '/contact-list', pathMatch: 'full' },
  { path: '**', redirectTo: '/contact-list' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
