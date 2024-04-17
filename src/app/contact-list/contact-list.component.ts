import { Component, OnInit } from '@angular/core';
import { ContactService } from '../services/contact.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.less']
})
export class ContactListComponent implements OnInit {
  contacts: any[] = [];
  constructor(private contactService: ContactService, private router: Router) { }
  ngOnInit(): void {
    this.contactService.contactAdded.subscribe(() => {
      this.refreshPage();
    });

    this.contactService.initializeLocalStorage().subscribe(() => {
      console.log('Local storage initialized successfully.');
      const storedContacts = this.contactService.getContactsFromLocalStorage();
      console.log('Contacts from local storage:', storedContacts);
      if (Array.isArray(storedContacts)) {
        this.contacts = storedContacts;
      } else {
        console.error('Contacts data from local storage is not an array.');
      }
    });
  }
  refreshPage(): void {
    window.location.reload();
  }

  editContact(contact: any): void {
    this.router.navigate(['/contact-form'], { state: { contact } });
  }

  onDelete(contact: any) {
    this.deleteContact(contact);
  }

  deleteContact(contact: any) {
    const currentContacts = this.contactService.getContactsFromLocalStorage();
    const updatedContacts = currentContacts.filter((c: any) => c._id !== contact._id);
    this.contactService.setContacts(updatedContacts);
    this.contactService.deleteContact(contact._id).subscribe(
      () => {
        console.log('Contact deleted successfully from server.');
        window.location.reload();
      },
      (error) => {
        console.error('Error deleting contact from server:', error);
      }
    );
  }

}
