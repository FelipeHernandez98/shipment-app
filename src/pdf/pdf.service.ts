import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
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

    const htmlContent = this.generateHtmlTemplate(shipment);

    await page.setContent(htmlContent);
    const pdfPath = path.join(this.pdfDir, `${shipment.id}.pdf`);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });

    await browser.close();
    return pdfPath;
  }

  private generateHtmlTemplate(shipment: Shipment): string {
    return `
      <!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      background: #f3f3f3;
    }

    .page {
      width: 800px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #ddd;
    }

    /* HEADER */
    .top-header {
      padding: 20px;
      text-align: right;
      border-bottom: 1px solid #ddd;
    }

    .logo {
      font-size: 26px;
      font-weight: bold;
      color: #e30613;
    }

    .tagline {
      font-size: 12px;
      color: #999;
    }

    /* TITLE BAR */
    .title-bar {
      background: #000;
      color: #fff;
      padding: 15px 20px;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .content {
      padding: 20px;
    }

    /* TRACKING */
    .tracking-section {
      border-bottom: 2px solid #ddd;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }

    .tracking-label {
      font-size: 14px;
      font-weight: bold;
      color: #555;
    }

    .tracking-number {
      font-size: 32px;
      font-weight: bold;
      margin-top: 5px;
      letter-spacing: 2px;
    }

    /* SECTION TITLES */
    .section-title-red {
      background: #e30613;
      color: #fff;
      padding: 8px 10px;
      font-weight: bold;
      margin-top: 20px;
    }

    .section-title-black {
      background: #000;
      color: #fff;
      padding: 8px 10px;
      font-weight: bold;
      margin-top: 20px;
    }

    .info-row {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }

    .label {
      font-weight: bold;
      color: #333;
      display: inline-block;
      width: 120px;
    }

    /* FOOT GRID */
    .footer-grid {
      margin-top: 25px;
      border-top: 2px solid #000;
      display: flex;
    }

    .footer-col {
      flex: 1;
      padding: 15px;
      border-right: 1px solid #ccc;
    }

    .footer-col:last-child {
      border-right: none;
    }

    .footer-title {
      font-size: 12px;
      color: #555;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .footer-value {
      font-size: 16px;
      font-weight: bold;
    }

    .status-badge {
      display: inline-block;
      background: #000;
      color: #fff;
      padding: 5px 15px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .bottom-note {
      text-align: center;
      font-size: 11px;
      color: #777;
      padding: 15px;
      border-top: 1px solid #eee;
    }
  </style>
</head>

<body>
  <div class="page">

    <!-- HEADER -->
    <div class="top-header">
      <div class="logo">Shipments</div>
      <div class="tagline">Sistema de Envíos</div>
    </div>

    <!-- TITLE -->
    <div class="title-bar">
      GUÍA DE ENVÍO
    </div>

    <div class="content">

      <!-- TRACKING -->
      <div class="tracking-section">
        <div class="tracking-label">CÓDIGO DE SEGUIMIENTO:</div>
        <div class="tracking-number">
          ${shipment.trackingCode}
        </div>
      </div>

      <!-- REMITENTE -->
      <div class="section-title-red">REMITENTE</div>

      <div class="info-row">
        <span class="label">Nombre:</span>
        ${shipment.remitter ? `${shipment.remitter.name} ${shipment.remitter.lastname}` : 'N/A'}
      </div>

      <div class="info-row">
        <span class="label">Dirección:</span>
        ${shipment.remitter?.address || 'N/A'}, ${shipment.remitter?.city || 'N/A'}
      </div>

      <div class="info-row">
        <span class="label">Teléfono:</span>
        ${shipment.remitter?.phoneNumber || 'N/A'}
      </div>

      <!-- DESTINATARIO -->
      <div class="section-title-black">DESTINATARIO</div>

      <div class="info-row">
        <span class="label">Nombre:</span>
        ${shipment.recipient ? `${shipment.recipient.name} ${shipment.recipient.lastname}` : 'N/A'}
      </div>

      <div class="info-row">
        <span class="label">Dirección:</span>
        ${shipment.recipient?.address || 'N/A'}, ${shipment.recipient?.city || 'N/A'}
      </div>

      <div class="info-row">
        <span class="label">Teléfono:</span>
        ${shipment.recipient?.phoneNumber || 'N/A'}
      </div>

      <!-- FOOT DATA -->
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-title">Descripción del Paquete</div>
          <div class="footer-value">
            ${shipment.packageDescription || 'N/A'}
          </div>
        </div>

        <div class="footer-col">
          <div class="footer-title">Fecha de Envío</div>
          <div class="footer-value">
            ${shipment.sendDate.toLocaleDateString()}
          </div>
        </div>

        <div class="footer-col">
          <div class="footer-title">Estado</div>
          <div class="footer-value">
            <span class="status-badge">
              ${shipment.statusId === 1 ? 'ACTIVO' : 'ENTREGADO'}
            </span>
          </div>
        </div>
      </div>

    </div>

    <div class="bottom-note">
      Documento generado automáticamente por Shipments App
    </div>

  </div>
</body>
</html>

    `;
  }
}
