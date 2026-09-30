import { Order, RestaurantSettings } from '../types/pos';

export class PrintService {
  /**
   * Generates formatted HTML for 80mm thermal paper and triggers instant print
   */
  public static printReceipt(order: Order, settings: RestaurantSettings) {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      // Fallback if popup blocked: use hidden iframe
      this.printViaIframe(order, settings);
      return;
    }

    const html = this.getReceiptHtml(order, settings);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 500);
    };
  }

  /**
   * Hidden iframe printer for smoother touch-screen POS without opening popups
   */
  public static printViaIframe(order: Order, settings: RestaurantSettings) {
    let iframe = document.getElementById('pos-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'pos-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(this.getReceiptHtml(order, settings));
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    }
  }

  /**
   * Receipt HTML template styled precisely for 80mm thermal paper
   */
  public static getReceiptHtml(order: Order, settings: RestaurantSettings): string {
    const dateObj = new Date(order.createdAt);
    const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeFormatted = dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const paymentLabel = order.paymentMethod === 'card' 
      ? 'CARTE BANCAIRE' 
      : (order.paymentMethod === 'other' ? 'AUTRE / VIREMENT' : 'ESPÈCES');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Ticket #${order.orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 8px 4px 20px 4px;
            color: #000;
            background: #fff;
            font-size: 13px;
            line-height: 1.25;
            -webkit-print-color-adjust: exact;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .bold { font-weight: bold; }
          .title { font-size: 18px; font-weight: 900; letter-spacing: 0.5px; }
          .subtitle { font-size: 12px; margin-top: 2px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .double-divider { border-top: 2px solid #000; margin: 8px 0; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 4px; }
          th { border-bottom: 1px dashed #000; padding: 4px 0; font-size: 12px; }
          td { padding: 4px 0; font-size: 12px; vertical-align: top; }
          .total-row { font-size: 16px; font-weight: 900; padding: 4px 0; }
          .footer { font-size: 11px; margin-top: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="title">${settings.name}</div>
          <div class="subtitle">${settings.tagline}</div>
          <div style="font-size: 11px; margin-top: 4px;">${settings.address}</div>
          <div style="font-size: 11px;">Tél: ${settings.phone}</div>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span>Date: <b>${dateFormatted}</b></span>
          <span>Heure: <b>${timeFormatted}</b></span>
        </div>
        <div class="info-row">
          <span>Ticket: <b>#${order.orderNumber}</b></span>
          <span>Table: <b>${order.tableName || (order.type === 'takeaway' ? 'À Emporter' : 'Comptoir')}</b></span>
        </div>
        ${order.cashierName ? `<div class="info-row"><span>Caissier: <b>${order.cashierName}</b></span></div>` : ''}

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th class="text-left" style="width: 50%;">Produit</th>
              <th class="text-center" style="width: 20%;">Qté</th>
              <th class="text-right" style="width: 30%;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td class="text-left">
                  <b>${item.productName}</b>
                  ${item.note ? `<br><small style="font-size:10px;">* ${item.note}</small>` : ''}
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${item.price * item.quantity} ${settings.currency}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="info-row">
          <span>Sous-total:</span>
          <span>${order.subtotal} ${settings.currency}</span>
        </div>
        ${order.discountAmount > 0 ? `
          <div class="info-row" style="color: #000;">
            <span>Remise:</span>
            <span>-${order.discountAmount} ${settings.currency}</span>
          </div>
        ` : ''}
        ${order.serviceCharge > 0 ? `
          <div class="info-row">
            <span>Frais de service:</span>
            <span>+${order.serviceCharge} ${settings.currency}</span>
          </div>
        ` : ''}
        ${order.tax > 0 ? `
          <div class="info-row">
            <span>TVA:</span>
            <span>+${order.tax} ${settings.currency}</span>
          </div>
        ` : ''}

        <div class="double-divider"></div>

        <div class="info-row total-row">
          <span>TOTAL:</span>
          <span>${order.total} ${settings.currency}</span>
        </div>

        <div class="divider"></div>

        <div class="info-row">
          <span>Mode de règlement:</span>
          <b>${paymentLabel}</b>
        </div>
        ${order.amountReceived ? `
          <div class="info-row">
            <span>Reçu:</span>
            <span>${order.amountReceived} ${settings.currency}</span>
          </div>
          <div class="info-row">
            <span>Monnaie rendue:</span>
            <b>${order.change || 0} ${settings.currency}</b>
          </div>
        ` : ''}

        <div class="footer">
          <div class="bold">Merci et à bientôt !</div>
          <div>Logiciel GRINE RESTAURANT POS Windows</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * KOT (Kitchen Order Ticket) for kitchen printer
   */
  public static printKitchenTicket(order: Order, settings: RestaurantSettings) {
    const printWindow = window.open('', '_blank', 'width=350,height=500');
    if (!printWindow) return;

    const timeFormatted = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BON CUISINE #${order.orderNumber}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            font-family: 'Courier New', monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 8px 4px;
            font-size: 14px;
          }
          .title { font-size: 20px; font-weight: 900; text-align: center; }
          .table-header { font-size: 22px; font-weight: 900; text-align: center; margin: 8px 0; border: 2px dashed #000; padding: 4px; }
          .item-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin: 6px 0; }
          .note { font-size: 12px; font-style: italic; margin-left: 10px; }
          .divider { border-top: 2px solid #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="title">*** BON CUISINE ***</div>
        <div class="table-header">${order.tableName ? `TABLE: ${order.tableName}` : 'À EMPORTER'}</div>
        <div>Ticket: <b>#${order.orderNumber}</b> | Heure: <b>${timeFormatted}</b></div>
        <div class="divider"></div>
        ${order.items.map(item => `
          <div class="item-row">
            <span>[ ${item.quantity} x ] ${item.productName}</span>
          </div>
          ${item.note ? `<div class="note">=> ${item.note}</div>` : ''}
        `).join('')}
        ${order.note ? `<div class="divider"></div><div style="font-weight:bold;">NOTE COMMANDE: ${order.note}</div>` : ''}
        <div class="divider"></div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    };
  }
}
