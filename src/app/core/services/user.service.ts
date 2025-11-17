import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserDetail, UserUpdateRequest, ChangePasswordRequest } from '../models/user.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.api}/users`;

  getProfile(): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.authService.currentUser.set(user);
      })
    );
  }

  updateProfile(data: UserUpdateRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/me`, data).pipe(
      tap(user => {
        this.authService.currentUser.set(user);
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/me/change-password`, data);
  }
}
