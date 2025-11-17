import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'profile';

  // Profile settings
  profileForm = {
    name: '',
    email: ''
  };

  // Password change
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Notification settings
  notificationSettings = {
    emailNotifications: true,
    whatsappNotifications: true,
    newQuotations: true,
    statusChanges: true
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.name = user.name;
        this.profileForm.email = user.email;
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  updateProfile() {
    console.log('Atualizando perfil:', this.profileForm);
    // TODO: Implementar chamada à API
    alert('Perfil atualizado com sucesso!');
  }

  changePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('As senhas não conferem!');
      return;
    }
    console.log('Alterando senha');
    // TODO: Implementar chamada à API
    alert('Senha alterada com sucesso!');
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  saveNotificationSettings() {
    console.log('Salvando configurações de notificação:', this.notificationSettings);
    // TODO: Implementar chamada à API
    alert('Configurações salvas com sucesso!');
  }
}
