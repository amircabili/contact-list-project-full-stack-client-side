import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ContactService } from "../services/contact.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.less']
})
export class ContactFormComponent implements OnInit {
  contactForm!: FormGroup;
  formFields: any[] = [];
  loadingFormFields = true;
  contactData: any;
  randomID: any;
  noDeleteButton: boolean | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Initializing form...');
    this.initializeForm();
    console.log('Form initialized.');
    const contactData = history.state.contact;
    if (contactData) {
      console.log('Contact data found:', contactData);
      console.log('Patching form value...');
      this.contactForm.patchValue(contactData);
      console.log('Form patched with contact data.');
      this.contactData = contactData;
      this.noDeleteButton = false;
    } else {
      console.log('No contact data found.');
      this.noDeleteButton = true;
    }

    this.contactService.getFormFields().subscribe(
      (data: any) => {
        this.formFields = data.form_fields;
      },
      (error: any) => {
        console.error('Error loading form fields:', error);
      },
      () => {
        this.loadingFormFields = false;
      }
    );

    this.contactService.contactsUpdated.subscribe((addedContact: any) => {
      this.contactData = addedContact;
      history.state.contact = addedContact;
    });
  }

  private initializeForm(): void {
    this.contactForm = this.formBuilder.group({
      full_name: ['', Validators.required],
      full_address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{3}\d{7}$/)]],
      cell: ['', [Validators.required, Validators.pattern(/^\d{3}\d{7}$/)]],
      registration_date: ['', Validators.required],
      age: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const contactData = history.state.contact;
      if (contactData) {
        const updatedContact = this.contactForm.value;
        this.contactService.updateContact(contactData._id, updatedContact).subscribe(response => {
          console.log('Response from updateContact:', response);
        });
      } else {
        const newContact = this.contactForm.value;
        this.contactService.addContact(newContact).subscribe(response => {
          console.log('Response from addContact:', response);
        });
      }
      this.contactForm.reset(); // Reset the form after submitting
      this.router.navigate(['/contacts']);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  onDelete() {
    const contactData = history.state.contact;
    if (contactData) {
      this.contactService.deleteContact(contactData._id).subscribe(() => {
        this.router.navigate(['/contacts']);
      });
    } else {
      console.error('No contact data found to delete.');
    }
  }
}
