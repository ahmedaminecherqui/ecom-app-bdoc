import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = '/api/chatbot/chat';
    private chatId: string;

    constructor(private http: HttpClient) {
        // Generate a simple unique ID for this session's conversation
        this.chatId = sessionStorage.getItem('chatbot_id') || this.generateId();
        sessionStorage.setItem('chatbot_id', this.chatId);
    }

    private generateId(): string {
        return 'user-' + Math.random().toString(36).substr(2, 9);
    }

    sendMessage(query: string): Observable<{ response: string }> {
        return this.http.post<{ response: string }>(this.apiUrl, {
            query: query,
            chatId: this.chatId
        });
    }
}
