import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as bwipjs from 'bwip-js';
import { Shipment } from '../shipment/entities/shipment.entity';

@Injectable()
export class PdfService {
  private readonly pdfDir = path.join(process.cwd(), 'uploads', 'pdfs');

  constructor() {
    if (!fs.existsSync(this.pdfDir)) {
      fs.mkdirSync(this.pdfDir, { recursive: true });
    }
  }

  async generateShipmentGuide(shipment: Shipment): Promise<string> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = await this.generateHtmlTemplate(shipment);

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfPath = path.join(this.pdfDir, `${shipment.id}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });

    await browser.close();
    return pdfPath;
  }

  private async generateHtmlTemplate(shipment: Shipment): Promise<string> {
    const barcodeDataUrl = await this.generateTrackingBarcode(shipment.trackingCode);
    const logoDataUrl = this.getBrandLogoDataUrl();
    const remitterName = shipment.remitter
      ? `${shipment.remitter.name} ${shipment.remitter.lastname}`
      : 'N/A';
    const recipientName = shipment.recipient
      ? `${shipment.recipient.name} ${shipment.recipient.lastname}`
      : 'N/A';
    const originCity = shipment.remitter?.city?.toUpperCase() || 'N/A';
    const destinationCity = shipment.recipient?.city?.toUpperCase() || 'N/A';
    const shipmentDate = shipment.sendDate
      ? new Date(shipment.sendDate).toLocaleDateString('es-CO')
      : 'N/A';

    return `
      <!DOCTYPE html>
<html>
<head>
  <style>
    * {
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 10mm;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      background: #fff;
      color: #000;
    }

    .page {
      width: 100%;
      max-width: 780px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #000;
      border-radius: 0;
      overflow: visible;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      margin: 12px 20px 0;
      border: 1px solid #000;
      border-radius: 8px;
      background: #fff;
    }

    .brand-logo {
      max-width: 220px;
      max-height: 52px;
      width: auto;
      height: auto;
      object-fit: contain;
    }

    .guide-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: #000;
      border: 1px solid #000;
      padding: 8px 10px;
      border-radius: 6px;
    }

    .content {
      padding: 20px;
      display: grid;
      gap: 14px;
    }

    .tracking-card {
      border: 2px solid #000;
      border-radius: 8px;
      padding: 12px;
      background: #fff;
      display: grid;
      gap: 8px;
    }

    .route-card {
      border: 2px solid #000;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: #fff;
    }

    .route-city {
      flex: 1;
      min-width: 0;
    }

    .route-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
    }

    .route-value {
      font-size: 17px;
      font-weight: 700;
      word-break: break-word;
    }

    .route-arrow {
      font-size: 22px;
      font-weight: 700;
      line-height: 1;
      padding: 0 4px;
    }

    .tracking-label {
      font-size: 11px;
      color: #000;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .tracking-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .tracking-number-wrap {
      flex: 1;
      min-width: 0;
    }

    .tracking-number {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1.6px;
      color: #000;
      word-break: break-all;
    }

    .barcode-wrap {
      flex: 0 0 auto;
      text-align: center;
    }

    .barcode {
      width: 220px;
      height: auto;
    }

    .barcode-caption {
      margin-top: 4px;
      font-size: 10px;
      bold: 700;
      color: #000;
      letter-spacing: 0.4px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .section {
      border: 1px solid #000;
      border-radius: 8px;
      overflow: hidden;
      background: #fff;
      min-width: 0;
    }

    .section-title {
      background: #000;
      color: #fff;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .section-body {
      padding: 10px;
      display: grid;
      gap: 8px;
    }

    .info-row {
      border-bottom: 1px solid #000;
      padding-bottom: 6px;
      font-size: 13px;
      line-height: 1.35;
    }

    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .label {
      font-weight: 700;
      color: #000;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 12px;
    }

    .meta-card {
      border: 1px solid #000;
      border-radius: 8px;
      padding: 10px;
      background: #fff;
      min-width: 0;
    }

    .meta-title {
      font-size: 11px;
      color: #000;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 14px;
      font-weight: 700;
      color: #000;
      word-break: break-word;
    }

    .status-badge {
      display: inline-block;
      background: #000;
      color: #fff;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 700;
      letter-spacing: 0.4px;
      font-size: 11px;
    }

    .bottom-note {
      text-align: center;
      font-size: 10px;
      color: #000;
      padding: 10px 16px 16px;
      border-top: 1px solid #000;
    }

    @media print {
      body {
        background: #fff;
      }

      .page {
        border-radius: 0;
        border: 1px solid #000;
      }
    }
  </style>
</head>

<body>
  <div class="page">

    <div class="header">
      <img class="brand-logo" src="${logoDataUrl}" alt="Marca Zenda" />
      <div class="guide-title">Guía de envío</div>
    </div>

    <div class="content">

      <div class="tracking-card">
        <div class="tracking-label">CÓDIGO DE SEGUIMIENTO:</div>
        <div class="tracking-content">
          <div class="tracking-number-wrap">
            <div class="tracking-number">${shipment.trackingCode}</div>
          </div>
          <div class="barcode-wrap">
            <img class="barcode" src="${barcodeDataUrl}" alt="Código de barras ${shipment.trackingCode}" />
            <div class="barcode-caption">GUIA No. ${shipment.trackingCode}</div>
          </div>
        </div>
      </div>

      <div class="route-card">
        <div class="route-city">
          <div class="route-label">Ciudad origen</div>
          <div class="route-value">${originCity}</div>
        </div>
        <div class="route-arrow">→</div>
        <div class="route-city" style="text-align: right;">
          <div class="route-label">Ciudad destino</div>
          <div class="route-value">${destinationCity}</div>
        </div>
      </div>

      <div class="grid-2">
        <div class="section">
          <div class="section-title">Remitente</div>
          <div class="section-body">
            <div class="info-row"><span class="label">Nombre:</span> ${remitterName}</div>
            <div class="info-row"><span class="label">Dirección:</span> ${shipment.remitter?.address || 'N/A'}, ${shipment.remitter?.city || 'N/A'}</div>
            <div class="info-row"><span class="label">Teléfono:</span> ${shipment.remitter?.phoneNumber || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Destinatario</div>
          <div class="section-body">
            <div class="info-row"><span class="label">Nombre:</span> ${recipientName}</div>
            <div class="info-row"><span class="label">Dirección:</span> ${shipment.recipient?.address || 'N/A'}, ${shipment.recipient?.city || 'N/A'}</div>
            <div class="info-row"><span class="label">Teléfono:</span> ${shipment.recipient?.phoneNumber || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <div class="meta-title">Descripción del paquete</div>
          <div class="meta-value">${shipment.packageDescription || 'N/A'}</div>
        </div>

        <div class="meta-card">
          <div class="meta-title">Fecha de envío</div>
          <div class="meta-value">${shipmentDate}</div>
        </div>

        <div class="meta-card">
          <div class="meta-title">Estado</div>
          <div class="meta-value"><span class="status-badge">${shipment.statusId === 1 ? 'ACTIVO' : 'ENTREGADO'}</span></div>
        </div>
      </div>

    </div>

    <div class="bottom-note">
      Documento generado automáticamente por Zenda
    </div>

  </div>
</body>
</html>

    `;
  }

  private async generateTrackingBarcode(trackingCode: string): Promise<string> {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: trackingCode,
      scale: 2,
      height: 10,
      includetext: false,
      backgroundcolor: 'FFFFFF',
    });

    return `data:image/png;base64,${png.toString('base64')}`;
  }

  private getBrandLogoDataUrl(): string {
    const logoPath = path.join(process.cwd(), 'src', 'pdf', 'assets', 'MarcaZenda.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  }
}
