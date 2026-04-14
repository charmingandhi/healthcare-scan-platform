import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  predict(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post('http://127.0.0.1:5000/predict', formData);
  }
}
