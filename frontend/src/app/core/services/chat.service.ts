import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface Conversation {
  id: string;
  contactName: string;
  contactNumber: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: string;
  quotationId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'contact' | 'agent' | 'system';
  senderName: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'document' | 'audio';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket!: Socket;
  private apiUrl = environment.apiUrl;
  private socketUrl = environment.apiUrl.replace('/api/v1', '');

  // Observables
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io(`${this.socketUrl}/chat`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('new_message', (message: Message) => {
      this.handleNewMessage(message);
    });

    this.socket.on('conversation_updated', (data: any) => {
      this.updateConversation(data);
    });

    this.socket.on('new_conversation', (conversation: Conversation) => {
      this.addConversation(conversation);
    });

    this.socket.on('message_status_update', (data: any) => {
      this.updateMessageStatus(data.messageId, data.status);
    });
  }

  // API Methods
  getConversations(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/conversations`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getMessages(conversationId: string, page: number = 1, limit: number = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/conversations/${conversationId}/messages`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  sendMessage(conversationId: string, message: string, type: string = 'text'): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/conversations/${conversationId}/messages`, {
      message,
      type
    });
  }

  markAsRead(conversationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/conversations/${conversationId}/mark-read`, {});
  }

  getChatStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/stats`);
  }

  // WebSocket Methods
  joinConversation(conversationId: string) {
    this.socket.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.socket.emit('leave_conversation', { conversationId });
  }

  // Local state management
  private handleNewMessage(message: Message) {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);

    // Update unread count if message is from contact
    if (message.sender === 'contact') {
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    }
  }

  private updateConversation(data: any) {
    const conversations = this.conversationsSubject.value;
    const index = conversations.findIndex(c => c.id === data.conversationId);

    if (index !== -1) {
      conversations[index].lastMessage = data.lastMessage.content;
      conversations[index].lastMessageTime = data.lastMessage.timestamp;
      if (data.lastMessage.sender === 'contact') {
        conversations[index].unreadCount++;
      }

      // Move to top
      const updated = conversations.splice(index, 1)[0];
      this.conversationsSubject.next([updated, ...conversations]);
    }
  }

  private addConversation(conversation: Conversation) {
    const conversations = this.conversationsSubject.value;
    this.conversationsSubject.next([conversation, ...conversations]);
  }

  private updateMessageStatus(messageId: string, status: string) {
    const messages = this.messagesSubject.value;
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.status = status as any;
      this.messagesSubject.next([...messages]);
    }
  }

  loadConversations() {
    this.getConversations().subscribe(response => {
      this.conversationsSubject.next(response.conversations);
      const unread = response.conversations.reduce((sum: number, c: Conversation) => sum + c.unreadCount, 0);
      this.unreadCountSubject.next(unread);
    });
  }

  loadMessages(conversationId: string) {
    this.getMessages(conversationId).subscribe(response => {
      this.messagesSubject.next(response.messages);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
