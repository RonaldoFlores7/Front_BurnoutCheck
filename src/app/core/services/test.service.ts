// src/app/core/services/test.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Test,
  TestCreateRequest,
  TestDetail,
  TestResponseSubmit,
  TestResponseBatch,
  TestResult
} from '../models/test.interface';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.api}/tests`;

  currentTest = signal<Test | null>(null);

  startTest(data: TestCreateRequest): Observable<Test> {
    return this.http.post<Test>(`${this.apiUrl}/start`, data).pipe(
      tap(test => {
        this.currentTest.set(test);
      })
    );
  }

  submitResponse(testId: number, response: TestResponseSubmit): Observable<{ message: string; response_id: number; total_responses: number; remaining: number }> {
    return this.http.post<any>(`${this.apiUrl}/${testId}/responses`, response);
  }

  submitResponsesBatch(testId: number, data: TestResponseBatch): Observable<{ message: string; total_responses: number }> {
    return this.http.post<any>(`${this.apiUrl}/${testId}/responses/batch`, data);
  }

  completeTest(testId: number): Observable<TestResult> {
    console.log('Completing test:', testId);
    return this.http.post<TestResult>(`${this.apiUrl}/${testId}/complete`, {}).pipe(
      tap(() => {
        this.currentTest.set(null);
      })
    );
  }

  getMyTests(): Observable<Test[]> {
    return this.http.get<Test[]>(`${this.apiUrl}/me`);
  }

  getTestDetail(testId: number): Observable<TestDetail> {
    return this.http.get<TestDetail>(`${this.apiUrl}/${testId}`);
  }

  getTestResult(testId: number): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.apiUrl}/${testId}/result`);
  }

  deleteTest(testId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${testId}`);
  }
}
