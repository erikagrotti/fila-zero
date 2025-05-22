import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obter token do localStorage diretamente para evitar dependência circular
  const token = localStorage.getItem('auth_token');
  
  // Clonar a requisição original
  let authReq = req.clone();
  
  // Não adicionar token para endpoints de autenticação
  if (!req.url.includes('/token') && !req.url.includes('/register') && token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }
  
  return next(authReq);
};