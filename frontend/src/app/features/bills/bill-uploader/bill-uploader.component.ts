import { Component } from '@angular/core';
import { BillService } from '../bill.service'

@Component({
  selector: 'app-bill-uploader',
  templateUrl: './bill-uploader.component.html',
  styleUrls: ['./bill-uploader.component.scss']
})
export class BillUploaderComponent {
  file: File | null = null;
  extracting = false;
  processing = false;
  extractedText = '';
  redacted = '';
  pii: any[] = [];
  billId: string | null = null;
  reportUrl: string | null = null;
  includePII = false;

  constructor(private billService: BillService) {}

  onFileChange(e: any) {
    const f = e.target.files && e.target.files[0];
    if (f) this.file = f;
  }

  async upload() {
    if (!this.file) return;
    this.extracting = true;
    try {
      const res: any = await this.billService.upload(this.file).toPromise();
      this.billId = res.id;
      if (this.billId) {
        const extract: any = await this.billService.extract(this.billId).toPromise();
        this.extractedText = extract.text || '';
        this.redacted = extract.redacted || '';
        this.pii = extract.pii || [];
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.extracting = false;
    }
  }

  async process() {
    if (!this.billId) return;
    this.processing = true;
    try {
  // save consent preference
  await this.billService.setConsent(this.billId, this.includePII).toPromise();
  const res: any = await this.billService.process(this.billId).toPromise();
      this.reportUrl = res.reportPdf;
    } catch (e) {
      console.error(e);
    } finally {
      this.processing = false;
    }
  }

  downloadReport() {
    if (!this.reportUrl) return;
    window.open(this.reportUrl, '_blank');
  }
}
