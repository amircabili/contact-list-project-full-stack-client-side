import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject, forkJoin } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Contact } from '../interfaces/contact.interface';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/contacts/contacts';
  private localStorageKey = 'contacts';
  private formFieldsUrl = 'assets/contact_form.json';
  contactAdded: Subject<void> = new Subject<void>();
  contactsUpdated: Subject<void> = new Subject<void>();
  constructor(private http: HttpClient) {}

  getContacts(): Observable<null> | Observable<Contact[]> {
    const storedContacts = localStorage.getItem(this.localStorageKey);
    return storedContacts ? of(JSON.parse(storedContacts)) : of([]);
  }

  setContacts(contacts: Contact[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(contacts));
    this.contactsUpdated.next();
  }

  addContact(newContact: Contact): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.apiUrl}/add`, newContact, { headers }).pipe(
      catchError(error => {
        console.error('Error adding contact:', error);
        return of(null);
      }),
      switchMap((response: any) => {
        if (response && response._id) {
          newContact._id = response._id;
          this.updateLocalStorageWithId(newContact);

          this.contactAdded.next();
        }
        return of(response);
      }),
      tap(() => {
        console.log('Contact added to the database:', newContact);
      })
    );
  }

  private updateLocalStorageWithId(newContact: Contact): void {
    const storedContacts = this.getContactsFromLocalStorage();
    storedContacts.push(newContact);
    localStorage.setItem(this.localStorageKey, JSON.stringify(storedContacts));
  }

  getFormFields(): Observable<any> {
    return this.http.get<any>(this.formFieldsUrl);
  }

  initializeLocalStorage(): Observable<any> {
    const storedContacts = this.getContactsFromLocalStorage();
    const localStorageEmpty = storedContacts.length === 0;

    if (!localStorageEmpty) {
      console.log('Local storage already initialized with data.');
      return of(null);
    }
    console.log('Local storage is empty. Initializing with data from the server.');

    this.clearContactsCollection().subscribe({
      next: () => {
        console.log('Contacts collection cleared from the database.');
      },
      error: (error) => {
        console.error('Error clearing contacts collection from the database:', error);
      }
    });

    return this.getRandomContacts().pipe(
      switchMap((randomContacts: Contact[]) => {
        if (randomContacts.length > 0) {
          console.log('Random contacts received:', randomContacts);
          const uniqueContacts = this.getUniqueContacts(randomContacts);
          console.log('Unique contacts:', uniqueContacts);
          this.addRandomContactsToDb(uniqueContacts);
          return of(null);
        } else {
          console.error('Random contacts data is empty.');
          return of(null);
        }
      })
    );
  }

  private clearContactsCollection(): Observable<any> {

    return this.http.delete<any>(`${this.apiUrl}/clear`);
  }

  private getUniqueContacts(contacts: Contact[]): Contact[] {
    const uniqueContactsMap = new Map<string, Contact>();
    contacts.forEach(contact => {
      uniqueContactsMap.set(contact.full_name, contact);
    });
    return Array.from(uniqueContactsMap.values());
  }

  getContactsFromLocalStorage(): Contact[] {
    const storedContacts = localStorage.getItem(this.localStorageKey);
    return storedContacts ? JSON.parse(storedContacts) : [];
  }

  deleteContact(id: string): Observable<any> {
    if (!id) {
      console.error('Invalid contact id:', id);
      return of(null);
    }

    const deleteRequest = this.http.delete<any>(`${this.apiUrl}/delete/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting contact with id ${id} from the server:`, error);
        return of(null);
      })
    );
    const currentContacts = this.getContactsFromLocalStorage();
    const updatedContacts = currentContacts.filter(contact => contact._id !== id);
    this.setContacts(updatedContacts);
    return deleteRequest;
  }


  updateContact(id: string, updatedContactData: any): Observable<any> {
    const currentContacts = this.getContactsFromLocalStorage();
    const index = currentContacts.findIndex(contact => contact._id === id);
    if (index !== -1) {
      currentContacts[index] = { ...currentContacts[index], ...updatedContactData };
      this.setContacts(currentContacts);
    }

    const url = `${this.apiUrl}/update/${id}`;
    return this.http.put<any>(url, updatedContactData).pipe(
      catchError(error => {
        console.error(`Error updating contact with id ${id}:`, error);
        return of(null);
      })
    );
  }

  private getContactCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/count`).pipe(
      catchError(error => {
        console.error('Error getting contact count:', error);
        return of(0);
      }),
      switchMap((data: any) => {
        return of(data.count || 0);
      })
    );
  }

  private getRandomContacts(): Observable<Contact[]> {
    const randomApiUrl = 'https://randomapi.com/api/dede7f913fa2b4f23683cd0f3ff82cd1?results=10&inc=full_name,full_address,phone,cell,date,age,image';

    return this.http.get<any>(randomApiUrl).pipe(
      catchError(error => {
        console.error('Error fetching random contacts:', error);
        return of([]);
      }),
      switchMap((data: any) => {
        const results = data?.results || [];
        const contacts: Contact[] = results.map((result: any) => {
          return {
            full_name: result.full_name,
            full_address: result.full_address,
            phone: result.phone,
            cell: result.cell,
            registration_date: result.registration_date,
            age: result.age,
            image: result.image
          };
        });
        return of(contacts);
      })
    );
  }

  private addRandomContactsToDb(contacts: Contact[]): void {
    const addRequests: Observable<any>[] = [];
    const uniqueContacts: Contact[] = [];

    contacts.forEach(contact => {
      const addRequest = this.addContact(contact).pipe(
        tap((response: any) => {
          if (response && response._id) {
            contact._id = response._id;
            uniqueContacts.push(contact);
          }
        })
      );
      addRequests.push(addRequest);
    });
    forkJoin(addRequests).subscribe({
      next: () => {
        console.log('All random contacts added to the database.');
        this.setLocalStorageWithId(uniqueContacts);
      },
      error: (error) => {
        console.error('Error adding random contacts to the database:', error);
      }
    });
  }

  private setLocalStorageWithId(contacts: Contact[]): void {
    const storedContacts = this.getContactsFromLocalStorage();
    contacts.forEach(contact => {
      const existingContactIndex = storedContacts.findIndex(c => c.full_name === contact.full_name);
      if (existingContactIndex !== -1) {
        storedContacts[existingContactIndex]._id = contact._id;
      } else {

        storedContacts.push(contact);
      }
    });

    localStorage.setItem(this.localStorageKey, JSON.stringify(storedContacts));
  }

}
