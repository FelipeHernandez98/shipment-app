import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as bwipjs from 'bwip-js';
import { Shipment } from '../shipment/entities/shipment.entity';
import { StorageService } from '../storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { Freight } from '../freight/entities/freight.entity';

@Injectable()
export class PdfService {
  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async generateShipmentGuide(shipment: Shipment): Promise<string> {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const browser = await puppeteer.launch({
      headless: true,
      // Required in container environments that run as root (e.g. Railway).
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      ...(executablePath ? { executablePath } : {}),
    });

    try {
      const page = await browser.newPage();
      const htmlContent = await this.generateHtmlTemplate(shipment);

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      const objectKey = this.buildObjectKey(shipment.id, shipment.sendDate);

      await this.storageService.uploadPdf(Buffer.from(pdfBuffer), objectKey, {
        metadata: {
          shipmentId: shipment.id,
          trackingCode: shipment.trackingCode,
        },
      });

      return objectKey;
    } finally {
      await browser.close();
    }
  }

  async generateFreightConsolidatedGuide(
    freight: Freight,
    shipments: Shipment[],
  ): Promise<string> {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      ...(executablePath ? { executablePath } : {}),
    });

    try {
      const page = await browser.newPage();
      const htmlContent = await this.generateFreightConsolidatedHtml(freight, shipments);

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      const objectKey = this.buildFreightObjectKey(freight.id);

      await this.storageService.uploadPdf(Buffer.from(pdfBuffer), objectKey, {
        metadata: {
          freightId: freight.id,
          guideCode: freight.guideCode,
          pages: String(shipments.length + 1),
        },
      });

      return objectKey;
    } finally {
      await browser.close();
    }
  }

  private buildObjectKey(shipmentId: string, sendDate?: Date | string): string {
    const baseDate = sendDate ? new Date(sendDate) : new Date();
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const pdfPrefix = this.configService.get<string>('r2.pdfPrefix') ?? 'shipments';
    const normalizedPrefix = pdfPrefix.replace(/^\/+|\/+$/g, '');

    return `${normalizedPrefix}/${year}/${month}/${shipmentId}.pdf`;
  }

  private buildFreightObjectKey(freightId: string): string {
    const baseDate = new Date();
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const pdfPrefix = this.configService.get<string>('r2.pdfPrefix') ?? 'shipments';
    const normalizedPrefix = pdfPrefix.replace(/^\/+|\/+$/g, '');
    const timestamp = Date.now();

    return `${normalizedPrefix}/freights/${year}/${month}/${freightId}/consolidated-${timestamp}.pdf`;
  }

  private async generateFreightConsolidatedHtml(
    freight: Freight,
    shipments: Shipment[],
  ): Promise<string> {
    const logoDataUrl = this.getBrandLogoDataUrl();
    const barcodeDataUrl = await this.generateTrackingBarcode(freight.guideCode);
    const generatedDate = new Date().toLocaleDateString('es-CO');

    const shipmentPages = await Promise.all(
      shipments.map(async (shipment, index) => {
        const shipmentBarcode = await this.generateTrackingBarcode(shipment.trackingCode);
        return this.buildShipmentPageHtml(shipment, shipmentBarcode, index + 1, shipments.length);
      }),
    );

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
      color: #000;
      background: #fff;
    }

    .pdf-page {
      width: 100%;
      min-height: 100%;
      border: 1px solid #000;
      padding: 16px;
      page-break-after: always;
    }

    .pdf-page:last-child {
      page-break-after: auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #000;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }

    .brand-logo {
      max-width: 220px;
      max-height: 52px;
      width: auto;
      height: auto;
      object-fit: contain;
    }

    .title-badge {
      border: 1px solid #000;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 10px;
    }

    .summary-card {
      border: 1px solid #000;
      border-radius: 8px;
      padding: 10px;
    }

    .summary-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .summary-value {
      font-size: 18px;
      font-weight: 700;
      word-break: break-word;
    }

    .barcode-wrap {
      margin-top: 14px;
      border: 1px solid #000;
      border-radius: 8px;
      text-align: center;
      padding: 12px;
    }

    .barcode {
      width: 280px;
      height: auto;
    }

    .barcode-caption {
      margin-top: 6px;
      font-size: 12px;
      font-weight: 700;
    }

    .track-card {
      border: 2px solid #000;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .track-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .track-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .track-number {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1.2px;
      word-break: break-all;
    }

    .route {
      border: 1px solid #000;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    .section {
      border: 1px solid #000;
      border-radius: 8px;
      overflow: hidden;
    }

    .section-title {
      background: #000;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 8px 10px;
    }

    .section-content {
      padding: 10px;
      font-size: 12px;
      line-height: 1.35;
      display: grid;
      gap: 6px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 10px;
    }

    .meta-item {
      border: 1px solid #000;
      border-radius: 8px;
      padding: 10px;
    }

    .meta-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 13px;
      font-weight: 700;
      word-break: break-word;
    }

    .page-index {
      text-align: right;
      font-size: 11px;
      margin-top: 8px;
      color: #333;
    }
  </style>
</head>
<body>
  <section class="pdf-page">
    <div class="header">
      <img class="brand-logo" src="${logoDataUrl}" alt="Marca Zenda" />
      <div class="title-badge">Guia de flete</div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">Ciudad origen</div>
        <div class="summary-value">${freight.originCity || 'N/A'}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Ciudad destino</div>
        <div class="summary-value">${freight.destinationCity || 'N/A'}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Cantidad de paquetes</div>
        <div class="summary-value">${shipments.length}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Fecha de generacion</div>
        <div class="summary-value">${generatedDate}</div>
      </div>
    </div>

    <div class="barcode-wrap">
      <img class="barcode" src="${barcodeDataUrl}" alt="Codigo de barras ${freight.guideCode}" />
      <div class="barcode-caption">GUIA FLETE: ${freight.guideCode}</div>
    </div>

    <div class="page-index">Pagina 1 de ${shipments.length + 1}</div>
  </section>

  ${shipmentPages.join('\n')}
</body>
</html>
`;
  }

  private buildShipmentPageHtml(
    shipment: Shipment,
    barcodeDataUrl: string,
    sequence: number,
    totalShipments: number,
  ): string {
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
    const formattedShipmentValue = this.formatShipmentValue(shipment.shipmentValue);

    return `
    <section class="pdf-page">
      <div class="track-card">
        <div class="track-label">Codigo de seguimiento</div>
        <div class="track-row">
          <div class="track-number">${shipment.trackingCode}</div>
          <img class="barcode" src="${barcodeDataUrl}" alt="Codigo ${shipment.trackingCode}" />
        </div>
      </div>

      <div class="route">
        <div>
          <div class="summary-label">Origen</div>
          <div class="summary-value">${originCity}</div>
        </div>
        <div style="font-size: 22px; font-weight: 700;">-></div>
        <div style="text-align: right;">
          <div class="summary-label">Destino</div>
          <div class="summary-value">${destinationCity}</div>
        </div>
      </div>

      <div class="section-grid">
        <div class="section">
          <div class="section-title">Remitente</div>
          <div class="section-content">
            <div><strong>Nombre:</strong> ${remitterName}</div>
            <div><strong>Direccion:</strong> ${shipment.remitter?.address || 'N/A'}, ${shipment.remitter?.city || 'N/A'}</div>
            <div><strong>Telefono:</strong> ${shipment.remitter?.phoneNumber || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Destinatario</div>
          <div class="section-content">
            <div><strong>Nombre:</strong> ${recipientName}</div>
            <div><strong>Direccion:</strong> ${shipment.recipient?.address || 'N/A'}, ${shipment.recipient?.city || 'N/A'}</div>
            <div><strong>Telefono:</strong> ${shipment.recipient?.phoneNumber || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-title">Descripcion del paquete</div>
          <div class="meta-value">${shipment.packageDescription || 'N/A'}</div>
        </div>
        <div class="meta-item">
          <div class="meta-title">Fecha de envio</div>
          <div class="meta-value">${shipmentDate}</div>
        </div>
        <div class="meta-item">
          <div class="meta-title">Valor a cobrar</div>
          <div class="meta-value">$ ${formattedShipmentValue}</div>
        </div>
      </div>

      <div class="page-index">Pagina ${sequence + 1} de ${totalShipments + 1}</div>
    </section>
    `;
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
    const formattedShipmentValue = this.formatShipmentValue(shipment.shipmentValue);

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
          <div class="meta-title">Valor a cobrar</div>
          <div class="meta-value">$ ${formattedShipmentValue}</div>
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

  private formatShipmentValue(shipmentValue?: string): string {
    if (!shipmentValue) return 'N/A';

    const numericOnly = shipmentValue.replace(/[^\d]/g, '');
    if (!numericOnly) return shipmentValue;

    const parsedValue = Number(numericOnly);
    if (Number.isNaN(parsedValue)) return shipmentValue;

    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parsedValue);
  }

  private getBrandLogoDataUrl(): string {
    const logoPath = path.join(process.cwd(), 'src', 'pdf', 'assets', 'MarcaZenda.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  }
}
