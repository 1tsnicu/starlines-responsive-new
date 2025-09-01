import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  ArrowLeft,
  CreditCard,
  Package
} from 'lucide-react';

import type { CancellationResult } from '../types/cancellation';
import { formatRefundAmount } from '../lib/cancellation';

interface CancellationResultDisplayProps {
  result: CancellationResult;
  onClose?: () => void;
  onReturnHome?: () => void;
  className?: string;
}

export function CancellationResultDisplay({ 
  result, 
  onClose, 
  onReturnHome,
  className = "" 
}: CancellationResultDisplayProps) {
  
  const handleDownloadConfirmation = () => {
    // In a real implementation, you would generate and download a PDF confirmation
    // For now, we'll just open a print dialog with the confirmation details
    const confirmationContent = `
      <html>
        <head>
          <title>Confirmare Anulare - ${result.type === 'order' ? `Comanda #${result.order_id}` : `Bilet #${result.ticket_id}`}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin: 20px 0; }
            .amount { font-size: 1.2em; font-weight: bold; color: #059669; }
            .item { margin: 10px 0; padding: 10px; border: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Confirmare Anulare</h1>
            <p>Data: ${new Date().toLocaleDateString('ro-RO')}</p>
            <p>Ora: ${new Date().toLocaleTimeString('ro-RO')}</p>
          </div>
          
          <div class="details">
            <h2>${result.type === 'order' ? `Comanda #${result.order_id}` : `Bilet #${result.ticket_id}`} - ANULAT${result.type === 'order' ? 'Ă' : ''}</h2>
            
            <div class="amount">
              Suma returnată: ${formatRefundAmount(result.total_refund, result.currency)}
            </div>
            
            ${result.total_retained > 0 ? `
              <p>Suma reținută: ${formatRefundAmount(result.total_retained, result.currency)}</p>
            ` : ''}
            
            <div>
              ${result.details.map(detail => `
                <div class="item">
                  <strong>${detail.passenger_name || 'Pasager'}</strong><br>
                  Bilet #${detail.ticket_id}<br>
                  Retur: ${formatRefundAmount(detail.refund_amount, detail.currency)}
                  ${detail.retention_amount > 0 ? `<br>Reținere: ${formatRefundAmount(detail.retention_amount, detail.currency)}` : ''}
                </div>
              `).join('')}
            </div>
            
            <p><strong>Status:</strong> ${result.success ? 'Anulare completă cu succes' : 'Anulare cu probleme'}</p>
            
            ${result.refund_method ? `<p><strong>Metoda de retur:</strong> ${result.refund_method}</p>` : ''}
            ${result.refund_timeline ? `<p><strong>Timp estimat pentru retur:</strong> ${result.refund_timeline}</p>` : ''}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(confirmationContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Result Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.success ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="text-green-600">Anulare Completă cu Succes</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                <span className="text-red-600">Anulare cu Probleme</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {result.type === 'order' 
              ? `Comanda #${result.order_id} a fost anulată`
              : `Biletul #${result.ticket_id} a fost anulat`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <CreditCard className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600">
                  {formatRefundAmount(result.total_refund, result.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Suma care va fi returnată
                </div>
              </div>
              
              {result.total_retained > 0 && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">
                    {formatRefundAmount(result.total_retained, result.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Suma reținută (taxe anulare)
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {result.refund_method && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Metoda de retur:</label>
                  <div className="mt-1">{result.refund_method}</div>
                </div>
              )}
              
              {result.refund_timeline && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timp estimat:</label>
                  <div className="mt-1">{result.refund_timeline}</div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data anulării:</label>
                <div className="mt-1">{new Date().toLocaleDateString('ro-RO')} la {new Date().toLocaleTimeString('ro-RO')}</div>
              </div>
            </div>
          </div>
          
          {!result.success && result.error_message && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{result.error_message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalii Anulare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.details.map((detail, index) => (
              <div key={detail.ticket_id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">
                      {detail.passenger_name || `Pasager ${index + 1}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Bilet #{detail.ticket_id}
                    </p>
                  </div>
                  
                  <Badge variant={detail.refund_amount > 0 ? "default" : "secondary"}>
                    {detail.refund_amount > 0 ? "Returnat" : "Fără retur"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Suma originală:</span>
                    <div className="font-medium">
                      {formatRefundAmount(detail.original_price, detail.currency)}
                    </div>
                  </div>
                  
                  {detail.retention_amount > 0 && (
                    <div>
                      <span className="text-muted-foreground">Reținere:</span>
                      <div className="font-medium text-red-600">
                        {formatRefundAmount(detail.retention_amount, detail.currency)}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-muted-foreground">Suma returnată:</span>
                    <div className="font-medium text-green-600">
                      {formatRefundAmount(detail.refund_amount, detail.currency)}
                    </div>
                  </div>
                </div>
                
                {detail.baggage_refund && detail.baggage_refund > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>Bagaje returnat: {formatRefundAmount(detail.baggage_refund, detail.currency)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Informații Importante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Anularea este definitivă și nu poate fi inversată. Biletele anulate nu mai pot fi utilizate pentru călătorie.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-medium">Despre returul banilor:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Returul se va face pe aceeași metodă de plată utilizată la cumpărare</li>
                <li>Timpul de procesare poate varia în funcție de banca dumneavoastră</li>
                <li>Veți primi o confirmare prin email când returul a fost procesat</li>
                <li>Pentru întrebări, contactați serviciul nostru de asistență</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleDownloadConfirmation} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descarcă Confirmarea
            </Button>
            
            {onClose && (
              <Button onClick={onClose} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi
              </Button>
            )}
            
            {onReturnHome && (
              <Button onClick={onReturnHome} className="flex-1">
                Pagina Principală
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
