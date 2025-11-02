import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient) {}

  sendMessage(message: string, userId:string) {
    return this.http.post<any>('http://localhost:3000/chat', { message, userId });
  }
  getIntroductionMessage(): string {
    return "Hello! I'm Gaia, your eco sidekick here to help you reduce your carbon footprint and achieve your sustainability goals. How can I assist you today?";
  }
}
