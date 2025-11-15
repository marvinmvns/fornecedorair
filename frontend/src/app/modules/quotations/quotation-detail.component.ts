import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
  styles: [`
    .quote-card {
      cursor: pointer;
      transition: all 0.3s;
    }
    .quote-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .quote-card.selected {
      border: 2px solid #4361ee;
      background-color: #f0f4ff;
    }
    .chat-message {
      padding: 0.8rem;
      margin-bottom: 0.5rem;
      border-radius: 8px;
    }
    .chat-message.inbound {
      background-color: #e9ecef;
      text-align: left;
    }
    .chat-message.outbound {
      background-color: #4361ee;
      color: white;
      text-align: right;
    }
  `]
})
export class QuotationDetailComponent implements OnInit {
  quotation: any = null;
  suppliers: any[] = [];
  selectedSuppliers: Set<string> = new Set();
  supplierQuotes: any[] = [];
  selectedQuote: any = null;
  marginPercent = 15;
  proposalMessage = '';
  chatHistory: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadQuotation(id);
    this.loadSuppliers();
    this.loadSupplierQuotes(id);
    this.loadChatHistory(id);
  }

  loadQuotation(id: string) {
    this.api.getQuotation(id).subscribe(data => {
      this.quotation = data;
    });
  }

  loadSuppliers() {
    this.api.getSuppliers().subscribe(data => {
      this.suppliers = data;
    });
  }

  loadSupplierQuotes(id: string) {
    this.api.getSupplierQuotes(id).subscribe(data => {
      this.supplierQuotes = data;
    });
  }

  loadChatHistory(id: string) {
    this.api.getChatHistory(id).subscribe(data => {
      this.chatHistory = data;
    });
  }

  toggleSupplier(supplierId: string) {
    if (this.selectedSuppliers.has(supplierId)) {
      this.selectedSuppliers.delete(supplierId);
    } else {
      this.selectedSuppliers.add(supplierId);
    }
  }

  dispatchSuppliers() {
    if (this.selectedSuppliers.size === 0) {
      alert('Selecione ao menos um fornecedor');
      return;
    }

    const supplierIds = Array.from(this.selectedSuppliers);
    this.api.dispatchSuppliers(this.quotation.id, supplierIds).subscribe(() => {
      alert('Cotações disparadas com sucesso!');
      setTimeout(() => this.loadSupplierQuotes(this.quotation.id), 3000);
    });
  }

  selectQuote(quote: any) {
    this.selectedQuote = quote;
    this.generateProposalMessage();
  }

  generateProposalMessage() {
    if (!this.selectedQuote || !this.quotation) return;

    const product = this.quotation.items?.[0]?.airConditionerModel;
    const finalPrice = this.calculateFinalPrice();

    this.proposalMessage = `Olá ${this.quotation.installer.name}! 👋

Tenho uma excelente proposta para você:

🔹 *${product?.brand} ${product?.modelName}*
🔹 Capacidade: *${product?.btuCapacity} BTU*
🔹 Tipo: *${product?.type}*
🔹 Classe energética: *${product?.energyEfficiencyClass}*

💰 *Preço: R$ ${finalPrice.toFixed(2)}*
🚚 *Prazo de entrega: ${this.selectedQuote.leadTimeDays} dias úteis*
🛡️ *Garantia: ${this.selectedQuote.warrantyMonths} meses*
💳 *Condições: ${this.selectedQuote.paymentConditions}*

Esta é uma excelente opção que atende suas necessidades perfeitamente!

Gostaria de prosseguir com esta proposta?`;
  }

  calculateFinalPrice(): number {
    if (!this.selectedQuote) return 0;
    const base = this.selectedQuote.totalPrice || 0;
    return base + (base * this.marginPercent / 100);
  }

  calculateMarginValue(): number {
    if (!this.selectedQuote) return 0;
    const base = this.selectedQuote.totalPrice || 0;
    return base * this.marginPercent / 100;
  }

  createAndSendOrder() {
    if (!this.selectedQuote) {
      alert('Selecione uma cotação primeiro');
      return;
    }

    if (!this.proposalMessage.trim()) {
      alert('A mensagem da proposta não pode estar vazia');
      return;
    }

    const orderData = {
      quotationRequestId: this.quotation.id,
      selectedSupplierQuoteId: this.selectedQuote.id,
      marginPercent: this.marginPercent,
      customMessage: this.proposalMessage
    };

    this.api.createOrder(orderData).subscribe(order => {
      this.api.sendOrderToInstaller(order.id).subscribe(() => {
        alert('Proposta enviada com sucesso via WhatsApp!');
        this.loadQuotation(this.quotation.id);
      });
    });
  }
}
