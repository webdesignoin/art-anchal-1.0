import React from "react";
import { ArrowLeft, Printer } from "lucide-react";

export interface InvoiceData {
  invoice_number: string;
  created_at?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  payment_mode: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  is_offline?: boolean;
  items: Array<{
    saree?: {
      name?: string;
      weaving_technique?: string;
      zari_type?: string;
      material?: string;
      price?: number;
    };
    product_name?: string;
    unit_price?: number;
    quantity: number;
  }>;
}

interface InvoiceDocumentProps {
  invoice: InvoiceData;
  onBack: () => void;
}

export default function InvoiceDocument({ invoice, onBack }: InvoiceDocumentProps) {
  const getSareeName = (item: any) => item.saree?.name || item.product_name || "Handloom Saree";
  const getUnitPrice = (item: any) => item.saree?.price || item.unit_price || 0;
  
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Print toolbar */}
      <div className="flex justify-between items-center mb-5 print:hidden">
        <button onClick={onBack}
          className="flex items-center gap-2 text-xs text-brand-warm-gray hover:text-brand-maroon uppercase tracking-wider font-bold transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => window.print()}
          className="bg-brand-maroon text-brand-ivory text-xs uppercase tracking-widest px-6 py-3 font-bold flex items-center gap-2 hover:bg-brand-maroon/90 transition shadow">
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      {/* Invoice document */}
      <div id="printable-invoice-area" className="bg-white border-2 border-brand-gold/30 p-8 sm:p-12 space-y-8 shadow-2xl print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b-[3px] border-double border-brand-maroon/30 pb-6">
          <div className="space-y-1.5">
            <h1 className="font-serif text-3.5xl text-brand-maroon tracking-wider font-light">Art&Anchal</h1>
            <p className="text-[10.5px] text-brand-warm-gray leading-relaxed font-sans">
              Varanasi Handloom Boutique & Weaving Cooperative<br />
              Vishwanath Gali, Kotwalipura, Lahori Tola, Varanasi, UP 221001<br />
              <span className="font-semibold text-brand-maroon">GSTIN: 09AAHCA9923P1ZH</span> &nbsp;|&nbsp; +91 75250 51124
            </p>
          </div>
          <div className="text-right space-y-1.5 flex-shrink-0 ml-4">
            <span className="bg-brand-maroon text-brand-ivory text-[8.5px] uppercase tracking-[0.2em] font-sans font-bold px-3 py-1.5 inline-block">
              TAX INVOICE
            </span>
            <p className="text-xs font-mono font-bold text-brand-maroon block pt-2.5">{invoice.invoice_number}</p>
            <p className="text-[10px] font-mono text-brand-warm-gray">
              Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 text-[11px]">
          <div className="space-y-1">
            <h5 className="font-bold uppercase tracking-wider text-brand-gold text-[9px]">Bill To:</h5>
            <p className="font-serif font-semibold text-base text-brand-maroon">{invoice.customer_name}</p>
            {invoice.customer_phone && <p className="text-brand-warm-gray">📱 {invoice.customer_phone}</p>}
            {invoice.customer_email && <p className="text-brand-warm-gray">{invoice.customer_email}</p>}
            {invoice.is_offline ? (
              <p className="text-brand-warm-gray">Varanasi Showroom Walk-in</p>
            ) : (
              <p className="text-brand-warm-gray">Online Acquisition</p>
            )}
          </div>
          <div className="space-y-1 text-right">
            <h5 className="font-bold uppercase tracking-wider text-brand-gold text-[9px]">Payment Info:</h5>
            <p className="font-bold uppercase text-brand-maroon">{invoice.payment_mode}</p>
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">PAID ✓</span>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-brand-maroon/20 text-[10px] uppercase font-bold text-brand-maroon">
              <th className="py-2.5">Item Description</th>
              <th className="py-2.5 text-center">Qty</th>
              <th className="py-2.5 text-right">Unit Price</th>
              <th className="py-2.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gold/15">
            {invoice.items?.map((item: any, idx: number) => {
              const uPrice = getUnitPrice(item);
              return (
                <tr key={idx}>
                  <td className="py-3.5">
                    <p className="font-serif font-semibold text-[13px] text-brand-maroon">{getSareeName(item)}</p>
                    <p className="text-[9px] text-brand-gold uppercase mt-0.5">
                      {item.saree?.weaving_technique || ""} {item.saree?.zari_type ? `• ${item.saree.zari_type}` : ""}
                    </p>
                    {item.saree?.material && <p className="text-[9px] text-brand-warm-gray">{item.saree.material}</p>}
                  </td>
                  <td className="py-3.5 text-center font-mono">{item.quantity}</td>
                  <td className="py-3.5 text-right font-mono">₹{Number(uPrice).toLocaleString("en-IN")}</td>
                  <td className="py-3.5 text-right font-mono font-bold">₹{Number(uPrice * item.quantity).toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t-2 border-brand-maroon/10 pt-5">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-brand-warm-gray">
              <span>Subtotal</span>
              <span className="font-mono">₹{Number(invoice.subtotal).toLocaleString("en-IN")}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="font-mono">−₹{Number(invoice.discount).toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-brand-warm-gray">
              <span>CGST @ 2.5%</span>
              <span className="font-mono">₹{Math.round(invoice.tax / 2).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-brand-warm-gray">
              <span>SGST @ 2.5%</span>
              <span className="font-mono">₹{Math.round(invoice.tax / 2).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-brand-maroon/20 pt-2.5 text-brand-maroon">
              <span>Grand Total</span>
              <span className="font-mono">₹{Number(invoice.total).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-brand-gold/20 pt-6 text-center space-y-2">
          {invoice.notes && (
            <p className="text-[10px] text-brand-warm-gray italic">Notes: {invoice.notes}</p>
          )}
          <p className="text-[10px] text-brand-warm-gray">
            Thank you for choosing Art&Anchal — Preserving Varanasi's living heritage, one thread at a time.
          </p>
          <p className="text-[9px] text-brand-warm-gray font-mono">
            * Handloom sarees: GST @ 5% (CGST 2.5% + SGST 2.5%) as per Notification No. 1/2017-CT(Rate) &nbsp;|&nbsp; E&OE
          </p>
        </div>
      </div>
    </div>
  );
}
