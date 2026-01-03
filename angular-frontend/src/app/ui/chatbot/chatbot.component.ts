import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface Message {
    text: string;
    isUser: boolean;
    timestamp: Date;
}

@Component({
    selector: 'app-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chatbot.component.html',
    styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
    public isOpen = false;
    public query = '';
    public messages: Message[] = [
        { text: 'Hello! How can I help you today?', isUser: false, timestamp: new Date() }
    ];
    public isLoading = false;

    constructor(private chatService: ChatService) { }

    toggleChat() {
        this.isOpen = !this.isOpen;
    }

    sendMessage() {
        if (!this.query.trim() || this.isLoading) return;

        const userMessage: Message = {
            text: this.query,
            isUser: true,
            timestamp: new Date()
        };

        this.messages.push(userMessage);
        const currentQuery = this.query;
        this.query = '';
        this.isLoading = true;

        this.chatService.sendMessage(currentQuery).subscribe({
            next: (res) => {
                this.messages.push({
                    text: res.response,
                    isUser: false,
                    timestamp: new Date()
                });
                this.isLoading = false;
                this.scrollToBottom();
            },
            error: (err) => {
                console.error('Chat error:', err);
                this.messages.push({
                    text: 'Sorry, I encountered an error. Please try again.',
                    isUser: false,
                    timestamp: new Date()
                });
                this.isLoading = false;
                this.scrollToBottom();
            }
        });
    }

    private scrollToBottom() {
        setTimeout(() => {
            const container = document.querySelector('.chat-messages');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }
}
