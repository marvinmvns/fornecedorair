import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService, Conversation, Message } from '../../core/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: Message[] = [];
  selectedConversation: Conversation | null = null;
  newMessage: string = '';
  searchTerm: string = '';

  stats = {
    totalConversations: 0,
    activeConversations: 0,
    unreadMessages: 0,
    averageResponseTime: 0
  };

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.loadStats();
    this.loadConversations();
    this.subscribeToUpdates();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.selectedConversation) {
      this.chatService.leaveConversation(this.selectedConversation.id);
    }
    this.chatService.disconnect();
  }

  loadStats() {
    this.chatService.getChatStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  loadConversations() {
    this.chatService.loadConversations();
  }

  subscribeToUpdates() {
    // Subscribe to conversations updates
    const convSub = this.chatService.conversations$.subscribe(conversations => {
      this.conversations = conversations;
      this.stats.totalConversations = conversations.length;
      this.stats.activeConversations = conversations.filter(c => c.status === 'active').length;
    });
    this.subscriptions.push(convSub);

    // Subscribe to messages updates
    const msgSub = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      this.shouldScrollToBottom = true;
    });
    this.subscriptions.push(msgSub);

    // Subscribe to unread count
    const unreadSub = this.chatService.unreadCount$.subscribe(count => {
      this.stats.unreadMessages = count;
    });
    this.subscriptions.push(unreadSub);
  }

  selectConversation(conversation: Conversation) {
    // Leave previous conversation
    if (this.selectedConversation) {
      this.chatService.leaveConversation(this.selectedConversation.id);
    }

    // Select new conversation
    this.selectedConversation = conversation;
    this.chatService.joinConversation(conversation.id);
    this.chatService.loadMessages(conversation.id);

    // Mark as read
    if (conversation.unreadCount > 0) {
      this.chatService.markAsRead(conversation.id).subscribe();
      conversation.unreadCount = 0;
    }

    this.shouldScrollToBottom = true;
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) {
      return;
    }

    const message = this.newMessage.trim();
    this.newMessage = '';

    this.chatService.sendMessage(this.selectedConversation.id, message).subscribe(
      response => {
        console.log('Message sent:', response);
      },
      error => {
        console.error('Error sending message:', error);
        // TODO: Show error notification
        this.newMessage = message; // Restore message on error
      }
    );
  }

  formatTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Agora';
    } else if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return messageDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  }

  formatMessageTime(date: Date): string {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
